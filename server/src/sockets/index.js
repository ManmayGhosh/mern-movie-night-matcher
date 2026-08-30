const Room = require("../models/Room");

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomCode, participantId }) => {
      if (!roomCode) return;
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.participantId = participantId;
    });

    socket.on("swipe", async ({ roomCode, participantId, tmdbId, direction }) => {
      try {
        const room = await Room.findOne({ code: roomCode });
        if (!room) return;

        // replace any earlier vote from this person on this movie
        room.swipes = room.swipes.filter((s) => !(s.participantId === participantId && s.tmdbId === tmdbId));
        room.swipes.push({ participantId, tmdbId, direction });

        io.to(roomCode).emit("vote-cast", { participantId, tmdbId, direction });

        if (direction === "like") {
          const likedBy = new Set(
            room.swipes.filter((s) => s.tmdbId === tmdbId && s.direction === "like").map((s) => s.participantId)
          );
          const everyoneLiked =
            room.participants.length > 0 && room.participants.every((p) => likedBy.has(p.participantId));
          const alreadyMatched = room.matches.some((m) => m.tmdbId === tmdbId);

          if (everyoneLiked && !alreadyMatched) {
            const movie = room.movies.find((m) => m.tmdbId === tmdbId);
            if (movie) {
              room.matches.push(movie);
              io.to(roomCode).emit("match", movie);
            }
          }
        }

        await room.save();
      } catch (err) {
        console.error("swipe handler error:", err);
      }
    });
  });
}

module.exports = registerSocketHandlers;
