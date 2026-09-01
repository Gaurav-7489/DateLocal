"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

type ConversationRowProps = {
  matchId: string;
  profileId: string;
  displayName: string | null;
  photoUrl?: string | null;
  latestContent: string;
  timestamp: string;
  sent: boolean;
  formatTimestamp: (iso: string) => string;
};

export default function ConversationRow({
  matchId,
  profileId,
  displayName,
  photoUrl,
  latestContent,
  timestamp,
  sent,
  formatTimestamp,
}: ConversationRowProps) {
  const router = useRouter();
  const chatHref = `${routes.messages}/${matchId}`;
  const profileHref = `${routes.profileView}/${profileId}`;

  const openChat = () => router.push(chatHref);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={openChat}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openChat();
        }
      }}
      className="flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-200/90 bg-white p-3 shadow-2xs transition-transform active:scale-[0.995]"
      aria-label={`Open chat with ${displayName ?? "Student"}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <a
          href={profileHref}
          onClick={(event) => event.stopPropagation()}
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100"
          aria-label={`View ${displayName ?? "Student"}'s profile`}
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={displayName ?? "Student"}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-black text-zinc-700">
              {displayName?.charAt(0)}
            </div>
          )}
        </a>

        <div className="min-w-0">
          <a
            href={profileHref}
            onClick={(event) => event.stopPropagation()}
            className="block truncate text-xs font-bold text-zinc-950 sm:text-sm"
          >
            {displayName ?? "Student"}
          </a>
          <p className="truncate text-xs text-zinc-500">
            {sent && <span className="font-semibold text-zinc-700">You: </span>}
            {latestContent}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          openChat();
        }}
        className="shrink-0 pl-2 text-[10px] font-semibold text-zinc-400"
        aria-label={`Open chat with ${displayName ?? "Student"}, ${formatTimestamp(timestamp)}`}
      >
        {formatTimestamp(timestamp)}
      </button>
    </div>
  );
}
