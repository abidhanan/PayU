import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Users, Trophy, CheckCircle2, ExternalLink, Coins, ArrowLeft, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { availableTokens } from "@/lib/tokens";
import { formatRupiah, formatDate, deadlineInfo, timeAgo } from "@/lib/utils";
import { Avatar, StatusBadge, LinkButton } from "@/components/ui";
import { CategoryIcon } from "@/components/category-icon";
import { SubmitForm } from "@/components/submit-form";
import { WinnerActions } from "@/components/winner-actions";
import { Countdown } from "@/components/countdown";
import { CommentForm } from "@/components/comment-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const bounty = await prisma.bounty.findUnique({ where: { slug: params.slug } });
  return { title: bounty?.title ?? "Bounty" };
}

export default async function BountyDetail({ params }: { params: { slug: string } }) {
  const bounty = await prisma.bounty.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      sponsor: { select: { id: true, name: true, avatarColor: true, image: true, bio: true } },
      winner: { select: { id: true, name: true, avatarColor: true, image: true } },
      submissions: {
        orderBy: { createdAt: "asc" },
        include: { seeker: { select: { id: true, name: true, avatarColor: true, image: true } } },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, avatarColor: true, image: true } } },
      },
    },
  });

  if (!bounty || bounty.status === "PENDING_PAYMENT") notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === bounty.sponsorId;
  const isAdmin = user?.role === "ADMIN";
  const canManage = isOwner || isAdmin;
  const isSeeker = user?.role === "SEEKER";
  const dl = deadlineInfo(bounty.deadline);

  const mySubmission = isSeeker ? bounty.submissions.find((s) => s.seekerId === user!.id) : undefined;
  const tokens = user && isSeeker ? availableTokens(user) : 0;
  const canSubmit = isSeeker && bounty.status === "OPEN" && !dl.expired && !mySubmission && tokens >= 1;
  const canEditSubmission = !!mySubmission && bounty.status === "OPEN" && !dl.expired;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/bounties" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium muted hover:text-brand-500">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${bounty.category.color}18`, color: bounty.category.color }}
              >
                <CategoryIcon name={bounty.category.icon} className="h-3.5 w-3.5" />
                {bounty.category.name}
              </span>
              <StatusBadge status={bounty.status} />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">{bounty.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <Avatar name={bounty.sponsor.name} color={bounty.sponsor.avatarColor} image={bounty.sponsor.image} size={40} />
              <div>
                <p className="text-sm font-semibold">{bounty.sponsor.name}</p>
                <p className="text-xs muted">Pemberi kerja</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-3 text-lg font-bold">Detail</h2>
            <p className="ws-pre-wrap text-sm leading-relaxed muted">{bounty.description}</p>
            {bounty.requirements?.trim() && (
              <ul className="mt-4 space-y-2">
                {bounty.requirements.split("\n").filter(Boolean).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm muted">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Winner banner */}
          {bounty.status === "COMPLETED" && bounty.winner && (
            <div className="card border-2 border-emerald-500/30 bg-emerald-500/5 p-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Pemenang Bounty</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar name={bounty.winner.name} color={bounty.winner.avatarColor} image={bounty.winner.image} size={26} />
                    <span className="font-bold">{bounty.winner.name}</span>
                    <span className="muted">memenangkan {formatRupiah(bounty.bountyAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submission form for seekers */}
          {isSeeker && (
            <div id="submit" className="card scroll-mt-24 p-6">
              <h2 className="mb-1 text-lg font-bold">{mySubmission && canEditSubmission ? "Karyamu" : "Kirim Karyamu"}</h2>
              {mySubmission && canEditSubmission ? (
                <>
                  <p className="mb-4 text-sm muted">Kamu bisa mengedit karyamu sampai tenggat berakhir.</p>
                  <SubmitForm bountyId={bounty.id} existing={{ id: mySubmission.id, link: mySubmission.link, note: mySubmission.note }} />
                </>
              ) : mySubmission ? (
                <div className="mt-3 rounded-xl surface-2 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Submission kamu</span>
                    <StatusBadge status={mySubmission.status} />
                  </div>
                  <a href={mySubmission.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 break-all text-sm text-brand-600 hover:underline dark:text-brand-300">
                    {mySubmission.link} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                  <p className="mt-1 text-sm muted">{mySubmission.note}</p>
                </div>
              ) : bounty.status !== "OPEN" ? (
                <p className="mt-2 text-sm muted">Bounty ini tidak lagi menerima submission.</p>
              ) : dl.expired ? (
                <p className="mt-2 text-sm muted">Tenggat waktu sudah berakhir.</p>
              ) : tokens < 1 ? (
                <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-sm font-medium">Token kamu habis bulan ini.</p>
                  <p className="mt-1 text-sm muted">Top up token untuk ikut mengerjakan bounty ini.</p>
                  <LinkButton href="/dashboard/tokens" size="sm" className="mt-3">
                    <Coins className="h-4 w-4" /> Top Up Token
                  </LinkButton>
                </div>
              ) : (
                <div className="mt-3">
                  <SubmitForm bountyId={bounty.id} />
                </div>
              )}
            </div>
          )}

          {!user && bounty.status === "OPEN" && (
            <div className="card flex flex-col items-center gap-3 p-6 text-center">
              <p className="text-sm muted">Masuk sebagai pencari kerja untuk mengirim karyamu.</p>
              <LinkButton href="/login">Masuk untuk ikut</LinkButton>
            </div>
          )}

          {/* Submissions list (owner/admin only) */}
          {canManage && (
            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Submission ({bounty.submissions.length})</h2>
              </div>
              {bounty.submissions.length === 0 ? (
                <p className="text-sm muted">Belum ada submission masuk.</p>
              ) : (
                <ul className="space-y-3">
                  {bounty.submissions.map((s) => (
                    <li key={s.id} className="rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.seeker.name} color={s.seeker.avatarColor} image={s.seeker.image} size={34} />
                          <div>
                            <p className="text-sm font-semibold">{s.seeker.name}</p>
                            <StatusBadge status={s.status} />
                          </div>
                        </div>
                        {bounty.status !== "COMPLETED" && bounty.status !== "CANCELLED" && (
                          <WinnerActions bountyId={bounty.id} submissionId={s.id} />
                        )}
                      </div>
                      <a href={s.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 break-all text-sm text-brand-600 hover:underline dark:text-brand-300">
                        {s.link} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                      <p className="mt-1 text-sm muted">{s.note}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <MessageCircle className="h-5 w-5" /> Komentar ({bounty.comments.length})
            </h2>
            {user ? (
              <CommentForm bountyId={bounty.id} user={{ name: user.name, avatarColor: user.avatarColor, image: user.image }} />
            ) : (
              <div className="rounded-xl surface-2 p-4 text-center text-sm muted">
                <Link href="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">Masuk</Link> untuk ikut berkomentar.
              </div>
            )}
            {bounty.comments.length > 0 && (
              <ul className="mt-6 space-y-4">
                {bounty.comments.map((c) => (
                  <li key={c.id} className="flex gap-3">
                    <Avatar name={c.user.name} color={c.user.avatarColor} image={c.user.image} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <span className="text-sm font-semibold">{c.user.name}</span>
                        <span className="text-xs muted">· {timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-sm muted [overflow-wrap:anywhere]">{c.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-6">
            <p className="text-sm muted">Total Hadiah</p>
            <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-300">
              {formatRupiah(bounty.bountyAmount)}
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-1.5 muted"><Clock className="h-4 w-4" /> Tenggat</dt>
                <dd className="text-right">
                  {dl.expired ? <span className="font-semibold text-red-500">Berakhir</span> : <Countdown deadline={bounty.deadline.toISOString()} />}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="muted">Pengumuman pemenang</dt>
                <dd className="text-right font-medium">{formatDate(bounty.deadline)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 muted"><Users className="h-4 w-4" /> Peserta</dt>
                <dd className="font-semibold">{bounty.submissions.length}</dd>
              </div>
            </dl>

            {canSubmit && (
              <a href="#submit" className="mt-5 block">
                <span className="block w-full rounded-xl bg-brand-500 py-3 text-center font-semibold text-white shadow-glow transition hover:bg-brand-600">
                  Kirim Karya
                </span>
              </a>
            )}

            {canManage && (bounty.status === "OPEN" || bounty.status === "IN_REVIEW") && (
              <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--border)" }}>
                <p className="mb-2 text-xs font-semibold muted">Kelola Bounty</p>
                <WinnerActions bountyId={bounty.id} cancelOnly />
              </div>
            )}
          </div>

          <div className="card p-6">
            <p className="text-sm font-bold">Tentang Pemberi Kerja</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={bounty.sponsor.name} color={bounty.sponsor.avatarColor} image={bounty.sponsor.image} size={40} />
              <p className="font-semibold">{bounty.sponsor.name}</p>
            </div>
            {bounty.sponsor.bio && <p className="mt-3 text-sm muted">{bounty.sponsor.bio}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
