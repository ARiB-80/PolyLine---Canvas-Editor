import { create } from 'zustand';
import { EditorMode, EditorState, Point, Polyline, VertexRef, EdgeRef, ViewTransform } from '@/types/polyline';
import { generateId } from '@/utils/idGenerator';
import { MAX_POLYLINES, DEFAULT_COLOR, DEFAULT_LINE_WIDTH, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from '@/constants/config';
import { screenToWorld } from '@/utils/geometry';

interface EditorStore extends EditorState {
  toast: string | null;
  cursorPos: Point;         // world coordinates
  draggingVertex: VertexRef | null;
  exportMenuOpen: boolean;

  setMode: (mode: EditorMode) => void;
  setCursorPos: (p: Point) => void;
  beginPolyline: () => void;
  addVertex: (p: Point) => void;
  finishPolyline: () => void;
  closePolyline: () => void;
  deleteVertex: (ref: VertexRef) => void;
  moveVertex: (ref: VertexRef, newPos: Point) => void;
  insertVertex: (polylineId: string, edgeStartIndex: number, point: Point) => void;
  setHoveredVertex: (ref: VertexRef | null) => void;
  setHoveredEdge: (ref: EdgeRef | null) => void;
  setDraggingVertex: (ref: VertexRef | null) => void;
  selectPolyline: (id: string | null) => void;
  setPolylineColor: (id: string, color: string) => void;
  setPolylineLineWidth: (id: string, width: number) => void;
  loadPolylines: (polylines: Polyline[]) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  zoomAtPoint: (screenPt: Point, delta: number) => void;
  pan: (deltaX: number, deltaY: number) => void;
  resetView: () => void;
  setExportMenuOpen: (open: boolean) => void;
}

function snapshot(polylines: Polyline[]): Polyline[] {
  return polylines.map(p => ({ ...p, points: [...p.points] }));
}

const DEFAULT_VIEW: ViewTransform = { scale: 1, offsetX: 0, offsetY: 0 };

export const useEditorStore = create<EditorStore>((set, get) => ({
  polylines: [],
  activePolylineId: null,
  selectedPolylineId: null,
  mode: 'idle',
  hoveredVertex: null,
  hoveredEdge: null,
  viewTransform: DEFAULT_VIEW,
  history: [],
  future: [],
  toast: null,
  cursorPos: { x: 0, y: 0 },
  draggingVertex: null,
  exportMenuOpen: false,

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
    const newPoly: Polyline = {
      id,
      points: [],
      closed: false,
      color: DEFAULT_COLOR,
      lineWidth: DEFAULT_LINE_WIDTH,
    };
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
      set(s => ({
        polylines: s.polylines.filter(p => p.id !== activePolylineId),
        activePolylineId: null,
      }));
    } else {
      set({ activePolylineId: null });
    }
  },

  closePolyline: () => {
    const { activePolylineId, polylines } = get();
    if (!activePolylineId) {
      get().showToast('Start drawing first (press B)');
      return;
    }
    const poly = polylines.find(p => p.id === activePolylineId);
    if (!poly || poly.points.length < 3) {
      get().showToast('Need at least 3 points to close');
      return;
    }
    set(s => ({
      history: [...s.history, snapshot(s.polylines)],
      future: [],
      polylines: s.polylines.map(p =>
        p.id === activePolylineId ? { ...p, closed: true } : p
      ),
      activePolylineId: null,
      mode: 'idle',
    }));
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
      polylines: s.polylines
        .map(p => {
          if (p.id !== ref.polylineId) return p;
          const newPoints = p.points.filter((_, i) => i !== ref.vertexIndex);
          // If deleting from a closed polyline leaves < 3 points, open it
          const stillClosed = p.closed && newPoints.length >= 3;
          return { ...p, points: newPoints, closed: stillClosed };
        })
        .filter(p => p.points.length > 0),
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

  selectPolyline: (id) => set({ selectedPolylineId: id }),

  setPolylineColor: (id, color) => {
    set(s => ({
      history: [...s.history, snapshot(s.polylines)],
      future: [],
      polylines: s.polylines.map(p => p.id === id ? { ...p, color } : p),
    }));
  },

  setPolylineLineWidth: (id, width) => {
    set(s => ({
      history: [...s.history, snapshot(s.polylines)],
      future: [],
      polylines: s.polylines.map(p => p.id === id ? { ...p, lineWidth: width } : p),
    }));
  },

  loadPolylines: (polylines) => {
    set(s => ({
      history: [...s.history, snapshot(s.polylines)],
      future: [],
      polylines,
      activePolylineId: null,
      selectedPolylineId: null,
      mode: 'idle',
    }));
  },

  clearAll: () => {
    set(s => ({
      history: [...s.history, snapshot(s.polylines)],
      future: [],
      polylines: [],
      activePolylineId: null,
      selectedPolylineId: null,
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
      selectedPolylineId: null,
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
      selectedPolylineId: null,
    }));
  },

  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => get().clearToast(), 2500);
  },

  clearToast: () => set({ toast: null }),

  zoomAtPoint: (screenPt, delta) => {
    const { viewTransform } = get();
    const zoomFactor = delta > 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
    const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, viewTransform.scale * zoomFactor));
    const worldPt = screenToWorld(screenPt, viewTransform);
    set({
      viewTransform: {
        scale: newScale,
        offsetX: screenPt.x - worldPt.x * newScale,
        offsetY: screenPt.y - worldPt.y * newScale,
      },
    });
  },

  pan: (deltaX, deltaY) => {
    set(s => ({
      viewTransform: {
        ...s.viewTransform,
        offsetX: s.viewTransform.offsetX + deltaX,
        offsetY: s.viewTransform.offsetY + deltaY,
      },
    }));
  },

  resetView: () => set({ viewTransform: DEFAULT_VIEW }),

  setExportMenuOpen: (open) => set({ exportMenuOpen: open }),
}));
