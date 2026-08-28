"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleGhostMode, unblockUser } from "../discover/actions";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  UserX,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface BlockedProfile {
  id: string;
  display_name: string;
  department: string;
}

interface SettingsClientProps {
  initialGhostMode: boolean;
  blockedUsers: BlockedProfile[];
}

export function SettingsClient({
  initialGhostMode,
  blockedUsers: initialBlocked,
}: SettingsClientProps) {
  const router = useRouter();
  const [ghostMode, setGhostMode] = useState(initialGhostMode);
  const [ghostLoading, setGhostLoading] = useState(false);
  const [blockedList, setBlockedList] = useState<BlockedProfile[]>(initialBlocked);
  const [unblockLoadingId, setUnblockLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleToggleGhost() {
    const nextState = !ghostMode;
    setGhostLoading(true);
    setStatusMessage(null);

    const result = await toggleGhostMode(nextState);
    setGhostLoading(false);

    if (result.error) {
      setStatusMessage({ type: "error", text: result.error });
      return;
    }

    setGhostMode(nextState);
    setStatusMessage({
      type: "success",
      text: nextState
        ? "Ghost Mode enabled. Your profile is now hidden from public discovery."
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
      setStatusMessage({ type: "error", text: result.error });
      return;
    }

    setBlockedList((prev) => prev.filter((u) => u.id !== userId));
    setStatusMessage({
      type: "success",
      text: `${name} has been unblocked.`,
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Status Notice */}
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

      {/* Ghost Mode Privacy Section */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              {ghostMode ? (
                <EyeOff className="w-5 h-5 text-amber-600" />
              ) : (
                <Eye className="w-5 h-5 text-emerald-600" />
              )}
              Ghost Mode
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              Temporarily hide your profile from all student discovery feeds (e.g. during exams or busy weeks). Your existing matches and chats will remain active.
            </p>
          </div>

          <Button
            type="button"
            variant={ghostMode ? "primary" : "secondary"}
            size="sm"
            disabled={ghostLoading}
            onClick={handleToggleGhost}
            className={`shrink-0 ${
              ghostMode
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : ""
            }`}
          >
            {ghostLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : ghostMode ? (
              "Turn Off Ghost Mode"
            ) : (
              "Turn On Ghost Mode"
            )}
          </Button>
        </div>

        <div className="rounded-2xl bg-muted/50 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Current Status: <strong>{ghostMode ? "Invisible in Discovery" : "Visible to Students"}</strong>
          </span>
        </div>
      </div>

      {/* Blocked Users Section */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <UserX className="w-5 h-5 text-rose-600" />
            Blocked Users
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Users you have blocked cannot discover your profile, match with you, or send you messages.
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
                  onClick={() => handleUnblock(blocked.id, blocked.display_name)}
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
    </div>
  );
}

