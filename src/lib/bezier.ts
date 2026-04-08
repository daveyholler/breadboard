import type { Point } from "./geometry";

export function getConnectionPath(source: Point, target: Point): string {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const offset = Math.min(Math.max(distance * 0.4, 50), 200);

  // Source always exits to the right
  const cp1x = source.x + offset;
  const cp1y = source.y;

  // Target control point depends on which edge we're arriving at
  let cp2x: number;
  let cp2y: number;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Arriving horizontally
    if (dx > 0) {
      // Target is to the right, arriving at left edge
      cp2x = target.x - offset;
    } else {
      // Target is to the left (backwards), arriving at right edge
      cp2x = target.x + offset;
    }
    cp2y = target.y;
  } else {
    // Arriving vertically
    cp2x = target.x;
    if (dy > 0) {
      // Target is below
      cp2y = target.y - offset;
    } else {
      // Target is above
      cp2y = target.y + offset;
    }
  }

  return `M ${source.x} ${source.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${target.x} ${target.y}`;
}
