"use client";

import { useEffect, useState } from "react";

export function Countdown({ deadline }: { deadline: string }) {
  const target = new Date(deadline).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (now === null) return <span className="font-semibold tabular-nums">—</span>;

  const diff = target - now;
  if (diff <= 0) return <span className="font-semibold text-red-500">Berakhir</span>;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const urgent = diff < 24 * 3600000;

  return (
    <span className={`font-semibold tabular-nums ${urgent ? "text-amber-500" : ""}`}>
      {d > 0 && `${d} hari `}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
