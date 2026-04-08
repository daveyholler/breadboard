"use client";

import { useBreadboardStore } from "@/store/useBreadboardStore";
import { Button } from "./ui/button";
import { Kbd } from "./ui/kbd";

export function ResetZoomButton() {
  const zoom = useBreadboardStore((s) => s.zoom);
  const pan = useBreadboardStore((s) => s.pan);
  const resetView = useBreadboardStore((s) => s.resetView);

  const isDefault = zoom === 1 && pan.x === 0 && pan.y === 0;
  if (isDefault) return null;

  return (
    <div className="absolute bottom-4 left-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          resetView();
        }}
        className="gap-2"
      >
        {Math.round(zoom * 100)}%
        <Kbd>0</Kbd>
      </Button>
    </div>
  );
}
