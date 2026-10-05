// Everything the browser remembers on this device (localStorage).
// All calls are wrapped in try/catch so the game still works if storage is blocked.
const SCORES_KEY = "wordsearch_scores_v2";
const PENDING_KEY = "wordsearch_pending_v2";
const PLAYER_KEY = "wordsearch_player";

function read(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
  catch (e) { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
}

export const getPlayer = () => read(PLAYER_KEY, { name: "", roll: "" });
export const savePlayer = (p) => write(PLAYER_KEY, p);

// scores played on this device (used when no shared leaderboard is configured)
export const getLocalScores = () => read(SCORES_KEY, []);
export function addLocalScore(entry) {
  const list = getLocalScores();
  list.push(entry);
  write(SCORES_KEY, list.slice(-300));
}

// scores that could not be uploaded yet
export const getPending = () => read(PENDING_KEY, []);
export const setPending = (list) => write(PENDING_KEY, list);
