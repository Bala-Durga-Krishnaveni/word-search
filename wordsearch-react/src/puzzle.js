// Puzzle generator.
//
// 'compact'  : every letter of every keyword gets its OWN cell (no two words share a cell),
//              the grid is as small as possible and words move only up / down / left / right.
// 'straight' : classic straight-line words (diagonals included), empty margins trimmed.
import { WORD_COLORS } from "./data.js";

export const LAYOUT = "compact";
/* Symbol shown in the 0-2 spare cells when the letters do not fill a rectangle exactly.
   Set to "" to leave those cells empty instead. */
export const SPARE_TILE = "\u2605";

const NB4 = [[-1, 0], [0, -1], [0, 1], [1, 0]];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------- compact layout ---------- */

// Near-square rectangle with just enough cells; the few spare cells go in the last corner.
export function compactShape(n) {
  let best = null;
  for (let R = 3; R <= 16; R++) {
    for (let C = R; C <= 24; C++) {
      const spare = R * C - n;
      if (spare < 0 || spare >= C || C / R > 1.6) continue;
      const score = spare * 10 + C / R;
      if (!best || score < best.score) best = { rows: R, cols: C, spare, score };
    }
  }
  return best;
}

function tileWords(words, R, C, spare, maxAttempts, deadlineMs) {
  const t0 = Date.now();
  const avail = Array.from({ length: R }, () => Array(C).fill(true));
  for (let m = 0; m < spare; m++) avail[R - 1][C - 1 - m] = false;
  const inb = (r, c) => r >= 0 && r < R && c >= 0 && c < C;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (Date.now() - t0 > deadlineMs) return null;
    const free = avail.map((row) => row.slice());
    const order = shuffle(words.slice()).sort((a, b) => b.length - a.length);
    const degree = (r, c) => NB4.reduce((d, [dr, dc]) => d + (inb(r + dr, c + dc) && free[r + dr][c + dc] ? 1 : 0), 0);
    const placed = [];
    let failed = false;

    for (let wi = 0; wi < order.length && !failed; wi++) {
      const word = order[wi], L = word.length;

      // start on a free cell with the fewest free neighbours (corners / dead ends first)
      let cand = [], minD = 99;
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        if (!free[r][c]) continue;
        const d = degree(r, c);
        if (d < minD) { minD = d; cand = []; }
        if (d === minD) cand.push([r, c]);
      }
      if (!cand.length) { failed = true; break; }
      const st = cand[Math.floor(Math.random() * cand.length)];
      const path = [{ r: st[0], c: st[1] }];
      free[st[0]][st[1]] = false;

      for (let i = 1; i < L; i++) {
        const last = path[path.length - 1];
        const prev = path.length > 1 ? path[path.length - 2] : null;
        const opts = [];
        for (const [dr, dc] of NB4) {
          const nr = last.r + dr, nc = last.c + dc;
          if (!inb(nr, nc) || !free[nr][nc]) continue;
          // prefer cells with few free neighbours (keeps the grid fillable) and
          // prefer carrying straight on, so words read as long horizontal / vertical runs
          const straight = prev && nr - last.r === last.r - prev.r && nc - last.c === last.c - prev.c;
          opts.push([nr, nc, degree(nr, nc) + (straight ? -1.2 : 0) + (Math.random() < 0.25 ? Math.random() * 3 : 0)]);
        }
        if (!opts.length) { failed = true; break; }
        opts.sort((a, b) => a[2] - b[2]);
        path.push({ r: opts[0][0], c: opts[0][1] });
        free[opts[0][0]][opts[0][1]] = false;
      }
      if (failed) break;
      placed.push({ word, cells: path });

      // every pocket of free cells must be fillable by the words still to come
      let sums = [true];
      order.slice(wi + 1).forEach((w) => {
        const ns = sums.slice();
        sums.forEach((ok, s) => { if (ok) ns[s + w.length] = true; });
        sums = ns;
      });
      const seen = Array.from({ length: R }, () => Array(C).fill(false));
      for (let r = 0; r < R && !failed; r++) for (let c = 0; c < C && !failed; c++) {
        if (!free[r][c] || seen[r][c]) continue;
        const stack = [[r, c]];
        let size = 0;
        seen[r][c] = true;
        while (stack.length) {
          const [cr, cc] = stack.pop();
          size++;
          for (const [dr, dc] of NB4) {
            const a = cr + dr, b = cc + dc;
            if (inb(a, b) && free[a][b] && !seen[a][b]) { seen[a][b] = true; stack.push([a, b]); }
          }
        }
        if (!sums[size]) failed = true;
      }
    }

    if (!failed && placed.length === words.length) {
      const grid = Array.from({ length: R }, () => Array(C).fill(null));
      placed.forEach((pw) => pw.cells.forEach((cell, i) => { grid[cell.r][cell.c] = pw.word[i]; }));
      return { grid, rows: R, cols: C, placed };
    }
  }
  return null;
}

