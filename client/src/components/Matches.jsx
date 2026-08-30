import { Marquee, Poster, StreamBadge } from "./Shared.jsx";

export default function Matches({ matches, onBack }) {
  return (
    <div className="screen">
      <Marquee style={{ fontSize: "2rem" }}>Your Matches</Marquee>
      <p className="muted" style={{ marginTop: 4, marginBottom: 18 }}>
        {matches.length === 0 ? "No matches yet — go swipe." : `${matches.length} everyone agreed on`}
      </p>
      <div className="matches-list">
        {matches.map((m) => (
          <div key={m.tmdbId} className="match-row">
            <div className="match-row-poster">
              <Poster movie={m} compact />
            </div>
            <div className="match-row-info">
              <span className="match-row-title">{m.title}</span>
              <span className="muted small">
                {m.year} · {m.genres.join(", ")}
              </span>
              <div className="streaming-row">
                {m.streaming.map((s) => (
                  <StreamBadge key={s.name} s={s} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="btn-ghost" style={{ marginTop: 14 }} onClick={onBack}>
        Back to swiping
      </button>
    </div>
  );
}
