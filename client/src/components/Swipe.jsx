import { useCallback, useRef, useState } from "react";
import { Heart, Users, X } from "lucide-react";
import { FilmRail, Marquee, Poster, StreamBadge } from "./Shared.jsx";

export default function Swipe({ movies, index, onDecision, participants, votes, selfId, matchCount, onViewMatches }) {
  const movie = movies[index];
  const dragState = useRef({ down: false, startX: 0, dx: 0 });
  const [dragX, setDragX] = useState(0);
  const [exiting, setExiting] = useState(null);

  const commit = useCallback(
    (dir) => {
      if (exiting) return;
      setExiting(dir);
      setTimeout(() => {
        onDecision(dir);
        setExiting(null);
        setDragX(0);
      }, 220);
    },
    [exiting, onDecision]
  );

  const onPointerDown = (e) => {
    dragState.current = { down: true, startX: e.clientX, dx: 0 };
  };
  const onPointerMove = (e) => {
    if (!dragState.current.down) return;
    const dx = e.clientX - dragState.current.startX;
    dragState.current.dx = dx;
    setDragX(dx);
  };
  const endDrag = () => {
    if (!dragState.current.down) return;
    dragState.current.down = false;
    const dx = dragState.current.dx;
    if (dx > 90) commit("like");
    else if (dx < -90) commit("pass");
    else setDragX(0);
  };

  if (!movie) return null;

  const rot = exiting ? (exiting === "like" ? 1 : -1) * 40 : dragX / 12;
  const translate = exiting ? (exiting === "like" ? 520 : -520) : dragX;
  const likeOpacity = Math.min(Math.max(dragX / 90, 0), 1);
  const passOpacity = Math.min(Math.max(-dragX / 90, 0), 1);

  return (
    <div className="screen swipe-screen">
      <div className="swipe-header">
        <Marquee style={{ fontSize: "1.4rem" }}>Tonight's Picks</Marquee>
        <div className="avatar-row">
          {participants
            .filter((p) => p.participantId !== selfId)
            .map((p) => {
              const voted = votes[movie.tmdbId]?.[p.participantId];
              return (
                <div
                  key={p.participantId}
                  title={p.name}
                  className="vote-avatar"
                  style={{
                    background: p.color,
                    opacity: voted ? 1 : 0.3,
                    border: voted === "like" ? "2px solid #5EEAD4" : "2px solid transparent",
                  }}
                >
                  {p.initial}
                </div>
              );
            })}
        </div>
      </div>

      <div className="card-stack">
        {movies[index + 1] && (
          <div className="card card-behind">
            <Poster movie={movies[index + 1]} />
          </div>
        )}

        <div
          className="card card-front"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          style={{
            transform: `translateX(${translate}px) rotate(${rot}deg)`,
            transition: dragState.current.down ? "none" : "transform 0.25s ease",
          }}
        >
          <FilmRail side="left" />
          <FilmRail side="right" />
          <div className="card-content">
            <Poster movie={movie} />
            <div className="card-details">
              <div className="meta-row">
                <span className="muted">{movie.year}</span>
                {movie.runtime && <span className="muted">· {movie.runtime} min</span>}
              </div>
              <div className="genre-row">
                {movie.genres.map((g) => (
                  <span key={g} className="genre-pill">
                    {g}
                  </span>
                ))}
              </div>
              <p className="blurb">{movie.blurb}</p>
              <div className="streaming-row">
                {movie.streaming.map((s) => (
                  <StreamBadge key={s.name} s={s} />
                ))}
              </div>
            </div>
          </div>

          <div className="stamp stamp-pass" style={{ opacity: passOpacity }}>
            PASS
          </div>
          <div className="stamp stamp-like" style={{ opacity: likeOpacity }}>
            LIKE
          </div>
        </div>
      </div>

      <div className="swipe-actions">
        <button className="circle-btn circle-btn-pass" onClick={() => commit("pass")}>
          <X size={26} color="#FF6B6B" />
        </button>
        <button className="circle-btn circle-btn-like" onClick={() => commit("like")}>
          <Heart size={24} color="#5EEAD4" fill="#5EEAD4" />
        </button>
      </div>

      {matchCount > 0 && (
        <button className="matches-pill" onClick={onViewMatches}>
          <Users size={13} /> {matchCount} match{matchCount > 1 ? "es" : ""}
        </button>
      )}
    </div>
  );
}
