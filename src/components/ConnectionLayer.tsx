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
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
      </defs>
      {connections.map((conn) => (
        <path
          key={conn.id}
          d={conn.path}
          fill="none"
          stroke="#6b7280"
          strokeWidth="1.5"
          markerEnd="url(#arrowhead)"
        />
      ))}
    </svg>
  );
}
