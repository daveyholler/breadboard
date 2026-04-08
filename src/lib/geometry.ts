import type { Position } from "@/types";

export interface Point {
  x: number;
  y: number;
}

export function getElementCenter(
  element: HTMLElement,
  canvasRect: DOMRect
): Point {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - canvasRect.left,
    y: rect.top + rect.height / 2 - canvasRect.top,
  };
}

export function getAffordanceSourcePoint(
  affordanceEl: HTMLElement,
  canvasRect: DOMRect
): Point {
  const rect = affordanceEl.getBoundingClientRect();
  return {
    x: rect.right - canvasRect.left,
    y: rect.top + rect.height / 2 - canvasRect.top,
  };
}

export function getPlaceTargetPoint(
  placeEl: HTMLElement,
  canvasRect: DOMRect,
  sourcePoint: Point
): Point {
  const rect = placeEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2 - canvasRect.left;
  const cy = rect.top + rect.height / 2 - canvasRect.top;

  const dx = sourcePoint.x - cx;
  const dy = sourcePoint.y - cy;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Determine which edge to target based on angle
  if (absDx > absDy) {
    // Horizontal: left or right edge
    if (dx > 0) {
      // Source is to the right, arrive at right edge
      return { x: rect.right - canvasRect.left, y: cy };
    } else {
      // Source is to the left, arrive at left edge
      return { x: rect.left - canvasRect.left, y: cy };
    }
  } else {
    // Vertical: top or bottom edge
    if (dy > 0) {
      // Source is below, arrive at bottom edge
      return { x: cx, y: rect.bottom - canvasRect.top };
    } else {
      // Source is above, arrive at top edge
      return { x: cx, y: rect.top - canvasRect.top };
    }
  }
}
