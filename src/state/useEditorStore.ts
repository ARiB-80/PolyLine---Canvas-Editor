import { create } from 'zustand';
import { EditorMode, EditorState, Point, Polyline, VertexRef, EdgeRef } from '@/types/polyline';
import { generateId } from '@/utils/idGenerator';
import { MAX_POLYLINES } from '@/constants/config';

interface EditorStore extends EditorState {
  toast: string | null;
  cursorPos: Point;
  draggingVertex: VertexRef | null;

  setMode: (mode: EditorMode) => void;
  setCursorPos: (p: Point) => void;
  beginPolyline: () => void;
  addVertex: (p: Point) => void;
  finishPolyline: () => void;
  deleteVertex: (ref: VertexRef) => void;
  moveVertex: (ref: VertexRef, newPos: Point) => void;
  insertVertex: (polylineId: string, edgeStartIndex: number, point: Point) => void;
  setHoveredVertex: (ref: VertexRef | null) => void;
  setHoveredEdge: (ref: EdgeRef | null) => void;
  setDraggingVertex: (ref: VertexRef | null) => void;
  loadPolylines: (polylines: Polyline[]) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

function snapshot(polylines: Polyline[]): Polyline[] {
  return polylines.map(p => ({ ...p, points: [...p.points] }));
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  polylines: [],
  activePolylineId: null,
  mode: 'idle',
  hoveredVertex: null,
  hoveredEdge: null,
  history: [],
  future: [],
  toast: null,
  cursorPos: { x: 0, y: 0 },
  draggingVertex: null,

  setMode: (mode) => {
    const prev = get().mode;
    if (prev === 'draw' && mode !== 'draw') {
      get().finishPolyline();
    }
    set({ mode, hoveredVertex: null, hoveredEdge: null });
  },

  setCursorPos: (p) => set({ cursorPos: p }),

  beginPolyline: () => {
    const { polylines } = get();
    if (polylines.length >= MAX_POLYLINES) {
      get().showToast('Maximum 100 polylines reached');
      return;
    }
    const id = generateId();
    const newPoly: Polyline = { id, points: [], closed: false };
    set(s => ({
      polylines: [...s.polylines, newPoly],
      activePolylineId: id,
      history: [...s.history, snapshot(s.polylines)],
      future: [],
    }));
  },

  addVertex: (p) => {
    const { activePolylineId } = get();
    if (!activePolylineId) {
      get().beginPolyline();
    }
    const id = get().activePolylineId;
    if (!id) return;
    set(s => ({
      polylines: s.polylines.map(poly =>
        poly.id === id ? { ...poly, points: [...poly.points, p] } : poly
      ),
    }));
  },

  finishPolyline: () => {
    const { activePolylineId, polylines } = get();
    if (!activePolylineId) return;
    const poly = polylines.find(p => p.id === activePolylineId);
    if (poly && poly.points.length < 2) {
      // Remove single-point polyline
      set(s => ({
        polylines: s.polylines.filter(p => p.id !== activePolylineId),
        activePolylineId: null,
      }));
    } else {
      set({ activePolylineId: null });
    }
  },

  deleteVertex: (ref) => {
    const { polylines } = get();
    const poly = polylines.find(p => p.id === ref.polylineId);
    if (!poly) return;
    if (poly.points.length === 0) {
      get().showToast('No vertices to delete');
      return;
    }
    set(s => ({
      history: [...s.history, snapshot(s.polylines)],
      future: [],
      polylines: s.polylines.map(p => {
        if (p.id !== ref.polylineId) return p;
        const newPoints = p.points.filter((_, i) => i !== ref.vertexIndex);
        return { ...p, points: newPoints };
      }).filter(p => p.points.length > 0),
    }));
  },

  moveVertex: (ref, newPos) => {
    set(s => ({
      polylines: s.polylines.map(p => {
        if (p.id !== ref.polylineId) return p;
        const pts = [...p.points];
        pts[ref.vertexIndex] = newPos;
        return { ...p, points: pts };
      }),
    }));
  },

  insertVertex: (polylineId, edgeStartIndex, point) => {
    set(s => ({
      history: [...s.history, snapshot(s.polylines)],
      future: [],
      polylines: s.polylines.map(p => {
        if (p.id !== polylineId) return p;
        const pts = [...p.points];
        pts.splice(edgeStartIndex + 1, 0, point);
        return { ...p, points: pts };
      }),
    }));
  },

  setHoveredVertex: (ref) => set({ hoveredVertex: ref }),
  setHoveredEdge: (ref) => set({ hoveredEdge: ref }),
  setDraggingVertex: (ref) => set({ draggingVertex: ref }),

  loadPolylines: (polylines) => {
    set(s => ({
      history: [...s.history, snapshot(s.polylines)],
      future: [],
      polylines,
      activePolylineId: null,
      mode: 'idle',
    }));
  },

  clearAll: () => {
    set(s => ({
      history: [...s.history, snapshot(s.polylines)],
      future: [],
      polylines: [],
      activePolylineId: null,
    }));
  },

  undo: () => {
    const { history } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set(s => ({
      history: s.history.slice(0, -1),
      future: [snapshot(s.polylines), ...s.future],
      polylines: prev,
      activePolylineId: null,
    }));
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set(s => ({
      future: s.future.slice(1),
      history: [...s.history, snapshot(s.polylines)],
      polylines: next,
      activePolylineId: null,
    }));
  },

  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => get().clearToast(), 2500);
  },

  clearToast: () => set({ toast: null }),
}));
