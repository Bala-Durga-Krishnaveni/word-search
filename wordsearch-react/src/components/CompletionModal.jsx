import { fmtTime } from "../utils.js";
import { syllabus } from "../data.js";

const STATUS_TEXT = {
  saving: "Saving your score\u2026",
  shared: "\u2713 Score saved to the class leaderboard",
  local: "Score saved on this device",
  queued: "Could not reach the server. Your score is kept here and will upload automatically next time.",
  error: "The server did not accept this score.",
};

export default function CompletionModal({ unit, entry, total, saveStatus, onPlayAgain, onViewGrid, onNextUnit, onLeaderboard }) {
  return (
    <div className="overlay">
      <div className="modalCard">
        <h2>{"\uD83C\uDF89"} Puzzle solved!</h2>
        <p style={{ color: "var(--muted)" }}>Unit {unit.id}: {unit.title}</p>
        <div className="modalStats">
          <div>Player: {entry.name}</div>
          <div>Words found: {entry.wordsFound}/{total}</div>
          <div>Score: {entry.score}</div>
          <div>Time: {fmtTime(entry.time)}</div>
          <div>Hints used: {entry.hintsUsed}</div>
        </div>
        <div className={"saveStatus " + saveStatus}>{STATUS_TEXT[saveStatus]}</div>
        <div className="modalBtns">
          <button className="btn green" onClick={onPlayAgain}>Play again</button>
          <button className="btn orange" onClick={onViewGrid}>View solved grid</button>
          {unit.id < syllabus.units.length && (
            <button className="btn purple" onClick={onNextUnit}>Next unit</button>
          )}
          <button className="btn outline" onClick={onLeaderboard}>View leaderboard</button>
        </div>
      </div>
    </div>
  );
}
