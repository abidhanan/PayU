"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { availableTokens, consumeToken } from "@/lib/tokens";
import { createQrisPayment } from "@/lib/payment";
import { slugify } from "@/lib/utils";

function makeRef(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(performance.now() * 1000)
    .toString(36)
    .slice(-4)}`.toUpperCase();
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let i = 1;
  while (await prisma.bounty.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

const bountySchema = z.object({
  title: z.string().min(6, "Judul minimal 6 karakter").max(120),
  categoryId: z.string().min(1, "Pilih kategori"),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  requirements: z.string().max(2000).optional().default(""),
  bountyAmount: z.coerce.number().int().positive("Bounty harus lebih dari 0"),
  deadline: z.string().min(1, "Pilih tenggat waktu"),
});

export type BountyState = { error?: string } | null;

/** Sponsor creates a bounty. It stays PENDING_PAYMENT until QRIS is paid. */
export async function createBountyAction(_prev: BountyState, formData: FormData): Promise<BountyState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SPONSOR") redirect("/login");

  const parsed = bountySchema.safeParse({
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    requirements: formData.get("requirements") ?? "",
    bountyAmount: formData.get("bountyAmount"),
    deadline: formData.get("deadline"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;
  const settings = await getSettings();

  if (data.bountyAmount < settings.minBounty) {
    return { error: `Bounty minimal ${settings.minBounty.toLocaleString("id-ID")} Rupiah.` };
  }
  const deadline = new Date(data.deadline);
  if (isNaN(deadline.getTime()) || deadline.getTime() < Date.now()) {
    return { error: "Tenggat waktu harus di masa depan." };
  }

  const adminFee = Math.round((data.bountyAmount * settings.adminFeePercent) / 100);
  const totalPaid = data.bountyAmount + adminFee;
  const slug = await uniqueSlug(data.title);

  const bounty = await prisma.bounty.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      requirements: data.requirements || "",
      bountyAmount: data.bountyAmount,
      adminFee,
      totalPaid,
      deadline,
      categoryId: data.categoryId,
      sponsorId: user.id,
      status: "PENDING_PAYMENT",
    },
  });

  const reference = makeRef("BTY");
  const qris = await createQrisPayment({
    amount: totalPaid,
    reference,
    description: `Bounty: ${data.title.slice(0, 40)}`,
  });

  const payment = await prisma.payment.create({
    data: {
      reference,
      type: "BOUNTY_POST",
      amount: totalPaid,
      userId: user.id,
      bountyId: bounty.id,
      qrisString: qris.qrisString,
      qrisImage: qris.qrisImage,
      externalId: qris.externalId,
      expiresAt: qris.expiresAt,
    },
  });

  redirect(`/pay/${payment.id}`);
}

const submitSchema = z.object({
  bountyId: z.string().min(1),
  link: z.string().url("Masukkan URL yang valid (mis. tautan karya/GitHub)"),
  note: z.string().min(10, "Ceritakan sedikit tentang karyamu (min 10 karakter)").max(1000),
});

export type SubmitState = { error?: string; ok?: boolean } | null;

/** Seeker submits a solution. Requires >=1 available token. */
export async function submitSolutionAction(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") redirect("/login");

  const parsed = submitSchema.safeParse({
    bountyId: formData.get("bountyId"),
    link: formData.get("link"),
    note: formData.get("note"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (availableTokens(user) < 1) {
    return { error: "Token kamu habis. Top up token untuk ikut mengerjakan tugas." };
  }

  const bounty = await prisma.bounty.findUnique({ where: { id: parsed.data.bountyId } });
  if (!bounty || bounty.status !== "OPEN") return { error: "Bounty ini tidak menerima submission." };
  if (bounty.deadline.getTime() < Date.now()) return { error: "Tenggat waktu bounty sudah lewat." };

  const existing = await prisma.submission.findUnique({
    where: { bountyId_seekerId: { bountyId: bounty.id, seekerId: user.id } },
  });
  if (existing) return { error: "Kamu sudah mengirim submission untuk bounty ini." };

  await prisma.submission.create({
    data: {
      bountyId: bounty.id,
      seekerId: user.id,
      link: parsed.data.link,
      note: parsed.data.note,
    },
  });

  revalidatePath(`/bounties/${bounty.slug}`);
  return { ok: true };
}

const editSchema = z.object({
  submissionId: z.string().min(1),
  link: z.string().url("Masukkan URL yang valid (mis. tautan karya/GitHub)"),
  note: z.string().min(10, "Ceritakan sedikit tentang karyamu (min 10 karakter)").max(1000),
});

/** Seeker edits their own submission while the bounty is still open. */
export async function editSubmissionAction(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") redirect("/login");

  const parsed = editSchema.safeParse({
    submissionId: formData.get("submissionId"),
    link: formData.get("link"),
    note: formData.get("note"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const submission = await prisma.submission.findUnique({
    where: { id: parsed.data.submissionId },
    include: { bounty: { select: { slug: true, status: true, deadline: true } } },
  });
  if (!submission || submission.seekerId !== user.id) return { error: "Submission tidak ditemukan." };
  if (submission.bounty.status !== "OPEN") return { error: "Bounty ini tidak lagi menerima perubahan." };
  if (submission.bounty.deadline.getTime() < Date.now()) return { error: "Tenggat waktu bounty sudah lewat." };

  await prisma.submission.update({
    where: { id: submission.id },
    data: { link: parsed.data.link, note: parsed.data.note },
  });

  revalidatePath(`/bounties/${submission.bounty.slug}`);
  return { ok: true };
}

/** Sponsor (owner) or admin picks the winning submission. */
export async function selectWinnerAction(bountyId: string, submissionId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const bounty = await prisma.bounty.findUnique({ where: { id: bountyId } });
  if (!bounty) return { error: "Bounty tidak ditemukan." };
  if (user.role !== "ADMIN" && bounty.sponsorId !== user.id) return { error: "Tidak diizinkan." };
  if (bounty.status === "COMPLETED") return { error: "Pemenang sudah dipilih." };
  if (bounty.status !== "OPEN" && bounty.status !== "IN_REVIEW") {
    return { error: "Bounty belum bisa dinilai." };
  }

  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.bountyId !== bountyId) return { error: "Submission tidak valid." };

  await prisma.$transaction([
    prisma.submission.update({ where: { id: submissionId }, data: { status: "WINNER" } }),
    prisma.submission.updateMany({
      where: { bountyId, id: { not: submissionId } },
      data: { status: "REJECTED" },
    }),
    prisma.bounty.update({
      where: { id: bountyId },
      data: { status: "COMPLETED", winnerId: submission.seekerId },
    }),
    prisma.user.update({
      where: { id: submission.seekerId },
      data: { earnings: { increment: bounty.bountyAmount } },
    }),
  ]);

  // Winning consumes exactly one token; losers keep theirs.
  await consumeToken(submission.seekerId);

  revalidatePath(`/bounties/${bounty.slug}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function cancelBountyAction(bountyId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const bounty = await prisma.bounty.findUnique({ where: { id: bountyId } });
  if (!bounty) return { error: "Bounty tidak ditemukan." };
  if (user.role !== "ADMIN" && bounty.sponsorId !== user.id) return { error: "Tidak diizinkan." };
  if (bounty.status === "COMPLETED") return { error: "Bounty selesai tidak bisa dibatalkan." };

  await prisma.bounty.update({ where: { id: bountyId }, data: { status: "CANCELLED" } });
  revalidatePath("/dashboard");
  return { ok: true };
}
