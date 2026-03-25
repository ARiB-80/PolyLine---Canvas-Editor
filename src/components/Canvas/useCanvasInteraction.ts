'use client';
import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/state/useEditorStore';
import { nearestVertex, nearestEdge } from '@/utils/geometry';
import { HIT_RADIUS } from '@/constants/config';

export function useCanvasInteraction(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const isDragging = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function getPos(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onMouseMove(e: MouseEvent) {
      const pos = getPos(e);
      const store = useEditorStore.getState();
      store.setCursorPos(pos);

      const { mode, polylines, draggingVertex } = store;

      if (mode === 'move' && isDragging.current && draggingVertex) {
        store.moveVertex(draggingVertex, pos);
        return;
      }

      if (mode === 'move' || mode === 'delete') {
        const vref = nearestVertex(pos, polylines, HIT_RADIUS);
        store.setHoveredVertex(vref);
        store.setHoveredEdge(null);
      } else if (mode === 'insert') {
        const eref = nearestEdge(pos, polylines, HIT_RADIUS);
        store.setHoveredEdge(eref?.ref ?? null);
        store.setHoveredVertex(null);
      } else {
        store.setHoveredVertex(null);
        store.setHoveredEdge(null);
      }
    }

    function onMouseDown(e: MouseEvent) {
      const pos = getPos(e);
      const store = useEditorStore.getState();
      const { mode, polylines } = store;

      if (mode === 'move') {
        const vref = nearestVertex(pos, polylines, HIT_RADIUS);
        if (vref) {
          store.setDraggingVertex(vref);
          isDragging.current = true;
          // Push history snapshot before move
          useEditorStore.setState(s => ({
            history: [...s.history, s.polylines.map(p => ({ ...p, points: [...p.points] }))],
            future: [],
          }));
        }
      }
    }

    function onMouseUp(e: MouseEvent) {
      if (isDragging.current) {
        isDragging.current = false;
        useEditorStore.getState().setDraggingVertex(null);
      }
    }

    function onClick(e: MouseEvent) {
      const pos = getPos(e);
      const store = useEditorStore.getState();
      const { mode, polylines } = store;

      if (mode === 'draw') {
        store.addVertex(pos);
      } else if (mode === 'delete') {
        const vref = nearestVertex(pos, polylines, HIT_RADIUS);
        if (vref) {
          store.deleteVertex(vref);
        } else {
          store.showToast('No vertex near cursor');
        }
      } else if (mode === 'insert') {
        const eref = nearestEdge(pos, polylines, HIT_RADIUS);
        if (eref) {
          store.insertVertex(eref.ref.polylineId, eref.ref.edgeStartIndex, eref.projectedPoint);
        } else {
          store.showToast('No edge near cursor');
        }
      }
    }

    function onDblClick(e: MouseEvent) {
      const store = useEditorStore.getState();
      if (store.mode === 'draw') {
        store.finishPolyline();
        store.setMode('idle');
      }
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('dblclick', onDblClick);

    return () => {
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('dblclick', onDblClick);
    };
  }, [canvasRef]);
}
