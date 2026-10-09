import { cn } from "@/lib/utils";

export function StatCard({
  icon,
  label,
  value,
  sub,
  accent = "#2f56f5",
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn("card flex items-center gap-4 p-5", className)}>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${accent}18`, color: accent }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm muted">{label}</p>
        <p className="text-xl font-extrabold leading-tight [overflow-wrap:anywhere]">{value}</p>
        {sub && <p className="text-xs muted">{sub}</p>}
      </div>
    </div>
  );
}
