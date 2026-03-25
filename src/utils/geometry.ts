import { Point, Polyline, VertexRef, EdgeRef } from '@/types/polyline';

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function projectOnSegment(p: Point, a: Point, b: Point): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { ...a };
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  return { x: a.x + t * dx, y: a.y + t * dy };
}

export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const proj = projectOnSegment(p, a, b);
  return distance(p, proj);
}

export function nearestVertex(
  p: Point,
  polylines: Polyline[],
  hitRadius: number
): VertexRef | null {
  let best: VertexRef | null = null;
  let bestDist = hitRadius;
  for (const poly of polylines) {
    for (let i = 0; i < poly.points.length; i++) {
      const d = distance(p, poly.points[i]);
      if (d < bestDist) {
        bestDist = d;
        best = { polylineId: poly.id, vertexIndex: i };
      }
    }
  }
  return best;
}

export function nearestEdge(
  p: Point,
  polylines: Polyline[],
  hitRadius: number
): { ref: EdgeRef; projectedPoint: Point } | null {
  let best: { ref: EdgeRef; projectedPoint: Point } | null = null;
  let bestDist = hitRadius;
  for (const poly of polylines) {
    if (poly.points.length < 2) continue;
    const len = poly.closed ? poly.points.length : poly.points.length - 1;
    for (let i = 0; i < len; i++) {
      const a = poly.points[i];
      const b = poly.points[(i + 1) % poly.points.length];
      const d = distanceToSegment(p, a, b);
      if (d < bestDist) {
        bestDist = d;
        const proj = projectOnSegment(p, a, b);
        best = { ref: { polylineId: poly.id, edgeStartIndex: i }, projectedPoint: proj };
      }
    }
  }
  return best;
}
