export default function KeywordPanel({ placed, found }) {
  return (
    <div className="kwPanel">
      <h3>Keywords</h3>
      <div className="kwList">
        {placed.map((pw) => {
          const isFound = found.includes(pw.word);
          return (
            <div
              key={pw.word}
              className={"kwItem" + (isFound ? " found" : "")}
              style={isFound ? { background: pw.color } : undefined}
            >
              <span className="dot" style={{ background: pw.color }} />
              {isFound
                ? "\u2713 " + pw.word
                : <span className="blank">{pw.word.split("").map(() => "_").join(" ")}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
