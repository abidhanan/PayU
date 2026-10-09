import Link from "next/link";
import { Users, Clock } from "lucide-react";
import { CategoryIcon } from "./category-icon";
import { Avatar } from "./ui";
import { formatRupiah, deadlineInfo } from "@/lib/utils";

export type BountyCardData = {
  slug: string;
  title: string;
  bountyAmount: number;
  deadline: Date | string;
  status: string;
  category: { name: string; icon: string; color: string };
  sponsor: { name: string; avatarColor: string };
  _count: { submissions: number };
};

export function BountyCard({ bounty }: { bounty: BountyCardData }) {
  const dl = deadlineInfo(bounty.deadline);
  return (
    <Link
      href={`/bounties/${bounty.slug}`}
      className="card group flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${bounty.category.color}18`, color: bounty.category.color }}
        >
          <CategoryIcon name={bounty.category.icon} className="h-3.5 w-3.5" />
          {bounty.category.name}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            dl.expired ? "muted" : dl.urgent ? "text-amber-500" : "muted"
          }`}
        >
          <Clock className="h-3.5 w-3.5" /> {dl.label}
        </span>
      </div>

      <h3 className="text-lg font-bold leading-snug [overflow-wrap:anywhere] group-hover:text-brand-600 dark:group-hover:text-brand-300">
        {bounty.title}
      </h3>

      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
        <div>
          <p className="text-xs muted">Hadiah</p>
          <p className="text-xl font-extrabold text-brand-600 dark:text-brand-300">
            {formatRupiah(bounty.bountyAmount)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs muted">
            <Users className="h-3.5 w-3.5" /> {bounty._count.submissions} peserta
          </span>
          <span className="flex items-center gap-1.5">
            <Avatar name={bounty.sponsor.name} color={bounty.sponsor.avatarColor} size={22} />
            <span className="text-right text-xs font-medium muted">{bounty.sponsor.name}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
