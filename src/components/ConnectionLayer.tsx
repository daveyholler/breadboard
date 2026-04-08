"use client";

import { useEffect, useRef, useState } from "react";
import { useBreadboardStore } from "@/store/useBreadboardStore";
import {
  getAffordanceSourcePoint,
  getPlaceTargetPoint,
} from "@/lib/geometry";
import { getConnectionPath } from "@/lib/bezier";

interface Connection {
  id: string;
  path: string;
}

export function ConnectionLayer() {
  const places = useBreadboardStore((s) => s.places);
  const [connections, setConnections] = useState<Connection[]>([]);
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const updateConnections = () => {
      const svg = containerRef.current;
      if (!svg) return;

      const canvas = svg.parentElement;
      if (!canvas) return;

      const { zoom } = useBreadboardStore.getState();
      const canvasRect = canvas.getBoundingClientRect();
      const newConnections: Connection[] = [];

      for (const place of places) {
        for (const affordance of place.affordances) {
          if (!affordance.connectedToPlaceId) continue;

          const affordanceEl = canvas.querySelector(
            `[data-affordance-id="${affordance.id}"]`
          ) as HTMLElement | null;

          const targetPlaceEl = canvas.querySelector(
            `[data-place-id="${affordance.connectedToPlaceId}"]`
          ) as HTMLElement | null;

          if (!affordanceEl || !targetPlaceEl) continue;

          const sourcePoint = getAffordanceSourcePoint(
            affordanceEl,
            canvasRect
          );
          const targetPoint = getPlaceTargetPoint(
            targetPlaceEl,
            canvasRect,
            sourcePoint
          );
          // getBoundingClientRect returns screen-space coords (post-transform),
          // but the SVG is inside the transform div and needs pre-transform coords
          sourcePoint.x /= zoom;
          sourcePoint.y /= zoom;
          targetPoint.x /= zoom;
          targetPoint.y /= zoom;

          const path = getConnectionPath(sourcePoint, targetPoint);
          newConnections.push({ id: affordance.id, path });
        }
      }

      setConnections(newConnections);
    };

    // Update immediately and on animation frame for smooth drag updates
    updateConnections();
    let rafId: number;
    const loop = () => {
      updateConnections();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [places]);

  return (
    <svg
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polyline points="0 0, 10 5, 0 10" fill="none" stroke="var(--color-muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      {connections.map((conn) => (
        <path
          key={conn.id}
          d={conn.path}
          fill="none"
          stroke="var(--color-muted-foreground)"
          strokeWidth="1.5"
          markerEnd="url(#arrowhead)"
        />
      ))}
    </svg>
  );
}
