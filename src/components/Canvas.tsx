"use client";

import { useCallback, useEffect, useRef } from "react";
import { useBreadboardStore } from "@/store/useBreadboardStore";
import { PlaceNode } from "./PlaceNode";
import { ConnectionLayer } from "./ConnectionLayer";
import { ResetZoomButton } from "./ResetZoomButton";

function isFormFieldActive() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.getAttribute("contenteditable") === "true"
  );
}

export function Canvas() {
  const places = useBreadboardStore((s) => s.places);
  const selectPlace = useBreadboardStore((s) => s.selectPlace);
  const zoom = useBreadboardStore((s) => s.zoom);
  const setZoom = useBreadboardStore((s) => s.setZoom);
  const pan = useBreadboardStore((s) => s.pan);
  const setPan = useBreadboardStore((s) => s.setPan);
  const resetView = useBreadboardStore((s) => s.resetView);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const didPan = useRef(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape — blur active input and deselect
      if (e.key === "Escape") {
        if (isFormFieldActive()) {
          (document.activeElement as HTMLElement)?.blur();
        }
        selectPlace(null);
        return;
      }

      // 0 — reset zoom & pan
      if (e.key === "0" && !e.metaKey && !e.ctrlKey && !e.altKey && !isFormFieldActive()) {
        e.preventDefault();
        resetView();
        return;
      }

      if (isFormFieldActive()) return;

      const { selectedPlaceId, hoveredPlaceId, removePlace, setPendingFocus } =
        useBreadboardStore.getState();

      // Del / Backspace — delete selected place
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedPlaceId
      ) {
        e.preventDefault();
        removePlace(selectedPlaceId);
        return;
      }

      // P — focus Place name input
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        // Deselect any place so the "Add Place" input is shown
        selectPlace(null);
        setPendingFocus("place-input");
        return;
      }

      // A — open edit form for hovered place, focus affordance input
      if (e.key === "a" || e.key === "A") {
        if (hoveredPlaceId) {
          e.preventDefault();
          selectPlace(hoveredPlaceId);
          setPendingFocus("affordance-input");
        }
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectPlace, resetView]);

  // Wheel: pinch-to-zoom (ctrl/meta + wheel) and two-finger pan (plain wheel)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const { zoom: currentZoom, pan: currentPan } = useBreadboardStore.getState();

      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom
        const delta = -e.deltaY * 0.01;
        setZoom(currentZoom + delta);
      } else {
        // Two-finger pan
        setPan({
          x: currentPan.x - e.deltaX,
          y: currentPan.y - e.deltaY,
        });
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [setZoom, setPan]);

  // Click-drag panning on the canvas background
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only start panning from the canvas itself (not from place nodes)
      if (e.target !== e.currentTarget) return;
      if (e.button !== 0) return;

      isPanning.current = true;
      didPan.current = false;
      panStart.current = { x: e.clientX, y: e.clientY };
      const currentPan = useBreadboardStore.getState().pan;
      panOrigin.current = { x: currentPan.x, y: currentPan.y };

      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        didPan.current = true;
      }
      setPan({
        x: panOrigin.current.x + dx,
        y: panOrigin.current.y + dy,
      });
    },
    [setPan]
  );

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleCanvasClick = useCallback(() => {
    // Don't deselect if user was panning
    if (didPan.current) {
      didPan.current = false;
      return;
    }
    selectPlace(null);
  }, [selectPlace]);

  const dotSize = 24 * zoom;

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-background overflow-hidden cursor-grab active:cursor-grabbing"
      onClick={handleCanvasClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
        backgroundSize: `${dotSize}px ${dotSize}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          inset: 0,
        }}
      >
        <ConnectionLayer />
        {places.map((place) => (
          <PlaceNode key={place.id} place={place} />
        ))}
      </div>
      <ResetZoomButton />
    </div>
  );
}
