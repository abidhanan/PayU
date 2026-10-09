import { redirect } from "next/navigation";
import { Coins, Check } from "lucide-react";
import { requireUser } from "@/lib/session";
import { availableTokens } from "@/lib/tokens";
import { getSettings } from "@/lib/settings";
import { formatRupiah } from "@/lib/utils";
import { TokenTopup } from "@/components/token-topup";

export const dynamic = "force-dynamic";
export const metadata = { title: "Token" };

export default async function TokensPage() {
  const user = await requireUser();
  if (user.role !== "SEEKER") redirect("/dashboard");
  const settings = await getSettings();
  const tokens = availableTokens(user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Token</h1>
        <p className="mt-2 muted">Token digunakan untuk mengerjakan bounty.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card flex flex-col justify-between p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
              <Coins className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm muted">Jumlah token</p>
              <p className="text-3xl font-extrabold">{tokens}</p>
            </div>
          </div>
          <ul className="mt-6 space-y-2 text-sm muted">
            {[
              `${settings.freeTokens} token gratis di-reset setiap awal bulan`,
              "Token hanya berkurang saat menang",
              "Kalah = token tetap",
              "Token top up tidak hangus saat reset bulanan",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold">Top Up Token</h2>
          <p className="mb-5 text-sm muted">Harga {formatRupiah(settings.tokenPrice)} / token.</p>
          <TokenTopup tokenPrice={settings.tokenPrice} />
        </div>
      </div>
    </div>
  );
}
