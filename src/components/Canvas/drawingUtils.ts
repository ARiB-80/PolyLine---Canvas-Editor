import { Point, Polyline, VertexRef, EdgeRef } from '@/types/polyline';
import {
  LINE_COLOR, LINE_WIDTH, VERTEX_RADIUS, HOVERED_VERTEX_RADIUS,
  VERTEX_COLOR, ACCENT_COLOR, GRID_SIZE, GRID_DOT_COLOR
} from '@/constants/config';

export function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = GRID_DOT_COLOR;
  for (let x = GRID_SIZE; x < width; x += GRID_SIZE) {
    for (let y = GRID_SIZE; y < height; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawPolyline(
  ctx: CanvasRenderingContext2D,
  poly: Polyline,
  isActive: boolean,
  hoveredEdge: EdgeRef | null
) {
  if (poly.points.length === 0) return;
  ctx.save();
  ctx.strokeStyle = poly.color || LINE_COLOR;
  ctx.lineWidth = poly.lineWidth || LINE_WIDTH;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (poly.points.length === 1) {
    drawVertexDot(ctx, poly.points[0], false);
    ctx.restore();
    return;
  }

  for (let i = 0; i < poly.points.length - 1; i++) {
    const a = poly.points[i];
    const b = poly.points[i + 1];
    const isHovered = hoveredEdge?.polylineId === poly.id && hoveredEdge?.edgeStartIndex === i;

    ctx.beginPath();
    ctx.strokeStyle = isHovered ? ACCENT_COLOR : (poly.color || LINE_COLOR);
    ctx.lineWidth = isHovered ? (poly.lineWidth || LINE_WIDTH) + 1 : (poly.lineWidth || LINE_WIDTH);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  if (poly.closed && poly.points.length > 2) {
    const a = poly.points[poly.points.length - 1];
    const b = poly.points[0];
    ctx.beginPath();
    ctx.strokeStyle = poly.color || LINE_COLOR;
    ctx.lineWidth = poly.lineWidth || LINE_WIDTH;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawVertexDot(ctx: CanvasRenderingContext2D, p: Point, hovered: boolean) {
  ctx.save();
  if (hovered) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, HOVERED_VERTEX_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = ACCENT_COLOR + '4D'; // 30% opacity
    ctx.fill();
    ctx.strokeStyle = ACCENT_COLOR;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(p.x, p.y, VERTEX_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = VERTEX_COLOR;
  ctx.fill();
  ctx.restore();
}

export function drawRubberBand(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = ACCENT_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

export function drawInsertionPoint(ctx: CanvasRenderingContext2D, p: Point) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = ACCENT_COLOR;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
  ctx.strokeStyle = ACCENT_COLOR;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}
