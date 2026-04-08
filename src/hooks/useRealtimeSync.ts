import { useEffect } from "react";
import { CLIENT_ID, suppressSave } from "@/lib/syncClient";
import { useBreadboardStore } from "@/store/useBreadboardStore";

export function useRealtimeSync(boardId: string | null) {
  useEffect(() => {
    if (!boardId) return;

    const es = new EventSource(
      `/api/breadboards/${boardId}/events?clientId=${CLIENT_ID}`
    );

    es.addEventListener("changed", async () => {
      try {
        const res = await fetch(`/api/breadboards/${boardId}`);
        if (!res.ok) return;
        const data = await res.json();
        suppressSave(1000);
        useBreadboardStore.setState({
          places: data.places,
          breadboardName: data.name,
        });
      } catch {
        // network error — will retry on next event
      }
    });

    return () => es.close();
  }, [boardId]);
}
