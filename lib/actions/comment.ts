"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  bountyId: z.string().min(1),
  content: z.string().trim().min(1, "Komentar tidak boleh kosong").max(1000),
});

export type CommentState = { error?: string; ok?: boolean } | null;

export async function postCommentAction(_prev: CommentState, formData: FormData): Promise<CommentState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = schema.safeParse({
    bountyId: formData.get("bountyId"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const bounty = await prisma.bounty.findUnique({
    where: { id: parsed.data.bountyId },
    select: { slug: true, status: true },
  });
  if (!bounty || bounty.status === "PENDING_PAYMENT") return { error: "Bounty tidak ditemukan." };

  await prisma.comment.create({
    data: { bountyId: parsed.data.bountyId, userId: user.id, content: parsed.data.content },
  });

  revalidatePath(`/bounties/${bounty.slug}`);
  return { ok: true };
}
