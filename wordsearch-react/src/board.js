// Turns the list of all scores into leaderboards (best attempt per player).
const better = (a, b) => a.score > b.score || (a.score === b.score && a.time < b.time);

/* One unit: each player appears once with their best score. */
export function unitBoard(rows, unitId) {
  const best = new Map();
  rows.filter((r) => r.unit === unitId).forEach((r) => {
    const cur = best.get(r.pid);
    if (!cur || better(r, cur)) best.set(r.pid, r);
  });
  return [...best.values()].sort((a, b) => b.score - a.score || a.time - b.time);
}

/* Overall: sum of each player's best score in every unit they played. */
export function overallBoard(rows, unitIds) {
  const players = new Map();
  unitIds.forEach((u) => {
    unitBoard(rows, u).forEach((r) => {
      const p = players.get(r.pid) || { pid: r.pid, name: r.name, score: 0, time: 0, units: 0 };
      p.score += r.score; p.time += r.time; p.units += 1; p.name = r.name;
      players.set(r.pid, p);
    });
  });
  return [...players.values()].sort((a, b) => b.score - a.score || a.time - b.time);
}
