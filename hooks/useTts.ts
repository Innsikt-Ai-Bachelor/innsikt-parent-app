import { useCallback, useState } from "react";
import { speakText } from "@/lib/tts";

export function useTts() {
  const [enabled, setEnabled] = useState(false);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  const speak = useCallback(
    (text: string) => {
      if (!enabled) return;
      speakText(text).catch((e) => console.error("TTS error:", e));
    },
    [enabled],
  );

  return { ttsEnabled: enabled, toggle, speak };
}
