// Talks to the shared leaderboard (a Google Sheet behind a free Apps Script web app).
// If no URL is configured, everything falls back to this device only.
import { addLocalScore, getLocalScores, getPending, setPending } from "./storage.js";

const cfg = () => (typeof window !== "undefined" && window.WORDSEARCH_CONFIG) || {};
const apiUrl = () => String(cfg().scoreApiUrl || "").trim();

export const isShared = () => apiUrl() !== "";
export const requireRollNo = () => !!cfg().requireRollNo;
// colour the first letter of every word (on by default; set showStartLetters: false to hide)
export const showStartLetters = () => cfg().showStartLetters !== false;

async function request(url, options) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Plain-text body avoids a CORS pre-flight request, which Apps Script cannot answer.
const post = (entry) =>
  request(apiUrl(), { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(entry) });

export const newSubmissionId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const localPid = (e) => (e.roll ? "R:" + e.roll.toUpperCase() : "N:" + e.name.toLowerCase());

/* Save a finished puzzle.  Resolves to:
     "shared"  - stored in the shared Google Sheet
     "local"   - no shared leaderboard configured, stored on this device
     "queued"  - network problem, will be uploaded automatically later
     "error"   - the server refused the score                                        */
export async function submitScore(entry) {
  addLocalScore(entry);                       // always keep a copy on this device
  if (!isShared()) return "local";
  try {
    const data = await post(entry);
    if (data && data.ok) { flushPending(); return "shared"; }
    return "error";
  } catch (e) {
    setPending([...getPending(), entry]);
    return "queued";
  }
}

// Try to upload scores that were saved while offline.
export async function flushPending() {
  if (!isShared()) return;
  let list = getPending();
  if (!list.length) return;
  const left = [];
  for (const entry of list) {
    try {
      const data = await post(entry);
      if (!(data && data.ok)) continue;       // refused by the server: drop it
    } catch (e) {
      left.push(entry);                        // still offline: keep it
    }
  }
  setPending(left);
}

/* All scores as [{name, pid, unit, score, time}].  Throws if the server cannot be reached. */
export async function fetchScores() {
  if (!isShared()) {
    return getLocalScores().map((e) => ({ name: e.name, pid: localPid(e), unit: e.unit, score: e.score, time: e.time }));
  }
  const url = apiUrl() + (apiUrl().includes("?") ? "&" : "?") + "action=list&t=" + Date.now();
  const data = await request(url, {});
  if (!data || !data.ok) throw new Error((data && data.error) || "bad response");
  return data.scores;
}
