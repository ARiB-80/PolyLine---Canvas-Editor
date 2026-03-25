'use client';
import { Canvas } from '@/components/Canvas/Canvas';
import { Toolbar } from '@/components/Toolbar/Toolbar';
import { StatusBar } from '@/components/StatusBar/StatusBar';
import { Toast } from '@/components/Toast/Toast';
import { PropertiesPanel } from '@/components/PropertiesPanel/PropertiesPanel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function Editor() {
  useKeyboardShortcuts();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-50">
      <Canvas />
      <Toolbar />
      <PropertiesPanel />
      <StatusBar />
      <Toast />
      <div className="fixed top-3 right-3 z-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs text-slate-500 flex flex-col gap-0.5 pointer-events-none">
        <span><kbd className="font-semibold text-slate-700">Space</kbd> + drag to pan</span>
        <span><kbd className="font-semibold text-slate-700">Scroll</kbd> to zoom &nbsp;·&nbsp; <kbd className="font-semibold text-slate-700">Ctrl+0</kbd> to reset</span>
      </div>
    </div>
  );
}
