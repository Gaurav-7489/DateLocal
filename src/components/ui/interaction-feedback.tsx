"use client";

import { useEffect } from "react";
import { soundFx } from "@/lib/sound";

export function InteractionFeedback() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const control = target?.closest("button, a, [role='button']");
      if (!control || (control as HTMLButtonElement).disabled) return;

      soundFx.playClick();
      if (localStorage.getItem("datebu_haptics") !== "off") {
        soundFx.haptic(7);
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
