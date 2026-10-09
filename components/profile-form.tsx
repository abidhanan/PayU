"use client";

import { useState, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Save, KeyRound, Camera, Trash2 } from "lucide-react";
import { updateProfileAction, changePasswordAction, type ProfileState } from "@/lib/actions/profile";
import { Avatar, Button } from "./ui";

function SaveBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Save className="h-4 w-4" /> {pending ? "Menyimpan..." : label}
    </Button>
  );
}

function PwBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      <KeyRound className="h-4 w-4" /> {pending ? "Menyimpan..." : "Perbarui Kata Sandi"}
    </Button>
  );
}

function Alert({ state }: { state: ProfileState }) {
  if (state?.error)
    return (
      <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
        <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
      </p>
    );
  if (state?.ok)
    return (
      <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4 shrink-0" /> Tersimpan.
      </p>
    );
  return null;
}

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string; bio: string; avatarColor: string; image: string | null; hasPassword: boolean };
}) {
  const [profileState, profileAction] = useFormState<ProfileState, FormData>(updateProfileAction, null);
  const [pwState, pwAction] = useFormState<ProfileState, FormData>(changePasswordAction, null);
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [preview, setPreview] = useState<string | null>(user.image);
  const [removeImage, setRemoveImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onProfile = (fd: FormData) => {
    profileAction(fd);
    // give the server a moment to revalidate, then refresh so the navbar avatar updates
    setTimeout(() => router.refresh(), 400);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setPreview(URL.createObjectURL(f));
      setRemoveImage(false);
    }
  };

  const onRemove = () => {
    setPreview(null);
    setRemoveImage(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={onProfile} className="card space-y-4 p-6">
        <input type="hidden" name="removeImage" value={removeImage ? "1" : "0"} />
        <div className="flex items-center gap-4">
          <Avatar name={name || user.name} color={user.avatarColor} image={preview} size={64} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:surface-2"
              style={{ borderColor: "var(--border)" }}
            >
              <Camera className="h-4 w-4" /> Ubah Foto
            </button>
            {preview && (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-red-500 transition hover:surface-2"
                style={{ borderColor: "var(--border)" }}
              >
                <Trash2 className="h-4 w-4" /> Hapus
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" name="photo" accept="image/*" onChange={onPick} className="hidden" />
        </div>

        <div>
          <label className="label" htmlFor="name">Nama</label>
          <input id="name" name="name" required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" value={user.email} disabled className="input opacity-60" />
        </div>
        <div>
          <label className="label" htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" rows={3} defaultValue={user.bio} maxLength={280} placeholder="Ceritakan sedikit tentang dirimu..." className="input resize-none" />
        </div>
        <Alert state={profileState} />
        <SaveBtn label="Simpan Profil" />
      </form>

      <form action={pwAction} className="card h-fit space-y-4 p-6">
        <h2 className="font-bold">{user.hasPassword ? "Ubah Kata Sandi" : "Buat Kata Sandi"}</h2>
        {!user.hasPassword && (
          <p className="text-sm muted">
            Akunmu masuk lewat Google. Buat kata sandi agar bisa juga masuk dengan email.
          </p>
        )}
        {user.hasPassword && (
          <div>
            <label className="label" htmlFor="current">Kata sandi saat ini</label>
            <input id="current" name="current" type="password" autoComplete="current-password" className="input" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="next">Kata sandi baru</label>
          <input id="next" name="next" type="password" autoComplete="new-password" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Konfirmasi kata sandi</label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="input" />
        </div>
        <Alert state={pwState} />
        <PwBtn />
      </form>
    </div>
  );
}
