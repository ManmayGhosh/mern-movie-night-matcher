import { ArrowRight, Sparkles } from "lucide-react";
import { BulbRing, Marquee, Poster, StreamBadge } from "./Shared.jsx";

export default function MatchOverlay({ movie, onContinue }) {
  return (
    <div className="match-overlay">
      <div className="match-title-wrap">
        <BulbRing />
        <div className="match-title">
          <Sparkles size={20} color="#E8B84B" />
          <Marquee style={{ fontSize: "2.4rem" }}>It's a Match!</Marquee>
          <Sparkles size={20} color="#E8B84B" />
        </div>
      </div>
      <p className="muted" style={{ marginBottom: 22, textAlign: "center" }}>
        Everyone in the room liked this one.
      </p>

      <div className="match-poster">
        <Poster movie={movie} />
      </div>
      <div className="streaming-row" style={{ justifyContent: "center", marginTop: 16 }}>
        {movie.streaming.map((s) => (
          <StreamBadge key={s.name} s={s} />
        ))}
      </div>

      <button className="btn-primary" style={{ marginTop: 26, width: 220 }} onClick={onContinue}>
        Keep swiping <ArrowRight size={16} />
      </button>
    </div>
  );
}
