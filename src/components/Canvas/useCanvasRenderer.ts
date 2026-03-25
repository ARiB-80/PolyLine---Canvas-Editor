'use client';
import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/state/useEditorStore';
import {
  drawGrid, drawPolyline, drawVertexDot,
  drawRubberBand, drawInsertionPoint, drawSelectionHighlight
} from './drawingUtils';
import { projectOnSegment, worldToScreen } from '@/utils/geometry';

export function useCanvasRenderer(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let running = true;

    function render() {
      if (!running) return;
      rafRef.current = requestAnimationFrame(render);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const {
        polylines, activePolylineId, selectedPolylineId,
        mode, hoveredVertex, hoveredEdge, cursorPos, viewTransform
      } = useEditorStore.getState();

      const { scale, offsetX, offsetY } = viewTransform;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // === WORLD SPACE: grid + polylines ===
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // Grid
      drawGrid(ctx, canvas.width, canvas.height, viewTransform);

      // Selection highlight (drawn before polylines so it's behind)
      if (selectedPolylineId) {
        const sel = polylines.find(p => p.id === selectedPolylineId);
        if (sel) drawSelectionHighlight(ctx, sel);
      }

      // Polylines
      for (const poly of polylines) {
        drawPolyline(ctx, poly, poly.id === activePolylineId, hoveredEdge);
      }

      ctx.restore();
      // === SCREEN SPACE: vertex dots + overlays ===

      // Vertices (constant screen size)
      for (const poly of polylines) {
        for (let i = 0; i < poly.points.length; i++) {
          const screenPt = worldToScreen(poly.points[i], viewTransform);
          const isHovered =
            hoveredVertex?.polylineId === poly.id && hoveredVertex?.vertexIndex === i;
          drawVertexDot(ctx, screenPt, isHovered);
        }
      }

      // Rubber band (draw mode) — cursorPos is world coords
      if (mode === 'draw' && activePolylineId) {
        const active = polylines.find(p => p.id === activePolylineId);
        if (active && active.points.length > 0) {
          const lastScreen = worldToScreen(active.points[active.points.length - 1], viewTransform);
          const cursorScreen = worldToScreen(cursorPos, viewTransform);
          drawRubberBand(ctx, lastScreen, cursorScreen);
        }
      }

      // Insert mode: insertion point (screen space)
      if (mode === 'insert' && hoveredEdge) {
        const poly = polylines.find(p => p.id === hoveredEdge.polylineId);
        if (poly) {
          const a = poly.points[hoveredEdge.edgeStartIndex];
          const b = poly.points[(hoveredEdge.edgeStartIndex + 1) % poly.points.length];
          if (a && b) {
            const proj = projectOnSegment(cursorPos, a, b);
            const screenProj = worldToScreen(proj, viewTransform);
            drawInsertionPoint(ctx, screenProj);
          }
        }
      }
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef]);
}
