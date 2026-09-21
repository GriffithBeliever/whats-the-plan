// src/utils/useNowTick.ts
// Forces a re-render every `intervalMs` so time-window checks (isPlanLive, the
// Live tab, "starts in 8 min") update while the app stays open, without a
// component having to poll Date.now() itself.
import { useEffect, useState } from 'react';

export function useNowTick(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
