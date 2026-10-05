import { useCallback, useEffect, useState } from "react";
import { syllabus } from "../data.js";
import { fetchScores, isShared } from "../api.js";
import { overallBoard, unitBoard } from "../board.js";
import { fmtTime } from "../utils.js";

const MEDALS = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
const UNIT_IDS = syllabus.units.map((u) => u.id);

export default function Leaderboard({ initialTab, student, onBack, onPlay }) {
  const [tab, setTab] = useState(initialTab || 1);          // 1..5 or "all"
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setRows(await fetchScores()); }
    catch (e) { setRows(null); setError("Could not load the leaderboard. Check your internet connection and try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const isAll = tab === "all";
  const list = rows ? (isAll ? overallBoard(rows, UNIT_IDS) : unitBoard(rows, tab)) : [];
  const me = student.name.trim().toLowerCase();
  const myIndex = list.findIndex((r) => r.name.trim().toLowerCase() === me);

  return (
    <div className="card">
      <h2>{"\uD83C\uDFC6"} Leaderboard</h2>
      <div className={"lbMode " + (isShared() ? "shared" : "local")}>
        {isShared() ? "\uD83C\uDF10 Class leaderboard (all players)" : "\uD83D\uDCF1 This device only \u2013 shared leaderboard is not set up"}
      </div>

      <div className="tabs">
        {UNIT_IDS.map((u) => (
          <button key={u} className={"tab" + (tab === u ? " active" : "")} onClick={() => setTab(u)}>Unit {u}</button>
        ))}
        <button className={"tab" + (isAll ? " active" : "")} onClick={() => setTab("all")}>Overall</button>
      </div>

      {loading && <p style={{ color: "var(--muted)" }}>Loading scores&hellip;</p>}
      {error && <p className="errBox">{error}</p>}

      {!loading && !error && list.length === 0 && (
        <p style={{ color: "var(--muted)" }}>No scores yet for this {isAll ? "leaderboard" : "unit"}. Be the first!</p>
      )}

      {!loading && !error && list.length > 0 && (
        <div className="tableWrap">
          <table className="lb">
            <thead>
              <tr>
                <th>Rank</th><th>Player</th><th>Score</th><th>Time</th>{isAll && <th>Units</th>}
              </tr>
            </thead>
            <tbody>
              {list.slice(0, 10).map((r, i) => (
                <tr key={r.pid} className={r.name.trim().toLowerCase() === me ? "you" : ""}>
                  <td>{MEDALS[i] || i + 1}</td>
                  <td>{r.name}</td>
                  <td>{r.score}</td>
                  <td>{fmtTime(r.time)}</td>
                  {isAll && <td>{r.units}/{UNIT_IDS.length}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && myIndex >= 0 && (
        <p style={{ marginTop: 14, fontSize: 14 }}>
          <strong>You ({student.name}):</strong> rank #{myIndex + 1} of {list.length}
          &nbsp;&middot;&nbsp; score {list[myIndex].score}
        </p>
      )}

      <div className="controlsRow" style={{ marginTop: 14 }}>
        <button className="btn" onClick={onBack}>Back to units</button>
        <button className="btn outline" onClick={load}>{"\uD83D\uDD04"} Refresh</button>
        {!isAll && <button className="btn green" onClick={() => onPlay(tab)}>Play Unit {tab}</button>}
      </div>
    </div>
  );
}
