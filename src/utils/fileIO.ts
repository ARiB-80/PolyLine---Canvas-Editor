import { Polyline } from '@/types/polyline';

export interface SaveFile {
  version: number;
  polylines: Polyline[];
}

export function serializePolylines(polylines: Polyline[]): string {
  const data: SaveFile = { version: 1, polylines };
  return JSON.stringify(data, null, 2);
}

export function deserializePolylines(json: string): Polyline[] {
  const data = JSON.parse(json) as SaveFile;
  if (!data || typeof data !== 'object') throw new Error('Invalid file format');
  if (data.version !== 1) throw new Error('Unsupported file version');
  if (!Array.isArray(data.polylines)) throw new Error('Missing polylines array');
  return data.polylines;
}

export function downloadJSON(polylines: Polyline[]): void {
  const content = serializePolylines(polylines);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'polylines.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function readJSONFile(): Promise<Polyline[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error('No file selected'));
      const text = await file.text();
      try {
        resolve(deserializePolylines(text));
      } catch (e) {
        reject(e);
      }
    };
    input.click();
  });
}
