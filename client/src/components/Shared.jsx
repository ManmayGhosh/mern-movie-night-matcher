import { Star } from "lucide-react";

export function Marquee({ children, className = "", style = {} }) {
  return (
    <span className={`marquee ${className}`} style={style}>
      {children}
    </span>
  );
}

export function FilmRail({ side }) {
  const holes = Array.from({ length: 9 });
  return (
    <div className={`film-rail film-rail-${side}`}>
      {holes.map((_, i) => (
        <div key={i} className="film-hole" />
      ))}
    </div>
  );
}

export function Poster({ movie, compact }) {
  const hasImage = Boolean(movie.posterUrl);
  return (
    <div
      className={`poster ${compact ? "poster-compact" : ""}`}
      style={!hasImage ? { background: "linear-gradient(155deg, #2B2E63, #0B0D17)" } : undefined}
    >
      {hasImage ? (
        <>
          <img src={movie.posterUrl} alt="" draggable={false} className="poster-img" />
          <div className="poster-scrim" />
        </>
      ) : (
        <div className="poster-texture" />
      )}
      {movie.rating != null && (
        <div className="rating-badge">
          <Star size={11} color="#E8B84B" fill="#E8B84B" />
          <span>{movie.rating}</span>
        </div>
      )}
      <div className="poster-title">
        <Marquee style={{ fontSize: compact ? "1.15rem" : "1.7rem" }}>{movie.title}</Marquee>
      </div>
    </div>
  );
}

export function StreamBadge({ s }) {
  if (s.logoUrl) {
    return (
      <span className="stream-badge stream-badge-logo" title={s.name}>
        <img src={s.logoUrl} alt="" />
        <span>{s.name}</span>
      </span>
    );
  }
  return <span className="stream-badge stream-badge-plain">{s.name}</span>;
}

export function BulbRing() {
  const bulbs = Array.from({ length: 16 });
  return (
    <div className="bulb-ring">
      {bulbs.map((_, i) => {
        const angle = (i / bulbs.length) * 2 * Math.PI;
        const x = 50 + (Math.cos(angle) * 145) / 3;
        const y = 50 + (Math.sin(angle) * 34) / 3;
        return (
          <div
            key={i}
            className="bulb"
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.07}s` }}
          />
        );
      })}
    </div>
  );
}
