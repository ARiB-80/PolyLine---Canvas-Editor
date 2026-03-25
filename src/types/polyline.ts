export interface Point {
  x: number;
  y: number;
}

export interface Polyline {
  id: string;
  points: Point[];
  closed: boolean;
  color: string;
  lineWidth: number;
}

export interface ViewTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export type EditorMode = 'idle' | 'draw' | 'move' | 'delete' | 'insert';

export interface VertexRef {
  polylineId: string;
  vertexIndex: number;
}

export interface EdgeRef {
  polylineId: string;
  edgeStartIndex: number;
}

export interface EditorState {
  polylines: Polyline[];
  activePolylineId: string | null;
  selectedPolylineId: string | null;
  mode: EditorMode;
  hoveredVertex: VertexRef | null;
  hoveredEdge: EdgeRef | null;
  viewTransform: ViewTransform;
  history: Polyline[][];
  future: Polyline[][];
}
