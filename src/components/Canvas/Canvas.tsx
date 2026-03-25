'use client';
import { useRef, useEffect } from 'react';
import { useCanvasRenderer } from './useCanvasRenderer';
import { useCanvasInteraction } from './useCanvasInteraction';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCanvasRenderer(canvasRef);
  useCanvasInteraction(canvasRef);

  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ cursor: 'crosshair' }}
    />
  );
}
