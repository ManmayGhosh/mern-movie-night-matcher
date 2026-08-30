import { ArrowRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Marquee } from "./Shared.jsx";

export default function Lobby({ roomCode, participants, onStart }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="screen">
      <p className="eyebrow center">Room code</p>
      <button className="code-display" onClick={copyCode}>
        <Marquee style={{ fontSize: "3.2rem" }}>{roomCode}</Marquee>
        {copied ? <Check size={20} color="#5EEAD4" /> : <Copy size={18} color="#8B90AC" />}
      </button>

      <div className="lobby-body">
        <p className="eyebrow">In the room</p>
        <div className="participant-list">
          {participants.map((p) => (
            <div key={p.participantId} className="participant-row">
              <span className="avatar" style={{ background: p.color }}>
                {p.initial}
              </span>
              <span className="participant-name">{p.name}</span>
              <span className="online-dot" />
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={onStart}>
        Start swiping <ArrowRight size={16} />
      </button>
    </div>
  );
}
