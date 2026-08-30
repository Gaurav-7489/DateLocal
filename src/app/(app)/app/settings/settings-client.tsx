"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleGhostMode, unblockUser } from "../discover/actions";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  UserX,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Crown,
} from "lucide-react";

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

interface SettingsClientProps {
  initialGhostMode: boolean;
  blockedUsers: BlockedProfile[];
  subscription: Subscription;
}

export function SettingsClient({
  initialGhostMode,
  blockedUsers: initialBlocked,
  subscription,
}: SettingsClientProps) {
  const router = useRouter();

  const [ghostMode, setGhostMode] = useState(initialGhostMode);
  const [ghostLoading, setGhostLoading] = useState(false);
  const [blockedList, setBlockedList] = useState(initialBlocked);
  const [unblockLoadingId, setUnblockLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleToggleGhost() {
    if (!isPremium) {
      router.push(routes.extrovert);
      return;
    }

    const nextState = !ghostMode;

    setGhostLoading(true);
    setStatusMessage(null);

    const result = await toggleGhostMode(nextState);

    setGhostLoading(false);

    if (result.error) {
      setStatusMessage({
        type: "error",
        text: result.error,
      });
      return;
    }

    setGhostMode(nextState);

    setStatusMessage({
      type: "success",
      text: nextState
        ? "Ghost Mode enabled. Your profile is now hidden from discovery."
        : "Ghost Mode disabled. Your profile is visible to matching students.",
    });

    router.refresh();
  }

  async function handleUnblock(userId: string, name: string) {
    setUnblockLoadingId(userId);
    setStatusMessage(null);

    const result = await unblockUser(userId);

    setUnblockLoadingId(null);

    if (result.error) {
      setStatusMessage({
        type: "error",
        text: result.error,
      });
      return;
    }

    setBlockedList((prev) => prev.filter((user) => user.id !== userId));

    setStatusMessage({
      type: "success",
      text: `${name} has been unblocked.`,
    });

    router.refresh();
  }

  const isPremium =
    subscription.plan !== "free" &&
    subscription.status === "active";

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-3.5 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}

          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              {ghostMode ? (
                <EyeOff className="w-5 h-5 text-amber-600" />
              ) : (
                <Eye className="w-5 h-5 text-emerald-600" />
              )}
              Ghost Mode
            </h2>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-md mt-1">
              Hide your profile from student discovery while keeping your
              existing matches and chats active.
            </p>
          </div>

          <Button
            type="button"
            variant={ghostMode ? "primary" : "secondary"}
            size="sm"
            disabled={ghostLoading || !isPremium}
            onClick={handleToggleGhost}
            className={ghostMode ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
          >
            {ghostLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : !isPremium ? (
              "Unlock"
            ) : ghostMode ? (
              "Turn Off"
            ) : (
              "Turn On"
            )}
          </Button>
        </div>

        <div className="rounded-2xl bg-muted/50 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Current Status:{" "}
            <strong>
              {!isPremium ? "Premium required" : ghostMode ? "Invisible in Discovery" : "Visible to Students"}
            </strong>
          </span>
        </div>

        {!isPremium && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
            Ghost Mode is a premium feature. Upgrade from the payment page to unlock it.
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <UserX className="w-5 h-5 text-rose-600" />
            Blocked Users
          </h2>

          <p className="text-xs text-muted-foreground mt-1">
            Manage students you have blocked.
          </p>
        </div>

        {blockedList.length === 0 ? (
          <p className="text-xs italic text-muted-foreground py-2">
            You haven&apos;t blocked any users.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {blockedList.map((blocked) => (
              <div
                key={blocked.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {blocked.display_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {blocked.department}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={unblockLoadingId === blocked.id}
                  onClick={() =>
                    handleUnblock(blocked.id, blocked.display_name)
                  }
                  className="text-xs"
                >
                  {unblockLoadingId === blocked.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Unblock"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3">
            <Crown className="h-5 w-5 text-emerald-600" />
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground">
              DateBu Extrovert
            </h2>

            <p className="text-xs text-muted-foreground mt-0.5">
              Plan:{" "}
              <span className="font-semibold capitalize">
                {subscription.plan}
              </span>
              {" · "}
              <span className="capitalize">
                {subscription.status}
              </span>
            </p>
          </div>
        </div>

        {isPremium && subscription.currentPeriodEnd && (
          <p className="mt-4 text-[11px] text-muted-foreground">
            Current period ends{" "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
