'use client';
import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/state/useEditorStore';
import { nearestVertex, nearestEdge, screenToWorld } from '@/utils/geometry';
import { HIT_RADIUS } from '@/constants/config';

export function useCanvasInteraction(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const isDragging = useRef(false);
  const spaceDown = useRef(false);
  const isPanning = useRef(false);
  const panStartScreen = useRef({ x: 0, y: 0 });
  const panStartOffset = useRef({ x: 0, y: 0 });
  const didPan = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function getScreenPos(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function getWorldPos(e: MouseEvent) {
      const screen = getScreenPos(e);
      const { viewTransform } = useEditorStore.getState();
      return screenToWorld(screen, viewTransform);
    }

    function getWorldHitRadius() {
      return HIT_RADIUS / useEditorStore.getState().viewTransform.scale;
    }

    function updateCursor() {
      if (spaceDown.current) {
        canvas!.style.cursor = isPanning.current ? 'grabbing' : 'grab';
      } else {
        const { mode } = useEditorStore.getState();
        canvas!.style.cursor = mode === 'move' ? 'pointer' : 'crosshair';
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const screen = getScreenPos(e);
      useEditorStore.getState().zoomAtPoint(screen, -e.deltaY);
    }

    function onMouseMove(e: MouseEvent) {
      const screenPos = getScreenPos(e);
      const worldPos = screenToWorld(screenPos, useEditorStore.getState().viewTransform);
      const store = useEditorStore.getState();

      // Pan with space
      if (isPanning.current) {
        const dx = screenPos.x - panStartScreen.current.x;
        const dy = screenPos.y - panStartScreen.current.y;
        useEditorStore.setState({
          viewTransform: {
            scale: store.viewTransform.scale,
            offsetX: panStartOffset.current.x + dx,
            offsetY: panStartOffset.current.y + dy,
          },
        });
        didPan.current = true;
        // Update world cursor pos
        const newWorld = screenToWorld(screenPos, useEditorStore.getState().viewTransform);
        store.setCursorPos(newWorld);
        return;
      }

      store.setCursorPos(worldPos);

      const { mode, polylines, draggingVertex } = store;

      if (mode === 'move' && isDragging.current && draggingVertex) {
        store.moveVertex(draggingVertex, worldPos);
        return;
      }

      if (mode === 'move' || mode === 'delete') {
        const vref = nearestVertex(worldPos, polylines, getWorldHitRadius());
        store.setHoveredVertex(vref);
        store.setHoveredEdge(null);
      } else if (mode === 'insert') {
        const eref = nearestEdge(worldPos, polylines, getWorldHitRadius());
        store.setHoveredEdge(eref?.ref ?? null);
        store.setHoveredVertex(null);
      } else {
        store.setHoveredVertex(null);
        store.setHoveredEdge(null);
      }
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button === 1) {
        // Middle mouse button: start pan
        isPanning.current = true;
        panStartScreen.current = getScreenPos(e);
        panStartOffset.current = {
          x: useEditorStore.getState().viewTransform.offsetX,
          y: useEditorStore.getState().viewTransform.offsetY,
        };
        didPan.current = false;
        updateCursor();
        return;
      }

      if (spaceDown.current) {
        isPanning.current = true;
        panStartScreen.current = getScreenPos(e);
        panStartOffset.current = {
          x: useEditorStore.getState().viewTransform.offsetX,
          y: useEditorStore.getState().viewTransform.offsetY,
        };
        didPan.current = false;
        updateCursor();
        return;
      }

      const worldPos = getWorldPos(e);
      const store = useEditorStore.getState();
      const { mode, polylines } = store;

      if (mode === 'move') {
        const vref = nearestVertex(worldPos, polylines, getWorldHitRadius());
        if (vref) {
          store.setDraggingVertex(vref);
          isDragging.current = true;
          useEditorStore.setState(s => ({
            history: [...s.history, s.polylines.map(p => ({ ...p, points: [...p.points] }))],
            future: [],
          }));
        }
      }
    }

    function onMouseUp(e: MouseEvent) {
      if (isPanning.current) {
        isPanning.current = false;
        updateCursor();
        return;
      }
      if (isDragging.current) {
        isDragging.current = false;
        useEditorStore.getState().setDraggingVertex(null);
      }
    }

    function onClick(e: MouseEvent) {
      if (didPan.current) {
        didPan.current = false;
        return;
      }
      if (spaceDown.current) return;

      const worldPos = getWorldPos(e);
      const store = useEditorStore.getState();
      const { mode, polylines } = store;

      if (mode === 'draw') {
        store.addVertex(worldPos);
      } else if (mode === 'delete') {
        const vref = nearestVertex(worldPos, polylines, getWorldHitRadius());
        if (vref) {
          store.deleteVertex(vref);
        } else {
          store.showToast('No vertex near cursor');
        }
      } else if (mode === 'insert') {
        const eref = nearestEdge(worldPos, polylines, getWorldHitRadius());
        if (eref) {
          store.insertVertex(eref.ref.polylineId, eref.ref.edgeStartIndex, eref.projectedPoint);
        } else {
          store.showToast('No edge near cursor');
        }
      } else if (mode === 'idle') {
        // Select polyline by clicking near an edge
        const eref = nearestEdge(worldPos, polylines, getWorldHitRadius() * 1.5);
        store.selectPolyline(eref ? eref.ref.polylineId : null);
      }
    }

    function onDblClick(e: MouseEvent) {
      const store = useEditorStore.getState();
      if (store.mode === 'draw') {
        store.finishPolyline();
        store.setMode('idle');
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space') {
        spaceDown.current = true;
        updateCursor();
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') {
        spaceDown.current = false;
        isPanning.current = false;
        updateCursor();
      }
    }

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('dblclick', onDblClick);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('dblclick', onDblClick);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [canvasRef]);
}
