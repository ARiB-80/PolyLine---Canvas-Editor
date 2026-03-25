import { Polyline } from '@/types/polyline';

export function buildSVGString(polylines: Polyline[], width: number, height: number): string {
  const elements = polylines
    .filter(poly => poly.points.length >= 2)
    .map(poly => {
      const pointsAttr = poly.points.map(p => `${p.x},${p.y}`).join(' ');
      const tag = poly.closed ? 'polygon' : 'polyline';
      return `  <${tag} points="${pointsAttr}" fill="none" stroke="${poly.color}" stroke-width="${poly.lineWidth}" stroke-linejoin="round" stroke-linecap="round" />`;
    });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    `  <rect width="100%" height="100%" fill="white" />`,
    ...elements,
    `</svg>`,
  ].join('\n');
}

export function downloadSVG(polylines: Polyline[], width: number, height: number): void {
  const svg = buildSVGString(polylines, width, height);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'polylines.svg';
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPNG(): void {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polylines.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
