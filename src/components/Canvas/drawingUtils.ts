import { Point, Polyline, EdgeRef, ViewTransform } from '@/types/polyline';
import {
  VERTEX_RADIUS, HOVERED_VERTEX_RADIUS,
  VERTEX_COLOR, ACCENT_COLOR, GRID_SIZE, GRID_DOT_COLOR,
  LINE_COLOR, LINE_WIDTH
} from '@/constants/config';

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  view: ViewTransform
) {
  const { scale, offsetX, offsetY } = view;

  // Adjust grid spacing based on zoom
  let spacing = GRID_SIZE;
  if (scale < 0.25) spacing = 100;
  else if (scale < 0.5) spacing = 40;

  // Visible world bounds
  const wLeft = -offsetX / scale;
  const wTop = -offsetY / scale;
  const wRight = (width - offsetX) / scale;
  const wBottom = (height - offsetY) / scale;

  const startX = Math.floor(wLeft / spacing) * spacing;
  const startY = Math.floor(wTop / spacing) * spacing;

  // Draw in world space (ctx is already transformed)
  const dotRadius = 0.8 / scale; // constant ~0.8px on screen
  ctx.fillStyle = GRID_DOT_COLOR;
  for (let x = startX; x <= wRight; x += spacing) {
    for (let y = startY; y <= wBottom; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
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
  const color = poly.color || LINE_COLOR;
  const lw = poly.lineWidth || LINE_WIDTH;

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (poly.points.length === 1) {
    ctx.restore();
    return;
  }

  const edgeCount = poly.closed ? poly.points.length : poly.points.length - 1;
  for (let i = 0; i < edgeCount; i++) {
    const a = poly.points[i];
    const b = poly.points[(i + 1) % poly.points.length];
    const isHovered = hoveredEdge?.polylineId === poly.id && hoveredEdge?.edgeStartIndex === i;
    ctx.beginPath();
    ctx.strokeStyle = isHovered ? ACCENT_COLOR : color;
    ctx.lineWidth = isHovered ? lw + 1 : lw;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawSelectionHighlight(ctx: CanvasRenderingContext2D, poly: Polyline) {
  if (poly.points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = ACCENT_COLOR + '55';
  ctx.lineWidth = (poly.lineWidth || LINE_WIDTH) + 5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(poly.points[0].x, poly.points[0].y);
  for (let i = 1; i < poly.points.length; i++) {
    ctx.lineTo(poly.points[i].x, poly.points[i].y);
  }
  if (poly.closed) ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function drawVertexDot(ctx: CanvasRenderingContext2D, p: Point, hovered: boolean) {
  ctx.save();
  if (hovered) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, HOVERED_VERTEX_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = ACCENT_COLOR + '4D';
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
