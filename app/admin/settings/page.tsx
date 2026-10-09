import { getSettings } from "@/lib/settings";
import { isSimulationMode } from "@/lib/payment";
import { SettingsForm } from "@/components/admin/settings-form";
import { Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Pengaturan</h1>
        <p className="text-sm muted">Konfigurasi biaya, token, dan aturan platform.</p>
      </div>

      <div className="flex items-start gap-2 rounded-xl surface-2 p-4 text-sm muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
        <span>
          Gateway pembayaran QRIS saat ini dalam mode{" "}
          <b className="text-[color:var(--text)]">{isSimulationMode() ? "Simulasi (Demo)" : "Live"}</b>.
          {isSimulationMode() && " Atur PAYMENT_API_KEY di file .env untuk mengaktifkan pembayaran nyata via pay.xoftware.id."}
        </span>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
