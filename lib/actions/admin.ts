"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

const categorySchema = z.object({
  name: z.string().min(2).max(40),
  icon: z.string().min(1),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/, "Warna harus format hex #RRGGBB"),
});

export async function createCategoryAction(_prev: { error?: string } | null, formData: FormData) {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    icon: formData.get("icon"),
    color: formData.get("color"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const slug = slugify(parsed.data.name);
  const exists = await prisma.category.findFirst({ where: { OR: [{ slug }, { name: parsed.data.name }] } });
  if (exists) return { error: "Kategori sudah ada." };

  const count = await prisma.category.count();
  await prisma.category.create({
    data: { name: parsed.data.name, slug, icon: parsed.data.icon, color: parsed.data.color, order: count + 1 },
  });
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  const inUse = await prisma.bounty.count({ where: { categoryId: id } });
  if (inUse > 0) return { error: "Kategori dipakai oleh bounty dan tidak bisa dihapus." };
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { ok: true };
}

const settingsSchema = z.object({
  adminFeePercent: z.coerce.number().int().min(0).max(50),
  minBounty: z.coerce.number().int().min(0),
  tokenPrice: z.coerce.number().int().min(1000),
  freeTokens: z.coerce.number().int().min(0).max(20),
});

export async function updateSettingsAction(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    adminFeePercent: formData.get("adminFeePercent"),
    minBounty: formData.get("minBounty"),
    tokenPrice: formData.get("tokenPrice"),
    freeTokens: formData.get("freeTokens"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await prisma.setting.upsert({ where: { id: 1 }, update: parsed.data, create: { id: 1, ...parsed.data } });
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function setUserRoleAction(userId: string, role: "ADMIN" | "SPONSOR" | "SEEKER") {
  const admin = await requireAdmin();
  if (userId === admin.id) return { error: "Tidak bisa mengubah peran diri sendiri." };
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function toggleBanAction(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return { error: "Tidak bisa menonaktifkan diri sendiri." };
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User tidak ditemukan." };
  await prisma.user.update({
    where: { id: userId },
    data: { bannedAt: user.bannedAt ? null : new Date() },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function grantTokensAction(userId: string, amount: number) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { paidTokens: { increment: amount } } });
  revalidatePath("/admin/users");
  return { ok: true };
}
