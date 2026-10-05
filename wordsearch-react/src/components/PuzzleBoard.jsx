import { useEffect, useMemo, useRef, useState } from "react";
import { SCORES } from "../data.js";
import { generatePuzzle, matchSelection } from "../puzzle.js";
import { newSubmissionId, submitScore } from "../api.js";
import { fmtTime } from "../utils.js";
import Grid from "./Grid.jsx";
import KeywordPanel from "./KeywordPanel.jsx";
import CompletionModal from "./CompletionModal.jsx";

/* One puzzle. Mount it with a new `key` to start a fresh puzzle. */
export default function PuzzleBoard({ unit, student, onNewPuzzle, onNextUnit, onLeaderboard }) {
  const puzzle = useMemo(() => generatePuzzle(unit), [unit]);
  const total = puzzle.placed.length;

  const [found, setFound] = useState([]);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [hintCell, setHintCell] = useState(null);
  const [done, setDone] = useState(false);
  const [entry, setEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saving");
  const startedAt = useRef(Date.now());

  // timer
  useEffect(() => {
    if (done) return undefined;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [done]);

  // hint highlight fades after 1.5 s
  useEffect(() => {
    if (!hintCell) return undefined;
    const id = setTimeout(() => setHintCell(null), 1500);
    return () => clearTimeout(id);
  }, [hintCell]);

  // all words found -> save score and show the result
  useEffect(() => {
    if (done || total === 0 || found.length !== total) return;
    const time = Math.floor((Date.now() - startedAt.current) / 1000);
    const e = {
      sid: newSubmissionId(), unit: unit.id,
      name: student.name, roll: student.roll, score, time,
      wordsFound: found.length, hintsUsed: hints, date: new Date().toISOString().slice(0, 10),
    };
    setElapsed(time);
    setDone(true);
    setEntry(e);
    submitScore(e).then(setSaveStatus);
    setShowModal(true);
  }, [found, done, total, unit.id, student, score, hints]);

    // returns true (right word), false (wrong), or undefined (nothing to judge)
  function handleSelect(cells) {
    if (done || cells.length < 2) return undefined;
    const match = matchSelection(puzzle, cells, found);
    if (match) {
      setFound((f) => [...f, match.word]);
      setScore((s) => s + SCORES.correct);
      return true;
    }
    setScore((s) => Math.max(0, s + SCORES.wrong));
    return false;
  }

  function giveHint() {
    if (done) return;
    const remaining = puzzle.placed.filter((pw) => !found.includes(pw.word));
    if (!remaining.length) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    setHintCell({ ...pick.cells[0] });
    setHints((h) => h + 1);
    setScore((s) => Math.max(0, s + SCORES.hint));
  }

  return (
    <div className="card" id="puzzleArea">
      <div className="puzzleHead">
        <div><strong>Unit {unit.id}</strong> &mdash; {unit.title}</div>
        <div className="statsRow">
          <div className="statPill">{"\u23F1"} {fmtTime(elapsed)}</div>
          <div className="statPill">SCORE: {score}</div>
          <div className="statPill">WORDS: {found.length}/{total}</div>
          <div className="statPill">HINTS: {hints}</div>
        </div>
      </div>
      <div className="puzzleWrap">
        <div>
          <Grid puzzle={puzzle} found={found} hintCell={hintCell} locked={done} onSelect={handleSelect} />
          <div className="controlsRow">
            <button className="btn orange" onClick={giveHint}>{"\uD83D\uDCA1"} HINT</button>
            <button className="btn outline" onClick={onNewPuzzle}>{"\uD83D\uDD04"} New Puzzle</button>
            <button className="btn purple" onClick={() => onLeaderboard(unit.id)}>{"\uD83C\uDFC6"} Leaderboard</button>
          </div>
        </div>
        <KeywordPanel placed={puzzle.placed} found={found} />
      </div>

      {showModal && entry && (
        <CompletionModal
          unit={unit} entry={entry} total={total} saveStatus={saveStatus}
          onPlayAgain={onNewPuzzle}
          onViewGrid={() => setShowModal(false)}
          onNextUnit={() => onNextUnit(unit.id + 1)}
          onLeaderboard={() => { setShowModal(false); onLeaderboard(unit.id); }}
        />
      )}
    </div>
  );
}
