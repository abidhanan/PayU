import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[28%] bg-brand-500 text-white shadow-glow",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="9.5" cy="6.2" rx="4.6" ry="1.9" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M4.9 6.2v6.4c0 1 2 1.9 4.6 1.9s4.6-.9 4.6-1.9V6.2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path d="M4.9 9.4c0 1 2 1.9 4.6 1.9s4.6-.9 4.6-1.9" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="15" cy="15.5" r="4.3" fill="var(--logo-coin, #2f56f5)" stroke="currentColor" strokeWidth="1.3" />
        <text x="15" y="17" textAnchor="middle" fontSize="4.2" fontWeight="700" fill="currentColor">
          Rp
        </text>
      </svg>
    </span>
  );
}

export function Logo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const mark = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-11 w-11" }[size];
  const text = { sm: "text-lg", md: "text-xl", lg: "text-2xl" }[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={mark} />
      {showText && (
        <span className={cn("font-extrabold tracking-tight text-brand-600 dark:text-brand-300", text)}>
          Pay<span className="text-[color:var(--text)]">U</span>
        </span>
      )}
    </span>
  );
}
