'use client';
import { useState } from 'react';

const PRESET_COLORS = [
  '#1E293B', '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#14B8A6', '#3B82F6', '#7C3AED',
  '#EC4899', '#94A3B8', '#FFFFFF', '#000000',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hex, setHex] = useState(value);

  function handleHexBlur() {
    const cleaned = hex.startsWith('#') ? hex : `#${hex}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) {
      onChange(cleaned);
    } else {
      setHex(value);
    }
  }

  function handleHexChange(v: string) {
    setHex(v);
    const cleaned = v.startsWith('#') ? v : `#${v}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) {
      onChange(cleaned);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-6 gap-1">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            onClick={() => { setHex(c); onChange(c); }}
            style={{ backgroundColor: c }}
            className={`
              w-6 h-6 rounded-md border transition-all
              ${value === c
                ? 'border-violet-500 ring-2 ring-violet-300 scale-110'
                : 'border-gray-200 hover:scale-110'
              }
              ${c === '#FFFFFF' ? 'border-gray-300' : ''}
            `}
            title={c}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={e => { setHex(e.target.value); onChange(e.target.value); }}
          className="w-6 h-6 rounded border border-gray-200 cursor-pointer shrink-0 p-0"
          style={{ padding: 0 }}
          title="Pick a color"
        />
        <input
          type="text"
          value={hex}
          onChange={e => handleHexChange(e.target.value)}
          onBlur={handleHexBlur}
          maxLength={7}
          className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-violet-400"
          placeholder="#1E293B"
        />
      </div>
    </div>
  );
}
