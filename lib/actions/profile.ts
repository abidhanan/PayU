"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import {
  SESSION_COOKIE,
  createToken,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(60),
  bio: z.string().max(280, "Bio maksimal 280 karakter").optional().default(""),
});

const MAX_IMAGE = 1_500_000; // ~1.5 MB

export type ProfileState = { error?: string; ok?: boolean } | null;

export async function updateProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data: { name: string; bio: string | null; image?: string | null } = {
    name: parsed.data.name,
    bio: parsed.data.bio || null,
  };

  if (formData.get("removeImage") === "1") {
    data.image = null;
  } else {
    const file = formData.get("photo");
    if (file && file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) return { error: "File harus berupa gambar." };
      if (file.size > MAX_IMAGE) return { error: "Ukuran gambar maksimal 1,5 MB." };
      const buf = Buffer.from(await file.arrayBuffer());
      data.image = `data:${file.type};base64,${buf.toString("base64")}`;
    }
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });

  // Refresh the session cookie so the navbar reflects the new name immediately.
  const token = await createToken({
    sub: updated.id,
    email: updated.email,
    role: updated.role as "ADMIN" | "SPONSOR" | "SEEKER",
    name: updated.name,
  });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

const passwordSchema = z
  .object({
    current: z.string().optional().default(""),
    next: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { message: "Konfirmasi kata sandi tidak cocok", path: ["confirm"] });

export async function changePasswordAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = passwordSchema.safeParse({
    current: formData.get("current") ?? "",
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // If the account already has a password, require the current one.
  if (user.passwordHash) {
    if (!parsed.data.current) return { error: "Masukkan kata sandi saat ini." };
    const ok = await verifyPassword(parsed.data.current, user.passwordHash);
    if (!ok) return { error: "Kata sandi saat ini salah." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.next) },
  });

  return { ok: true };
}
