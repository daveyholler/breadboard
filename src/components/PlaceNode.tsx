"use client";

import { useCallback } from "react";
import { useBreadboardStore } from "@/store/useBreadboardStore";
import { useDrag } from "@/hooks/useDrag";
import type { Place } from "@/types";

interface PlaceNodeProps {
  place: Place;
}

export function PlaceNode({ place }: PlaceNodeProps) {
  const movePlace = useBreadboardStore((s) => s.movePlace);
  const selectPlace = useBreadboardStore((s) => s.selectPlace);
  const selectedPlaceId = useBreadboardStore((s) => s.selectedPlaceId);
  const setHoveredPlaceId = useBreadboardStore((s) => s.setHoveredPlaceId);

  const isSelected = selectedPlaceId === place.id;

  const onDrag = useCallback(
    (pos: { x: number; y: number }) => {
      movePlace(place.id, pos);
    },
    [movePlace, place.id]
  );

  const { onPointerDown, didDrag } = useDrag({
    onDrag,
    initialPosition: place.position,
  });

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (didDrag.current) return;
      selectPlace(place.id);
    },
    [selectPlace, place.id, didDrag]
  );

  return (
    <div
      data-place-id={place.id}
      className={`absolute select-none pointer-events-auto bg-card text-card-foreground border-2 rounded-lg shadow-sm min-w-[140px] transition-[border-color,box-shadow] ${
        isSelected
          ? "border-ring shadow-md"
          : "border-border hover:border-ring hover:shadow-md"
      }`}
      style={{
        left: place.position.x,
        top: place.position.y,
      }}
      onClick={handleClick}
      onPointerEnter={() => setHoveredPlaceId(place.id)}
      onPointerLeave={() => setHoveredPlaceId(null)}
    >
      {/* Place name - draggable handle */}
      <div
        className="px-3 pt-2 cursor-grab active:cursor-grabbing"
        style={{
          fontFamily: "var(--font-funnel-display)",
          fontWeight: 700,
          fontSize: "16px",
          paddingBottom: "8px",
        }}
        onPointerDown={onPointerDown}
      >
        {place.name}
      </div>

      {/* Separator */}
      <div className="border-t border-border" />

      {/* Affordances list */}
      {place.affordances.length > 0 && (
        <div className="px-3 py-2">
          {place.affordances.map((affordance) => (
            <div
              key={affordance.id}
              data-affordance-id={affordance.id}
              className="flex items-center justify-between py-0.5 text-sm"
              style={{
                fontFamily: "var(--font-funnel-sans)",
                fontWeight: 400,
                fontSize: "14px",
              }}
            >
              <span>{affordance.label}</span>
              {affordance.connectedToPlaceId && (
                <span className="text-blue-400 ml-2 text-xs">&rarr;</span>
              )}
            </div>
          ))}
        </div>
      )}

      {place.affordances.length === 0 && (
        <div
          className="px-3 py-2 text-xs text-muted-foreground italic"
          style={{ fontFamily: "var(--font-funnel-sans)" }}
        >
          No affordances
        </div>
      )}
    </div>
  );
}
