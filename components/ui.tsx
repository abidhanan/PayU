import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-glow disabled:opacity-60",
  secondary:
    "surface-2 text-[color:var(--text)] hover:brightness-95 border border-[color:var(--border)]",
  outline:
    "border border-[color:var(--border)] text-[color:var(--text)] hover:surface-2 bg-transparent",
  ghost: "text-[color:var(--text)] hover:surface-2",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

type LinkButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: LinkButtonProps) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}

export function Badge({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        className
      )}
      style={
        color
          ? { backgroundColor: `${color}1a`, color }
          : undefined
      }
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("card p-5 sm:p-6", className)}>{children}</div>;
}

export function Avatar({
  name,
  color = "#2f56f5",
  size = 40,
  image,
  className,
}: {
  name: string;
  color?: string;
  size?: number;
  image?: string | null;
  className?: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        width={size}
        height={size}
        className={cn("inline-block shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white", className)}
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl surface-2 text-brand-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="max-w-sm text-sm muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

const statusStyles: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: "Menunggu Pembayaran", color: "#f59e0b" },
  OPEN: { label: "Terbuka", color: "#10b981" },
  IN_REVIEW: { label: "Sedang Ditinjau", color: "#2f56f5" },
  COMPLETED: { label: "Selesai", color: "#6366f1" },
  CANCELLED: { label: "Dibatalkan", color: "#ef4444" },
  SUBMITTED: { label: "Terkirim", color: "#5b6685" },
  WINNER: { label: "Pemenang", color: "#10b981" },
  REJECTED: { label: "Ditolak", color: "#ef4444" },
  PENDING: { label: "Menunggu", color: "#f59e0b" },
  PAID: { label: "Lunas", color: "#10b981" },
  EXPIRED: { label: "Kadaluarsa", color: "#6b7280" },
  FAILED: { label: "Gagal", color: "#ef4444" },
};

// These "neutral" statuses are intentionally not shown as labels.
const HIDDEN_STATUSES = ["OPEN", "PAID", "SUBMITTED"];

export function StatusBadge({ status }: { status: string }) {
  if (HIDDEN_STATUSES.includes(status)) return null;
  const s = statusStyles[status] ?? { label: status, color: "#5b6685" };
  return (
    <Badge color={s.color}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </Badge>
  );
}
