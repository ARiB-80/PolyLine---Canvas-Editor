'use client';
import { useEffect } from 'react';
import { useEditorStore } from '@/state/useEditorStore';
import { downloadJSON, readJSONFile } from '@/utils/fileIO';

export function useKeyboardShortcuts() {
  const store = useEditorStore();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const key = e.key.toLowerCase();

      if (e.ctrlKey || e.metaKey) {
        if (key === 's') {
          e.preventDefault();
          downloadJSON(useEditorStore.getState().polylines);
        } else if (key === 'o') {
          e.preventDefault();
          readJSONFile()
            .then(polys => useEditorStore.getState().loadPolylines(polys))
            .catch(() => useEditorStore.getState().showToast('Failed to load file'));
        } else if (key === 'z') {
          e.preventDefault();
          useEditorStore.getState().undo();
        } else if (key === 'y') {
          e.preventDefault();
          useEditorStore.getState().redo();
        } else if (key === '0') {
          e.preventDefault();
          useEditorStore.getState().resetView();
        } else if (key === '=' || key === '+') {
          e.preventDefault();
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            useEditorStore.getState().zoomAtPoint({ x: cx, y: cy }, 1);
          }
        } else if (key === '-') {
          e.preventDefault();
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            useEditorStore.getState().zoomAtPoint({ x: cx, y: cy }, -1);
          }
        }
        return;
      }

      switch (key) {
        case 'b':
          store.setMode(store.mode === 'draw' ? 'idle' : 'draw');
          break;
        case 'c':
          useEditorStore.getState().closePolyline();
          break;
        case 'm':
          store.setMode(store.mode === 'move' ? 'idle' : 'move');
          break;
        case 'd':
          store.setMode(store.mode === 'delete' ? 'idle' : 'delete');
          break;
        case 'i':
          store.setMode(store.mode === 'insert' ? 'idle' : 'insert');
          break;
        case 'r':
          store.clearAll();
          break;
        case 'e': {
          const s = useEditorStore.getState();
          s.setExportMenuOpen(!s.exportMenuOpen);
          break;
        }
        case 'q':
          window.close();
          break;
        case 'escape':
          if (store.mode === 'draw') {
            store.finishPolyline();
          }
          store.setMode('idle');
          store.selectPolyline(null);
          useEditorStore.getState().setExportMenuOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [store]);
}
