import { subscribe } from "@/lib/broadcast";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId");
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial comment to flush headers immediately
      controller.enqueue(encoder.encode(": connected\n\n"));

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          cleanup();
        }
      }, 15000);

      const unsubscribe = subscribe(id, (writerClientId) => {
        if (writerClientId === clientId) return;
        try {
          controller.enqueue(encoder.encode("event: changed\ndata: {}\n\n"));
        } catch {
          cleanup();
        }
      });

      function cleanup() {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      }

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
