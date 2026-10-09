"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trophy, XCircle } from "lucide-react";
import { selectWinnerAction, cancelBountyAction } from "@/lib/actions/bounty";
import { Button } from "./ui";

export function WinnerActions({
  bountyId,
  submissionId,
  cancelOnly = false,
}: {
  bountyId: string;
  submissionId?: string;
  cancelOnly?: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const pickWinner = () => {
    if (!submissionId) return;
    if (!confirm("Pilih submission ini sebagai pemenang? Tindakan ini tidak bisa dibatalkan.")) return;
    setError(null);
    start(async () => {
      const res = await selectWinnerAction(bountyId, submissionId);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  };

  const cancel = () => {
    if (!confirm("Batalkan bounty ini?")) return;
    setError(null);
    start(async () => {
      const res = await cancelBountyAction(bountyId);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  };

  if (cancelOnly) {
    return (
      <div>
        <Button variant="outline" size="sm" onClick={cancel} disabled={pending} className="w-full text-red-500">
          <XCircle className="h-4 w-4" /> Batalkan Bounty
        </Button>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="text-right">
      <Button size="sm" onClick={pickWinner} disabled={pending}>
        <Trophy className="h-4 w-4" /> Jadikan Pemenang
      </Button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
