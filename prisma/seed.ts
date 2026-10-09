import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const CATEGORIES = [
  { name: "Development", icon: "code", color: "#2f56f5", order: 1 },
  { name: "Design", icon: "palette", color: "#8b5cf6", order: 2 },
  { name: "Content", icon: "pen-tool", color: "#f59e0b", order: 3 },
  { name: "Marketing", icon: "megaphone", color: "#ef4444", order: 4 },
  { name: "Video", icon: "video", color: "#ec4899", order: 5 },
  { name: "Research", icon: "search", color: "#10b981", order: 6 },
];

async function main() {
  const password = await bcrypt.hash("password123", 10);
  const monthKey = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  })();

  // Settings
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, adminFeePercent: 10, minBounty: 50000, tokenPrice: 5000, freeTokens: 3 },
  });

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@payu.id" },
    update: {},
    create: {
      email: "admin@payu.id",
      passwordHash: password,
      name: "Admin PayU",
      role: "ADMIN",
      avatarColor: "#1832b8",
    },
  });

  const sponsor = await prisma.user.upsert({
    where: { email: "sponsor@payu.id" },
    update: {},
    create: {
      email: "sponsor@payu.id",
      passwordHash: password,
      name: "Nusantara Labs",
      role: "SPONSOR",
      bio: "Studio produk digital yang membangun masa depan pembayaran.",
      avatarColor: "#2f56f5",
    },
  });

  const seeker = await prisma.user.upsert({
    where: { email: "seeker@payu.id" },
    update: {},
    create: {
      email: "seeker@payu.id",
      passwordHash: password,
      name: "Rani Pratama",
      role: "SEEKER",
      bio: "Full-stack developer & UI enthusiast.",
      avatarColor: "#10b981",
      freeTokens: 3,
      paidTokens: 2,
      tokenResetKey: monthKey,
    },
  });

  const seeker2 = await prisma.user.upsert({
    where: { email: "seeker2@payu.id" },
    update: {},
    create: {
      email: "seeker2@payu.id",
      passwordHash: password,
      name: "Budi Santoso",
      role: "SEEKER",
      avatarColor: "#f59e0b",
      freeTokens: 3,
      tokenResetKey: monthKey,
    },
  });

  // Categories
  const cats: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: slugify(c.name) },
      update: { icon: c.icon, color: c.color, order: c.order },
      create: { name: c.name, slug: slugify(c.name), icon: c.icon, color: c.color, order: c.order },
    });
    cats[c.name] = cat.id;
  }

  // Sample bounties
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const samples = [
    {
      title: "Bangun Landing Page untuk Dompet Digital PayU",
      category: "Development",
      bounty: 3000000,
      description:
        "Kami mencari developer untuk membangun landing page yang cepat dan responsif menggunakan Next.js. Halaman harus memiliki skor Lighthouse 90+ dan mendukung mode gelap/terang.",
      requirements: "Next.js + Tailwind\nLighthouse 90+\nResponsif mobile & desktop\nAnimasi halus",
      deadline: now + 10 * day,
      status: "OPEN" as const,
    },
    {
      title: "Desain Ikon & Ilustrasi untuk Kategori Bounty",
      category: "Design",
      bounty: 1500000,
      description:
        "Buat satu set 12 ikon kategori yang konsisten dengan brand PayU (biru royal). Format SVG, gaya line + solid.",
      requirements: "12 ikon SVG\nKonsisten dengan brand biru\nFile sumber Figma",
      deadline: now + 6 * day,
      status: "OPEN" as const,
    },
    {
      title: "Tulis 5 Artikel SEO tentang Ekonomi Kreator",
      category: "Content",
      bounty: 1000000,
      description:
        "Butuh 5 artikel (masing-masing 800-1000 kata) seputar ekonomi kreator dan pembayaran digital di Indonesia.",
      requirements: "5 artikel original\n800-1000 kata\nOptimasi SEO\nBahasa Indonesia",
      deadline: now + 4 * day,
      status: "OPEN" as const,
    },
    {
      title: "Kampanye Media Sosial Peluncuran Produk",
      category: "Marketing",
      bounty: 2000000,
      description:
        "Rancang dan jalankan konsep kampanye media sosial 2 minggu untuk peluncuran fitur baru PayU.",
      requirements: "Konsep kampanye\nKalender konten\nCopywriting\nRekomendasi channel",
      deadline: now + 14 * day,
      status: "OPEN" as const,
    },
    {
      title: "Video Explainer 60 Detik tentang QRIS",
      category: "Video",
      bounty: 2500000,
      description:
        "Produksi video animasi 60 detik yang menjelaskan cara pembayaran QRIS di PayU dengan gaya menarik.",
      requirements: "Durasi 60 detik\nAnimasi + voice over\nFormat MP4 1080p",
      deadline: now + 12 * day,
      status: "OPEN" as const,
    },
  ];

  for (const s of samples) {
    const settings = await prisma.setting.findUnique({ where: { id: 1 } });
    const fee = Math.round((s.bounty * (settings?.adminFeePercent ?? 10)) / 100);
    const slug = slugify(s.title);
    await prisma.bounty.upsert({
      where: { slug },
      update: {},
      create: {
        title: s.title,
        slug,
        description: s.description,
        requirements: s.requirements,
        status: s.status,
        bountyAmount: s.bounty,
        adminFee: fee,
        totalPaid: s.bounty + fee,
        deadline: new Date(s.deadline),
        categoryId: cats[s.category],
        sponsorId: sponsor.id,
      },
    });
  }

  // A couple submissions on the first bounty
  const first = await prisma.bounty.findUnique({ where: { slug: slugify(samples[0].title) } });
  if (first) {
    await prisma.submission.upsert({
      where: { bountyId_seekerId: { bountyId: first.id, seekerId: seeker.id } },
      update: {},
      create: {
        bountyId: first.id,
        seekerId: seeker.id,
        link: "https://github.com/rani/payu-landing",
        note: "Sudah termasuk mode gelap/terang dan skor Lighthouse 98.",
      },
    });
    await prisma.submission.upsert({
      where: { bountyId_seekerId: { bountyId: first.id, seekerId: seeker2.id } },
      update: {},
      create: {
        bountyId: first.id,
        seekerId: seeker2.id,
        link: "https://budi.dev/payu",
        note: "Versi dengan animasi scroll dan section testimoni.",
      },
    });
  }

  console.log("✅ Seed complete.");
  console.log("   Admin:   admin@payu.id / password123");
  console.log("   Sponsor: sponsor@payu.id / password123");
  console.log("   Seeker:  seeker@payu.id / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
