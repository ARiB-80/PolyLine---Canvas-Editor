# PolyLine Editor

A browser-based polyline drawing editor built with Next.js, TypeScript, Tailwind CSS, and the HTML5 Canvas API.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Features

### Drawing Tools

| Key | Tool       | Description                                                                                                                  |
| --- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `B` | **Draw**   | Start a new polyline. Each click adds a vertex. Double-click or press `Escape` to finish the path as an open polyline.       |
| `C` | **Close**  | While drawing, press `C` to connect the last vertex back to the first, forming a closed polygon. Requires at least 3 points. |
| `M` | **Move**   | Click and drag any vertex to reposition it. Connected edges follow in real time.                                             |
| `D` | **Delete** | Click the nearest vertex to remove it. Its two neighbors are reconnected automatically.                                      |
| `I` | **Insert** | Click near any edge to split it and insert a new vertex at that point.                                                       |

### File Operations

| Shortcut | Action                                                              |
| -------- | ------------------------------------------------------------------- |
| `Ctrl+S` | Save all polylines to a JSON file (`polylines.json`).               |
| `Ctrl+O` | Load polylines from a previously saved JSON file.                   |
| `E`      | Open the Export menu to download the drawing as **SVG** or **PNG**. |

### Navigation

| Input               | Action                                                 |
| ------------------- | ------------------------------------------------------ |
| **Scroll wheel**    | Zoom in / out, centered on the cursor.                 |
| `Space` + drag      | Pan the canvas.                                        |
| Middle mouse + drag | Pan the canvas (alternative).                          |
| `Ctrl++` / `Ctrl+-` | Zoom in / out by a fixed step, centered on the canvas. |
| `Ctrl+0`            | Reset zoom to 100% and return to the origin.           |

### Editing History

| Shortcut | Action                                          |
| -------- | ----------------------------------------------- |
| `Ctrl+Z` | Undo the last change.                           |
| `Ctrl+Y` | Redo the last undone change.                    |
| `R`      | Clear all polylines from the canvas (undoable). |

### Per-Polyline Styling

Click any polyline while in **Idle** mode to select it and open the **Properties Panel** on the right side of the canvas. From there you can:

- **Color** — choose from 12 preset swatches, use the native color picker, or type a custom hex value.
- **Line Width** — step the stroke width between 1 and 10 px with a live preview.

The panel also shows the number of vertices and whether the path is open or closed.

### Visual Feedback

- **Dot grid** — a faint background grid (density adapts to zoom level) provides spatial reference.
- **Rubber band** — while drawing, a dashed preview line follows the cursor from the last placed vertex.
- **Vertex highlights** — in Move and Delete modes, the nearest vertex highlights with a ring as you hover.
- **Edge highlights** — in Insert mode, the nearest edge turns purple and the insertion point is marked.
- **Selection highlight** — the selected polyline glows with a semi-transparent purple outline.
- **Status bar** — always shows the current mode, polyline count, zoom level, and cursor coordinates.
- **Toast notifications** — brief messages appear for errors and guard-rail conditions (e.g. max polylines reached, not enough points to close).

### Keyboard Shortcuts

```
B        Draw mode
C        Close active polyline (≥ 3 points)
M        Move mode
D        Delete mode
I        Insert mode
R        Clear all
E        Export menu
Escape   Return to Idle / deselect

Ctrl+S   Save JSON
Ctrl+O   Load JSON
Ctrl+Z   Undo
Ctrl+Y   Redo
Ctrl+0   Reset view
Ctrl++   Zoom in
Ctrl+-   Zoom out
```

---

## File Format

Drawings are saved as JSON (version 2):

```json
{
  "version": 2,
  "polylines": [
    {
      "id": "a1b2c3",
      "points": [
        { "x": 100, "y": 200 },
        { "x": 150, "y": 50 }
      ],
      "closed": false,
      "color": "#1E293B",
      "lineWidth": 2
    }
  ]
}
```

---

## Tech Stack

| Layer     | Technology               |
| --------- | ------------------------ |
| Framework | Next.js 14+ (App Router) |
| Language  | TypeScript (strict)      |
| Styling   | Tailwind CSS             |
| Rendering | HTML5 Canvas API         |
| State     | Zustand                  |
| Icons     | Lucide React             |
