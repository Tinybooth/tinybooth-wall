"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Generic polling hook. Calls the provided function on an interval.
 * @param callback - Async function to call on each interval
 * @param intervalMs - Polling interval in milliseconds
 * @param enabled - Whether polling is active
 */
export function usePolling(
  callback: () => Promise<void>,
  intervalMs: number,
  enabled: boolean = true
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = (): void => {
      savedCallback.current();
    };

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
