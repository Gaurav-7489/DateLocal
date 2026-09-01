"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Eye, EyeOff, Loader2, UserX } from "lucide-react";
import { toggleGhostMode, unblockUser } from "../discover/actions";
import { routes } from "@/config/routes";

interface BlockedProfile {
  id: string;
  display_name: string;
  department: string;
}

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
}

export function SettingsControls({
  initialGhostMode,
  blockedUsers: initialBlocked,
  subscription,
}: {
  initialGhostMode: boolean;
  blockedUsers: BlockedProfile[];
  subscription: Subscription;
}) {
  const router = useRouter();
  const [ghostMode, setGhostMode] = useState(initialGhostMode);
  const [ghostLoading, setGhostLoading] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState(initialBlocked);
  const [unblockId, setUnblockId] = useState<string | null>(null);

  const isPremium =
    subscription.plan !== "free" &&
    subscription.status === "active" &&
    !!subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd).getTime() > Date.now();

  async function handleGhostMode() {
    if (!isPremium) {
      router.push(routes.extrovert);
      return;
    }

    setGhostLoading(true);
    const nextState = !ghostMode;
    const result = await toggleGhostMode(nextState);
    setGhostLoading(false);

    if (!result.error) setGhostMode(nextState);
  }

  async function handleUnblock(id: string) {
    setUnblockId(id);
    const result = await unblockUser(id);
    setUnblockId(null);
    if (!result.error) setBlockedUsers((current) => current.filter((user) => user.id !== id));
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              {ghostMode ? <EyeOff className="h-4 w-4 text-emerald-600" /> : <Eye className="h-4 w-4 text-emerald-600" />}
              Ghost Mode
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Hide your profile from discovery when you want a break.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGhostMode}
            disabled={ghostLoading}
            aria-pressed={ghostMode}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${ghostMode ? "bg-emerald-600" : "bg-zinc-200"} disabled:opacity-60`}
          >
            {ghostLoading ? (
              <Loader2 className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
            ) : (
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${ghostMode ? "translate-x-6" : "translate-x-1"}`} />
            )}
          </button>
        </div>
        {!isPremium && (
          <button type="button" onClick={() => router.push(routes.extrovert)} className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
            <Crown className="h-3.5 w-3.5" /> Available with Extrovert
          </button>
        )}
      </section>

      {blockedUsers.length > 0 && (
        <section className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <UserX className="h-4 w-4 text-rose-500" /> Blocked users
          </h2>
          <div className="mt-3 space-y-2">
            {blockedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">{user.display_name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{user.department}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnblock(user.id)}
                  disabled={unblockId === user.id}
                  className="shrink-0 rounded-xl border border-border px-3 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted disabled:opacity-60"
                >
                  {unblockId === user.id ? "..." : "Unblock"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
