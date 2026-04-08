import { useCallback, useRef } from "react";
import { useBreadboardStore } from "@/store/useBreadboardStore";
import type { Position } from "@/types";

interface UseDragOptions {
  onDrag: (position: Position) => void;
  initialPosition: Position;
}

export function useDrag({ onDrag, initialPosition }: UseDragOptions) {
  const isDragging = useRef(false);
  const startMouse = useRef<Position>({ x: 0, y: 0 });
  const startPos = useRef<Position>(initialPosition);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only handle primary button
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      isDragging.current = true;
      startMouse.current = { x: e.clientX, y: e.clientY };
      startPos.current = { ...initialPosition };

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const onPointerMove = (ev: PointerEvent) => {
        if (!isDragging.current) return;
        const zoom = useBreadboardStore.getState().zoom;
        const dx = (ev.clientX - startMouse.current.x) / zoom;
        const dy = (ev.clientY - startMouse.current.y) / zoom;
        onDrag({
          x: startPos.current.x + dx,
          y: startPos.current.y + dy,
        });
      };

      const onPointerUp = () => {
        isDragging.current = false;
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerup", onPointerUp);
      };

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
    },
    [onDrag, initialPosition]
  );

  return { onPointerDown };
}
