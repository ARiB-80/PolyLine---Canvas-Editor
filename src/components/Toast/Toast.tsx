'use client';
import { useEditorStore } from '@/state/useEditorStore';

export function Toast() {
  const toast = useEditorStore(s => s.toast);
  if (!toast) return null;

  return (
    <div className="
      fixed top-4 left-1/2 -translate-x-1/2 z-50
      bg-slate-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg
      animate-fade-in pointer-events-none
    ">
      {toast}
    </div>
  );
}
