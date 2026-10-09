"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Send, AlertCircle } from "lucide-react";
import { postCommentAction, type CommentState } from "@/lib/actions/comment";
import { Avatar, Button } from "./ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <Send className="h-4 w-4" /> {pending ? "Mengirim..." : "Kirim"}
    </Button>
  );
}

export function CommentForm({
  bountyId,
  user,
}: {
  bountyId: string;
  user: { name: string; avatarColor: string; image?: string | null };
}) {
  const [state, action] = useFormState<CommentState, FormData>(postCommentAction, null);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={action} className="flex gap-3">
      <Avatar name={user.name} color={user.avatarColor} image={user.image} size={38} />
      <div className="flex-1">
        <input type="hidden" name="bountyId" value={bountyId} />
        <textarea
          name="content"
          required
          rows={2}
          placeholder="Tulis komentar..."
          className="input resize-none"
        />
        {state?.error && (
          <p className="mt-1.5 flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
          </p>
        )}
        <div className="mt-2 flex justify-end">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
