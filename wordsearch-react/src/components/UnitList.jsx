import { syllabus, UNIT_COLORS } from "../data.js";

export default function UnitList({ currentUnit, onSelect }) {
  return (
    <div className="card unitList">
      {syllabus.units.map((u) => (
        <button
          key={u.id}
          className={"unitBtn" + (currentUnit === u.id ? " active" : "")}
          onClick={() => onSelect(u.id)}
        >
          <span className="unitColors" style={{ background: UNIT_COLORS[u.id] }} />
          Unit {u.id}
          <small>{u.title}</small>
        </button>
      ))}
    </div>
  );
}
