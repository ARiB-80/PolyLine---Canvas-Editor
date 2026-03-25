"use client";
import { useEditorStore } from "@/state/useEditorStore";

const MODE_LABELS: Record<string, string> = {
  idle: "Idle",
  draw: "Draw — click to add points",
  move: "Move — click & drag a vertex",
  delete: "Delete — click a vertex",
  insert: "Insert — click near an edge",
};

const MODE_COLORS: Record<string, string> = {
  idle: "text-slate-500",
  draw: "text-violet-700 font-semibold",
  move: "text-blue-600 font-semibold",
  delete: "text-red-600 font-semibold",
  insert: "text-green-600 font-semibold",
};

export function StatusBar() {
  const mode = useEditorStore((s) => s.mode);
  const polylines = useEditorStore((s) => s.polylines);
  const cursorPos = useEditorStore((s) => s.cursorPos);
  const scale = useEditorStore((s) => s.viewTransform.scale);

  const zoomPct = Math.round(scale * 100);

  return (
    <div
      className="
      fixed bottom-0 left-0 right-0 h-8 z-10
      bg-white/80 backdrop-blur-sm border-t border-gray-200
      flex items-center px-4 gap-4 text-xs
    "
    >
      <span className={MODE_COLORS[mode]}>
        Mode: {MODE_LABELS[mode] ?? mode}
      </span>
      <span className="text-slate-300">•</span>
      <span className="text-slate-500">
        Polylines: {polylines.length} / 100
      </span>
      <span className="text-slate-300">•</span>
      <span className="text-slate-500 tabular-nums">
        Zoom: {zoomPct}%
      </span>
      <span className="text-slate-300">•</span>
      <span className="text-slate-400 font-mono tabular-nums">
        ({Math.round(cursorPos.x)}, {Math.round(cursorPos.y)})
      </span>
    </div>
  );
}
