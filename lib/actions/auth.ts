"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  createToken,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(60),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  role: z.enum(["SPONSOR", "SEEKER"]),
});

export type AuthState = { error?: string } | null;

const COLORS = ["#2f56f5", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444"];

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "Email sudah terdaftar. Silakan masuk." };

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role,
      avatarColor: COLORS[Math.floor(name.length % COLORS.length)],
    },
  });

  const token = await createToken({
    sub: user.id,
    email: user.email,
    role: user.role as "ADMIN" | "SPONSOR" | "SEEKER",
    name: user.name,
  });
  cookies().set(SESSION_COOKIE, token, COOKIE_OPTS);
  redirect("/dashboard");
}

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Masukkan kata sandi"),
});

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return { error: "Email atau kata sandi salah." };
  if (!user.passwordHash) {
    return { error: 'Akun ini terhubung dengan Google. Gunakan tombol "Lanjutkan dengan Google".' };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email atau kata sandi salah." };
  }
  if (user.bannedAt) return { error: "Akun Anda dinonaktifkan. Hubungi admin." };

  const token = await createToken({
    sub: user.id,
    email: user.email,
    role: user.role as "ADMIN" | "SPONSOR" | "SEEKER",
    name: user.name,
  });
  cookies().set(SESSION_COOKIE, token, COOKIE_OPTS);
  redirect("/dashboard");
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE);
  redirect("/");
}
