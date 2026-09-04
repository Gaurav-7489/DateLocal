"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureOwnMessageKey } from "@/lib/crypto/messages";

export function MessageKeyBootstrap({ userId }: { userId: string }) {
  useEffect(() => {
    const supabase = createClient();
    void ensureOwnMessageKey(supabase, userId).catch(() => {
      // Chat surfaces show a useful error if a secure key cannot be created.
    });
  }, [userId]);

  return null;
}
