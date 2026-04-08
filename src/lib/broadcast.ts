type Listener = (writerClientId: string) => void;

const globalKey = "__broadcastChannels" as const;

function getChannels(): Map<string, Set<Listener>> {
  const g = globalThis as unknown as Record<string, Map<string, Set<Listener>>>;
  g[globalKey] ??= new Map();
  return g[globalKey];
}

export function subscribe(
  boardId: string,
  listener: Listener
): () => void {
  const channels = getChannels();
  let set = channels.get(boardId);
  if (!set) {
    set = new Set();
    channels.set(boardId, set);
  }
  set.add(listener);

  return () => {
    set.delete(listener);
    if (set.size === 0) {
      channels.delete(boardId);
    }
  };
}

export function broadcast(boardId: string, writerClientId: string): void {
  const set = getChannels().get(boardId);
  if (!set) return;
  for (const listener of set) {
    listener(writerClientId);
  }
}
