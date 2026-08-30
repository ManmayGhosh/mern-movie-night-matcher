import { useCallback, useEffect, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import Landing from "./components/Landing.jsx";
import Lobby from "./components/Lobby.jsx";
import Swipe from "./components/Swipe.jsx";
import MatchOverlay from "./components/MatchOverlay.jsx";
import Matches from "./components/Matches.jsx";
import { Marquee } from "./components/Shared.jsx";
import { socket } from "./socket.js";

export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | lobby | swipe | matches
  const [roomCode, setRoomCode] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [participants, setParticipants] = useState([]);
  const [movies, setMovies] = useState([]);
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState({}); // tmdbId -> { participantId: 'like'|'pass' }
  const [matches, setMatches] = useState([]);
  const [pendingMatch, setPendingMatch] = useState(null);

  useEffect(() => {
    function onParticipants(list) {
      setParticipants(list);
    }
    function onVote({ participantId: pid, tmdbId, direction }) {
      setVotes((prev) => ({ ...prev, [tmdbId]: { ...(prev[tmdbId] || {}), [pid]: direction } }));
    }
    function onMatch(movie) {
      setMatches((prev) => (prev.find((m) => m.tmdbId === movie.tmdbId) ? prev : [...prev, movie]));
      setPendingMatch(movie);
    }

    socket.on("participants-updated", onParticipants);
    socket.on("vote-cast", onVote);
    socket.on("match", onMatch);

    return () => {
      socket.off("participants-updated", onParticipants);
      socket.off("vote-cast", onVote);
      socket.off("match", onMatch);
    };
  }, []);

  const enterRoom = (data) => {
    setRoomCode(data.roomCode);
    setParticipantId(data.participantId);
    setMovies(data.movies);
    setParticipants(data.participants);
    setIndex(0);
    setVotes({});
    setMatches([]);
    if (!socket.connected) socket.connect();
    socket.emit("join-room", { roomCode: data.roomCode, participantId: data.participantId });
    setScreen("lobby");
  };

  const handleDecision = useCallback(
    (direction) => {
      const movie = movies[index];
      socket.emit("swipe", { roomCode, participantId, tmdbId: movie.tmdbId, direction });
      setIndex((i) => i + 1);
    },
    [movies, index, roomCode, participantId]
  );

  const remaining = movies.length - index;

  return (
    <div className="phone-frame">
      {screen === "landing" && <Landing onReady={enterRoom} />}

      {screen === "lobby" && (
        <Lobby roomCode={roomCode} participants={participants} onStart={() => setScreen("swipe")} />
      )}

      {screen === "swipe" && (
        <>
          {remaining > 0 ? (
            <Swipe
              movies={movies}
              index={index}
              onDecision={handleDecision}
              participants={participants}
              votes={votes}
              selfId={participantId}
              matchCount={matches.length}
              onViewMatches={() => setScreen("matches")}
            />
          ) : (
            <div className="screen empty-state">
              <RotateCcw size={30} color="#8B90AC" />
              <Marquee style={{ fontSize: "2rem" }}>That's everything</Marquee>
              <p className="muted" style={{ margin: "10px 0 22px" }}>
                {matches.length > 0
                  ? `You matched on ${matches.length} movie${matches.length > 1 ? "s" : ""}.`
                  : "No matches this round — tough crowd."}
              </p>
              <button className="btn-primary" onClick={() => setScreen("matches")}>
                See matches <ArrowRight size={16} />
              </button>
            </div>
          )}
          {pendingMatch && <MatchOverlay movie={pendingMatch} onContinue={() => setPendingMatch(null)} />}
        </>
      )}

      {screen === "matches" && <Matches matches={matches} onBack={() => setScreen("swipe")} />}
    </div>
  );
}
