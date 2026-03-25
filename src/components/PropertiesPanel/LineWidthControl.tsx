'use client';

interface LineWidthControlProps {
  value: number;
  color: string;
  onChange: (width: number) => void;
}

export function LineWidthControl({ value, color, onChange }: LineWidthControlProps) {
  function clamp(v: number) {
    return Math.min(10, Math.max(1, v));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= 1}
          className="w-7 h-7 rounded-lg border border-gray-200 text-slate-600 text-sm font-bold
            hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold text-slate-700 tabular-nums">
          {value}
        </span>
        <button
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= 10}
          className="w-7 h-7 rounded-lg border border-gray-200 text-slate-600 text-sm font-bold
            hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
        <span className="text-xs text-slate-400 ml-1">px</span>
      </div>
      {/* Preview */}
      <div className="h-6 flex items-center px-1">
        <svg width="100%" height={value + 4} style={{ overflow: 'visible' }}>
          <line
            x1="0"
            y1={(value + 4) / 2}
            x2="100%"
            y2={(value + 4) / 2}
            stroke={color}
            strokeWidth={value}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
