'use client';
import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/state/useEditorStore';
import {
  drawGrid, drawPolyline, drawVertexDot,
  drawRubberBand, drawInsertionPoint
} from './drawingUtils';
import { projectOnSegment } from '@/utils/geometry';

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

      const { polylines, activePolylineId, mode, hoveredVertex, hoveredEdge, cursorPos } =
        useEditorStore.getState();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      drawGrid(ctx, canvas.width, canvas.height);

      // Polylines
      for (const poly of polylines) {
        drawPolyline(ctx, poly, poly.id === activePolylineId, hoveredEdge);
      }

      // Vertices
      for (const poly of polylines) {
        for (let i = 0; i < poly.points.length; i++) {
          const isHovered =
            hoveredVertex?.polylineId === poly.id && hoveredVertex?.vertexIndex === i;
          drawVertexDot(ctx, poly.points[i], isHovered);
        }
      }

      // Rubber band (draw mode)
      if (mode === 'draw' && activePolylineId) {
        const active = polylines.find(p => p.id === activePolylineId);
        if (active && active.points.length > 0) {
          drawRubberBand(ctx, active.points[active.points.length - 1], cursorPos);
        }
      }

      // Insert mode: show insertion point
      if (mode === 'insert' && hoveredEdge) {
        const poly = polylines.find(p => p.id === hoveredEdge.polylineId);
        if (poly) {
          const a = poly.points[hoveredEdge.edgeStartIndex];
          const b = poly.points[(hoveredEdge.edgeStartIndex + 1) % poly.points.length];
          if (a && b) {
            const proj = projectOnSegment(cursorPos, a, b);
            drawInsertionPoint(ctx, proj);
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
