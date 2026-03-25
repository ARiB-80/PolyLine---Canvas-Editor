export interface Point {
  x: number;
  y: number;
}

export interface Polyline {
  id: string;
  points: Point[];
  closed: boolean;
  color?: string;
  lineWidth?: number;
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
  mode: EditorMode;
  hoveredVertex: VertexRef | null;
  hoveredEdge: EdgeRef | null;
  history: Polyline[][];
  future: Polyline[][];
}
