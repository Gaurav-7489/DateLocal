"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { deleteAccount } from "../../actions";

export function DeleteAccount() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canDelete = confirmation.trim().toLowerCase() === "delete";

  function handleDelete() {
    if (!canDelete || isPending) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteAccount(confirmation);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.replace("/login");
    });
  }

  return (
    <section className="rounded-3xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/20 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-rose-100 p-2.5 dark:bg-rose-950/60">
          <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-rose-900 dark:text-rose-200">Delete account</h2>
          <p className="mt-1 text-xs leading-relaxed text-rose-800/80 dark:text-rose-300/80">
            Permanently delete your DateBu account and its associated data. This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-rose-200/80 bg-background/70 p-3.5 dark:border-rose-900/60">
        <p className="flex items-start gap-2 text-[11px] font-medium leading-relaxed text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <span>
            To confirm, type <strong className="font-black text-rose-700 dark:text-rose-300">delete</strong> below. Your account will be removed only after this exact confirmation is submitted.
          </span>
        </p>

        <label htmlFor="delete-account-confirmation" className="sr-only">Type delete to confirm account deletion</label>
        <input
          id="delete-account-confirmation"
          type="text"
          value={confirmation}
          onChange={(event) => {
            setConfirmation(event.target.value);
            setError(null);
          }}
          disabled={isPending}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Type delete"
          className="mt-3 w-full rounded-2xl border border-rose-200 bg-background px-4 py-3.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/60"
        />

        {error && <p role="alert" className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>}

        <button
          type="button"
          onClick={handleDelete}
          disabled={!canDelete || isPending}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting account...</> : <><Trash2 className="h-4 w-4" /> Permanently delete account</>}
        </button>
      </div>
    </section>
  );
}
