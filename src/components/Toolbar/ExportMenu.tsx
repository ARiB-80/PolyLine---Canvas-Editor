'use client';
import { Image, FileCode } from 'lucide-react';
import { useEditorStore } from '@/state/useEditorStore';
import { downloadSVG, exportPNG } from '@/utils/exportUtils';

export function ExportMenu() {
  const open = useEditorStore(s => s.exportMenuOpen);
  const setOpen = useEditorStore(s => s.setExportMenuOpen);
  const polylines = useEditorStore(s => s.polylines);

  if (!open) return null;

  function handleSVG() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    const w = canvas?.width ?? 1920;
    const h = canvas?.height ?? 1080;
    downloadSVG(polylines, w, h);
    setOpen(false);
  }

  function handlePNG() {
    exportPNG();
    setOpen(false);
  }

  return (
    <div className="
      absolute left-full ml-2 top-0
      bg-white border border-gray-200 rounded-xl shadow-lg
      p-1.5 flex flex-col gap-0.5 w-40 z-50
    ">
      <button
        onClick={handleSVG}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700
          hover:bg-violet-50 hover:text-violet-700 transition-colors text-left"
      >
        <FileCode size={15} strokeWidth={2.5} />
        Download SVG
      </button>
      <button
        onClick={handlePNG}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700
          hover:bg-violet-50 hover:text-violet-700 transition-colors text-left"
      >
        <Image size={15} strokeWidth={2.5} />
        Download PNG
      </button>
    </div>
  );
}