function generateCompact(unit) {
  const n = unit.keywords.join("").length;
  const shape = compactShape(n);
  if (!shape) return null;
  const res = tileWords(unit.keywords, shape.rows, shape.cols, shape.spare, 100000, 1500);
  if (!res) return null;
  res.placed.forEach((pw) => { pw.color = WORD_COLORS[unit.keywords.indexOf(pw.word) % WORD_COLORS.length]; });
  return res;
}

/* ---------- straight layout ---------- */

const DIRS6 = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];

function tryStraight(word, size, occupied, dir) {
  const starts = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!occupied[r][c]) starts.push({ r, c });
  shuffle(starts);
  for (const s of starts.slice(0, 80)) {
    const path = [s];
    let ok = true;
    for (let i = 1; i < word.length; i++) {
      const prev = path[i - 1];
      const nr = prev.r + dir[0], nc = prev.c + dir[1];
      if (nr < 0 || nr >= size || nc < 0 || nc >= size || occupied[nr][nc]) { ok = false; break; }
      path.push({ r: nr, c: nc });
    }
    if (ok) return path;
  }
  return null;
}

function attemptStraight(unit, size) {
  const words = unit.keywords.slice().sort((a, b) => b.length - a.length);
  const occupied = Array.from({ length: size }, () => Array(size).fill(false));
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const placed = [];
  for (const word of words) {
    let path = null;
    for (const dir of shuffle(DIRS6.slice())) { path = tryStraight(word, size, occupied, dir); if (path) break; }
    if (!path) return null;
    path.forEach((cell, i) => { occupied[cell.r][cell.c] = true; grid[cell.r][cell.c] = word[i]; });
    placed.push({ word, cells: path, color: WORD_COLORS[unit.keywords.indexOf(word) % WORD_COLORS.length] });
  }
  return { grid, size, placed };
}

function generateStraight(unit) {
  const maxLen = Math.max(...unit.keywords.map((w) => w.length));
  let size = Math.max(maxLen, 8), result = null, tries = 0;
  while (!result && tries < 8) { result = attemptStraight(unit, size); if (!result) size++; tries++; }
  if (!result) result = attemptStraight(unit, size + 4);

  let r0 = result.size, r1 = -1, c0 = result.size, c1 = -1;
  result.grid.forEach((row, r) => row.forEach((v, c) => {
    if (v !== null) { r0 = Math.min(r0, r); r1 = Math.max(r1, r); c0 = Math.min(c0, c); c1 = Math.max(c1, c); }
  }));
  const grid = [];
  for (let r = r0; r <= r1; r++) grid.push(result.grid[r].slice(c0, c1 + 1));
  const placed = result.placed.map((pw) => ({
    word: pw.word, color: pw.color, cells: pw.cells.map((cell) => ({ r: cell.r - r0, c: cell.c - c0 })),
  }));
  return { grid, rows: r1 - r0 + 1, cols: c1 - c0 + 1, placed };
}

/* ---------- public ---------- */

export function generatePuzzle(unit, layout = LAYOUT) {
  let result = null;
  if (layout === "compact") result = generateCompact(unit);
  if (!result) result = generateStraight(unit);
  return result;
}
