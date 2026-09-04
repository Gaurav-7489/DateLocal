"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { removeMatch } from "@/app/(app)/actions";

export function RemoveMatchButton({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (isPending) return;
    const confirmed = window.confirm(
      "Remove this match? You will both lose access to this chat and the conversation will be removed."
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await removeMatch(matchId);
      if (result?.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      aria-label="Remove match"
      title="Remove match"
      className="flex items-center justify-center gap-1 rounded-2xl border border-red-200 py-2 text-[10px] font-bold text-red-600 transition-colors hover:bg-red-50 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isPending ? "Removing…" : "Remove"}
    </button>
  );
}
