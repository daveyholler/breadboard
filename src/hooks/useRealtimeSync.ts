import { useEffect, useRef } from "react";
import { suppressSave } from "@/lib/syncClient";
import { useBreadboardStore } from "@/store/useBreadboardStore";

const POLL_INTERVAL = 2000;

export function useRealtimeSync(boardId: string | null) {
  const lastUpdatedAt = useRef<string | null>(null);

  useEffect(() => {
    if (!boardId) return;

    let active = true;

    async function poll() {
      if (!active) return;
      try {
        const res = await fetch(`/api/breadboards/${boardId}`);
        if (!res.ok || !active) return;
        const data = await res.json();

        // Skip if this is the first fetch (just record the timestamp)
        if (lastUpdatedAt.current === null) {
          lastUpdatedAt.current = data.updated_at;
          return;
        }

        // Skip if nothing changed
        if (data.updated_at === lastUpdatedAt.current) return;

        // Skip if the user is actively editing a text field
        if (useBreadboardStore.getState().isEditing) return;

        lastUpdatedAt.current = data.updated_at;
        suppressSave(1000);
        useBreadboardStore.setState({
          places: data.places,
          breadboardName: data.name,
        });
      } catch {
        // network error — will retry next interval
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL);
    // Run first poll immediately to capture initial timestamp
    poll();

    return () => {
      active = false;
      clearInterval(interval);
      lastUpdatedAt.current = null;
    };
  }, [boardId]);
}
