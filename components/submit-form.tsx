"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Send, AlertCircle, CheckCircle2, Save } from "lucide-react";
import { submitSolutionAction, editSubmissionAction, type SubmitState } from "@/lib/actions/bounty";
import { Button } from "./ui";

function SubmitButton({ edit }: { edit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {edit ? <Save className="h-4 w-4" /> : <Send className="h-4 w-4" />}
      {pending ? "Menyimpan..." : edit ? "Simpan Perubahan" : "Kirim Submission"}
    </Button>
  );
}

export function SubmitForm({
  bountyId,
  existing,
}: {
  bountyId: string;
  existing?: { id: string; link: string; note: string };
}) {
  const edit = !!existing;
  const [state, action] = useFormState<SubmitState, FormData>(
    edit ? editSubmissionAction : submitSolutionAction,
    null
  );
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      if (!edit) formRef.current?.reset();
      router.refresh();
    }
  }, [state, router, edit]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {edit ? (
        <input type="hidden" name="submissionId" value={existing!.id} />
      ) : (
        <input type="hidden" name="bountyId" value={bountyId} />
      )}
      <div>
        <label className="label" htmlFor="link">Tautan Karya</label>
        <input
          id="link"
          name="link"
          type="url"
          required
          defaultValue={existing?.link}
          placeholder="https://contoh.com/karya-kamu"
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="note">Deskripsi Karya</label>
        <textarea
          id="note"
          name="note"
          required
          rows={3}
          defaultValue={existing?.note}
          placeholder="Ceritakan singkat tentang karya yang kamu kirim"
          className="input resize-none"
        />
      </div>
      {state?.error && (
        <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </p>
      )}
      {edit && state?.ok && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Perubahan tersimpan.
        </p>
      )}
      <SubmitButton edit={edit} />
    </form>
  );
}
