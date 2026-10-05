import { useState } from "react";
import { requireRollNo, isShared } from "../api.js";
import { getPlayer, savePlayer } from "../storage.js";

export default function NameScreen({ onStart }) {
  const saved = getPlayer();
  const [name, setName] = useState(saved.name || "");
  const [roll, setRoll] = useState(saved.roll || "");
  const [error, setError] = useState("");
  const needRoll = requireRollNo();

  function submit() {
    const n = name.trim().replace(/\s+/g, " "), r = roll.trim();
    if (n.length < 2) { setError("Enter your name first"); return; }
    if (needRoll && !r) { setError("Enter your roll number"); return; }
    const player = { name: n, roll: r };
    savePlayer(player);
    onStart(player);
  }
  const onKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div id="nameScreen">
      <div className="card">
        <h2>Data Science with Python</h2>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          JNTUGV-CEV, Dept. of Information Technology<br />
          Enter your details to start the word search challenge
        </p>
        <input type="text" placeholder="Your name" maxLength={40} value={name}
          onChange={(e) => setName(e.target.value)} onKeyDown={onKey} autoComplete="name" />
        <input type="text" placeholder={needRoll ? "Roll number" : "Roll number (optional)"} maxLength={20} value={roll}
          onChange={(e) => setRoll(e.target.value)} onKeyDown={onKey} autoComplete="off" />
        <div className="err">{error}</div>
        <button className="btn green" style={{ width: "100%" }} onClick={submit}>START PUZZLE</button>
        <p className="fine">
          {isShared()
            ? "Your name and score appear on the class leaderboard."
            : "Scores are saved on this device only."}
        </p>
      </div>
    </div>
  );
}
