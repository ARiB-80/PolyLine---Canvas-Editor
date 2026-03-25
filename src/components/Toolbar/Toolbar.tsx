'use client';
import {
  Pencil, Hand, Trash2, Plus, Save, FolderOpen, Undo2, Redo2, Eraser
} from 'lucide-react';
import { ToolButton } from './ToolButton';
import { useEditorStore } from '@/state/useEditorStore';
import { downloadJSON, readJSONFile } from '@/utils/fileIO';
import { EditorMode } from '@/types/polyline';

export function Toolbar() {
  const mode = useEditorStore(s => s.mode);
  const setMode = useEditorStore(s => s.setMode);
  const undo = useEditorStore(s => s.undo);
  const redo = useEditorStore(s => s.redo);
  const clearAll = useEditorStore(s => s.clearAll);
  const loadPolylines = useEditorStore(s => s.loadPolylines);
  const showToast = useEditorStore(s => s.showToast);
  const polylines = useEditorStore(s => s.polylines);

  const toggleMode = (m: EditorMode) => setMode(mode === m ? 'idle' : m);

  const handleSave = () => downloadJSON(polylines);
  const handleLoad = () => {
    readJSONFile()
      .then(polys => loadPolylines(polys))
      .catch(() => showToast('Failed to load file'));
  };

  return (
    <div className="
      fixed left-4 top-1/2 -translate-y-1/2 z-10
      bg-white/90 backdrop-blur-sm border border-gray-200
      rounded-xl shadow-md p-1.5 flex flex-col gap-1
    ">
      {/* Logo */}
      <div className="w-10 h-8 flex items-center justify-center text-violet-700">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <polyline points="2,16 6,8 10,12 14,4 18,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="w-full h-px bg-gray-200 my-0.5" />

      {/* Mode tools */}
      <ToolButton
        icon={<Pencil size={18} strokeWidth={2.5} />}
        label="Draw"
        shortcut="B"
        active={mode === 'draw'}
        onClick={() => toggleMode('draw')}
        tooltip="Draw (B)"
      />
      <ToolButton
        icon={<Hand size={18} strokeWidth={2.5} />}
        label="Move"
        shortcut="M"
        active={mode === 'move'}
        onClick={() => toggleMode('move')}
        tooltip="Move vertex (M)"
      />
      <ToolButton
        icon={<Trash2 size={18} strokeWidth={2.5} />}
        label="Delete"
        shortcut="D"
        active={mode === 'delete'}
        danger
        onClick={() => toggleMode('delete')}
        tooltip="Delete vertex (D)"
      />
      <ToolButton
        icon={<Plus size={18} strokeWidth={2.5} />}
        label="Insert"
        shortcut="I"
        active={mode === 'insert'}
        onClick={() => toggleMode('insert')}
        tooltip="Insert vertex (I)"
      />

      <div className="w-full h-px bg-gray-200 my-0.5" />

      {/* File */}
      <ToolButton
        icon={<Save size={18} strokeWidth={2.5} />}
        label="Save"
        onClick={handleSave}
        tooltip="Save (Ctrl+S)"
      />
      <ToolButton
        icon={<FolderOpen size={18} strokeWidth={2.5} />}
        label="Load"
        onClick={handleLoad}
        tooltip="Load (Ctrl+O)"
      />

      <div className="w-full h-px bg-gray-200 my-0.5" />

      {/* History */}
      <ToolButton
        icon={<Undo2 size={18} strokeWidth={2.5} />}
        label="Undo"
        onClick={undo}
        tooltip="Undo (Ctrl+Z)"
      />
      <ToolButton
        icon={<Redo2 size={18} strokeWidth={2.5} />}
        label="Redo"
        onClick={redo}
        tooltip="Redo (Ctrl+Y)"
      />

      <div className="w-full h-px bg-gray-200 my-0.5" />

      {/* Clear */}
      <ToolButton
        icon={<Eraser size={18} strokeWidth={2.5} />}
        label="Clear"
        shortcut="R"
        danger
        onClick={clearAll}
        tooltip="Clear all (R)"
      />
    </div>
  );
}
