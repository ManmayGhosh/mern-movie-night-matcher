import { useState } from "react";
import { ArrowRight, Film } from "lucide-react";
import { createRoom, joinRoom } from "../api.js";
import { Marquee } from "./Shared.jsx";

export default function Landing({ onReady }) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("IN");
  const [mode, setMode] = useState(null); // null | "join"
  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return setError("Enter your name first");
    setStatus("loading");
    setError("");
    try {
      const data = await createRoom(name.trim(), region.trim() || "US");
      onReady(data);
    } catch (e) {
      setStatus("error");
      setError(e.message);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) return setError("Enter your name first");
    if (joinCode.length !== 5) return;
    setStatus("loading");
    setError("");
    try {
      const data = await joinRoom(joinCode, name.trim());
      onReady(data);
    } catch (e) {
      setStatus("error");
      setError(e.message);
    }
  };

  return (
    <div className="screen">
      <div className="landing-hero">
        <div className="dot-row">
          {[0, 1, 2].map((i) => (
            <span key={i} className="dot" style={{ opacity: 0.35 + i * 0.3 }} />
          ))}
        </div>
        <Marquee style={{ fontSize: "2.7rem" }}>Movie Night</Marquee>
        <Marquee className="accent" style={{ fontSize: "2.7rem", marginTop: -6 }}>
          Matcher
        </Marquee>
        <p className="muted" style={{ maxWidth: 280, marginTop: 14 }}>
          Swipe with your friends. The second everyone likes the same thing, it's showtime.
        </p>
      </div>

      <div className="landing-form">
        <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />

        {mode === "join" ? (
          <>
            <input
              className="input code-input"
              placeholder="ROOM CODE"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 5))}
            />
            <button className="btn-primary" disabled={status === "loading" || joinCode.length !== 5} onClick={handleJoin}>
              {status === "loading" ? "Joining…" : (<>Join room <ArrowRight size={16} /></>)}
            </button>
            <button className="btn-ghost" onClick={() => setMode(null)}>
              Back
            </button>
          </>
        ) : (
          <>
            <input
              className="input"
              placeholder="Country code (e.g. IN)"
              value={region}
              onChange={(e) => setRegion(e.target.value.toUpperCase().slice(0, 2))}
            />
            <button className="btn-primary" disabled={status === "loading"} onClick={handleCreate}>
              {status === "loading" ? "Creating…" : (<>Create a room <Film size={16} /></>)}
            </button>
            <button className="btn-ghost" onClick={() => setMode("join")}>
              Join with a code
            </button>
          </>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
