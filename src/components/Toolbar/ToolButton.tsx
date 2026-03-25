'use client';
import React from 'react';

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  tooltip: string;
}

export function ToolButton({ icon, label, shortcut, active, danger, onClick, tooltip }: ToolButtonProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        title={tooltip}
        className={`
          relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150
          ${active
            ? danger
              ? 'bg-red-100 text-red-600 ring-2 ring-red-400'
              : 'bg-violet-100 text-violet-700 ring-2 ring-violet-400'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }
        `}
      >
        {icon}
        {shortcut && (
          <span className={`
            absolute bottom-0.5 right-0.5 text-[8px] font-bold leading-none px-0.5 rounded
            ${active
              ? danger ? 'text-red-600' : 'text-violet-700'
              : 'text-slate-400'
            }
          `}>
            {shortcut}
          </span>
        )}
      </button>
      {/* Tooltip */}
      <div className="
        absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50
        bg-slate-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap
        opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none
      ">
        {tooltip}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
      </div>
    </div>
  );
}
