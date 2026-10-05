import { useLayoutEffect, useRef, useState } from "react";
import { SPARE_TILE } from "../puzzle.js";

const sameCell = (a, b) => a.r === b.r && a.c === b.c;

/* The letter grid. Handles dragging (mouse and touch) and draws the coloured ribbons. */
export default function Grid({ puzzle, found, hintCell, locked, onSelect }) {
  const { grid, rows, cols, placed } = puzzle;
  const boxRef = useRef(null);
  const [cell, setCell] = useState(36);
  const [sel, setSel] = useState([]);
  const selRef = useRef([]);
  const dragging = useRef(false);

  const gap = cell < 28 ? 2 : 3;
  const step = cell + gap;
  const ribbonW = Math.round(cell * 0.8);

  // shrink the cells so the whole grid fits the available width
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const fit = () => {
      const avail = el.clientWidth;
      if (avail <= 0) return;
      const f = Math.floor((avail - 6 - 3 * (cols - 1)) / cols);
      setCell(Math.max(20, Math.min(36, f)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cols]);

  const center = (c) => ({ x: c.c * step + cell / 2, y: c.r * step + cell / 2 });
  const pointsFor = (cells) => cells.map((c) => { const p = center(c); return p.x + "," + p.y; }).join(" ");

  const startColor = {};
  placed.forEach((pw) => { startColor[pw.cells[0].r + "," + pw.cells[0].c] = pw.color; });
  const foundCells = new Set();
  placed.forEach((pw) => { if (found.includes(pw.word)) pw.cells.forEach((c) => foundCells.add(c.r + "," + c.c)); });

  function updateSel(next) { selRef.current = next; setSel(next); }

  function cellAt(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const t = el && el.closest ? el.closest("[data-r]") : null;
    if (!t || t.dataset.spare === "1") return null;
    return { r: +t.dataset.r, c: +t.dataset.c };
  }

  function onPointerDown(e) {
    if (locked || (e.pointerType === "mouse" && e.button !== 0)) return;
    const c = cellAt(e);
    if (!c) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    updateSel([c]);
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    const c = cellAt(e);
    if (!c) return;
    const s = selRef.current;
    const last = s[s.length - 1];
    if (sameCell(last, c)) return;
    if (s.length > 1 && sameCell(s[s.length - 2], c)) { updateSel(s.slice(0, -1)); return; }   // stepped back
    if (Math.abs(c.r - last.r) + Math.abs(c.c - last.c) !== 1) return;   // one step up, down, left or right
    if (s.some((p) => sameCell(p, c))) return;
    updateSel([...s, c]);
  }

  function endDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    const cells = selRef.current;
    updateSel([]);
    onSelect(cells);
  }

  const selKeys = new Set(sel.map((c) => c.r + "," + c.c));
  const cellsOut = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = r + "," + c;
      const letter = grid[r][c];
      if (letter === null) {
        cellsOut.push(
          <div key={key} data-r={r} data-c={c} data-spare="1" className={"cell " + (SPARE_TILE ? "spare" : "empty")}>
            {SPARE_TILE}
          </div>
        );
        continue;
      }
      const isFound = foundCells.has(key);
      let cls = "cell";
      if (isFound) cls += " wordFound";
      else if (selKeys.has(key)) cls += " sel";
      if (!isFound && startColor[key]) cls += " startHint";
      if (hintCell && hintCell.r === r && hintCell.c === c) cls += " hint";
      cellsOut.push(
        <div
          key={key} data-r={r} data-c={c} className={cls}
          style={!isFound && !selKeys.has(key) && startColor[key] ? { background: startColor[key] } : undefined}
        >
          {letter}
        </div>
      );
    }
  }

  return (
    <div className="gridBox" ref={boxRef}>
      <div className="gridWrap">
        <svg id="pathSvg" width={cols * step} height={rows * step} viewBox={`0 0 ${cols * step} ${rows * step}`}>
          {placed.filter((pw) => found.includes(pw.word)).map((pw) => {
            const pts = pointsFor(pw.cells);
            const len = (pw.cells.length - 1) * step;
            return (
              <g key={pw.word}>
                <polyline className="ribbon" points={pts} fill="none" stroke={pw.color} strokeWidth={ribbonW}
                  strokeLinecap="round" strokeLinejoin="round" opacity="0.95" style={{ "--len": len }} />
                <polyline className="ribbonDash" points={pts} fill="none" stroke="#fff" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 7" opacity="0.6" />
              </g>
            );
          })}
          {sel.length > 1 && (
            <polyline points={pointsFor(sel)} fill="none" stroke="#F59E0B" strokeWidth={Math.round(cell * 0.62)}
              strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          )}
        </svg>
        <div
          id="grid"
          style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap, "--cell": cell + "px" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {cellsOut}
        </div>
      </div>
    </div>
  );
}
