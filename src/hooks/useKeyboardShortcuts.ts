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
        }
        return;
      }

      switch (key) {
        case 'b':
          store.setMode(store.mode === 'draw' ? 'idle' : 'draw');
          if (store.mode !== 'draw') {
            // Will begin polyline on first click
          }
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
        case 'q':
          window.close();
          break;
        case 'escape':
          if (store.mode === 'draw') {
            store.finishPolyline();
          }
          store.setMode('idle');
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [store]);
}
