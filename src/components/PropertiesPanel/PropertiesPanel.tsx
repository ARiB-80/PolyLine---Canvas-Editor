'use client';
import { X } from 'lucide-react';
import { useEditorStore } from '@/state/useEditorStore';
import { ColorPicker } from './ColorPicker';
import { LineWidthControl } from './LineWidthControl';

export function PropertiesPanel() {
  const selectedId = useEditorStore(s => s.selectedPolylineId);
  const polylines = useEditorStore(s => s.polylines);
  const selectPolyline = useEditorStore(s => s.selectPolyline);
  const setPolylineColor = useEditorStore(s => s.setPolylineColor);
  const setPolylineLineWidth = useEditorStore(s => s.setPolylineLineWidth);

  const selected = selectedId ? polylines.find(p => p.id === selectedId) : null;

  if (!selected) return null;

  return (
    <div className="
      fixed right-4 top-1/2 -translate-y-1/2 z-10
      bg-white/90 backdrop-blur-sm border border-gray-200
      rounded-xl shadow-md p-3 w-52 flex flex-col gap-3
    ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          Properties
        </span>
        <button
          onClick={() => selectPolyline(null)}
          className="w-5 h-5 flex items-center justify-center rounded text-slate-400
            hover:text-slate-600 hover:bg-gray-100 transition-colors"
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs text-slate-500 mb-1.5">Color</label>
        <ColorPicker
          value={selected.color}
          onChange={color => setPolylineColor(selected.id, color)}
        />
      </div>

      <div className="w-full h-px bg-gray-100" />

      {/* Line width */}
      <div>
        <label className="block text-xs text-slate-500 mb-1.5">Line Width</label>
        <LineWidthControl
          value={selected.lineWidth}
          color={selected.color}
          onChange={w => setPolylineLineWidth(selected.id, w)}
        />
      </div>

      <div className="w-full h-px bg-gray-100" />

      {/* Info */}
      <div className="text-xs text-slate-400 space-y-0.5">
        <div>{selected.points.length} vertices</div>
        <div>{selected.closed ? 'Closed polygon' : 'Open path'}</div>
      </div>
    </div>
  );
}
