"use client";

import { useTransition } from "react";
import { UserPlus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptSocialConnection, requestSocialConnection } from "./actions";

export function ConnectButton({ targetId }: { targetId: string }) {
  const [pending, startTransition] = useTransition();
  return <Button size="sm" variant="outline" disabled={pending} leftIcon={pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />} onClick={() => startTransition(async () => { const r = await requestSocialConnection(targetId); if (r.error) window.alert(r.error); })}>{pending ? "Sending…" : "Connect"}</Button>;
}

export function AcceptButton({ connectionId }: { connectionId: string }) {
  const [pending, startTransition] = useTransition();
  return <Button size="sm" disabled={pending} leftIcon={pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} onClick={() => startTransition(async () => { const r = await acceptSocialConnection(connectionId); if (r.error) window.alert(r.error); })}>{pending ? "Accepting…" : "Accept"}</Button>;
}
