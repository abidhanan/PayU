import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Native <select> styled to match inputs, with a chevron that rotates when the
 * control is focused/open. Pure CSS (peer-focus) — no client JS, no a11y loss.
 */
export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn("peer input cursor-pointer appearance-none pr-11", className)}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 muted transition-transform duration-200 peer-focus:rotate-180" />
    </div>
  );
}
