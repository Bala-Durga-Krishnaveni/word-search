import { useEffect, useState } from "react";
import { flushPending } from "./api.js";
import { syllabus } from "./data.js";
import NameScreen from "./components/NameScreen.jsx";
import UnitList from "./components/UnitList.jsx";
import PuzzleBoard from "./components/PuzzleBoard.jsx";
import Leaderboard from "./components/Leaderboard.jsx";

export default function App() {
  const [student, setStudent] = useState(null);        // { name, roll }
  const [unitId, setUnitId] = useState(null);
  const [seed, setSeed] = useState(0);              // changes whenever a new puzzle is wanted
  const [view, setView] = useState("dashboard");    // "dashboard" | "leaderboard"
  const [lbUnit, setLbUnit] = useState(1);

  // upload any scores that were saved while offline
  useEffect(() => { if (student) flushPending(); }, [student]);

  if (!student) {
    return <div id="app"><NameScreen onStart={setStudent} /></div>;
  }

  const unit = syllabus.units.find((u) => u.id === unitId);

  function loadUnit(id) {
    setUnitId(id);
    setSeed((s) => s + 1);
    setView("dashboard");
  }
  function showLeaderboard(id) {
    setLbUnit(id);
    setView("leaderboard");
  }

  return (
    <div id="app">
      <div className="topbar">
        <h1>Data Science with Python</h1>
        <div className="student">
          {student.name}
          <button className="switch" onClick={() => { setStudent(null); setUnitId(null); setView("dashboard"); }}>Switch</button>
        </div>
      </div>

      {/* The puzzle stays mounted while the leaderboard is open, so the game keeps its state. */}
      <div className={view === "dashboard" ? "" : "hidden"}>
        <div className="dash">
          <UnitList currentUnit={unitId} onSelect={loadUnit} />
          {unit ? (
            <PuzzleBoard
              key={unit.id + "-" + seed}
              unit={unit}
              student={student}
              onNewPuzzle={() => loadUnit(unit.id)}
              onNextUnit={loadUnit}
              onLeaderboard={showLeaderboard}
            />
          ) : (
            <div className="card"><p style={{ color: "var(--muted)" }}>Select a unit to begin.</p></div>
          )}
        </div>
      </div>

      {view === "leaderboard" && (
        <Leaderboard
          initialTab={lbUnit}
          student={student}
          onBack={() => setView("dashboard")}
          onPlay={loadUnit}
        />
      )}
    </div>
  );
}
