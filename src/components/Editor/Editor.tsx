'use client';
import { Canvas } from '@/components/Canvas/Canvas';
import { Toolbar } from '@/components/Toolbar/Toolbar';
import { StatusBar } from '@/components/StatusBar/StatusBar';
import { Toast } from '@/components/Toast/Toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function Editor() {
  useKeyboardShortcuts();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-50">
      <Canvas />
      <Toolbar />
      <StatusBar />
      <Toast />
    </div>
  );
}
