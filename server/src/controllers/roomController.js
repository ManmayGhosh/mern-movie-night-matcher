const { nanoid } = require("nanoid");
const Room = require("../models/Room");
const { fetchTmdbMovies } = require("../utils/tmdb");

const PALETTE = ["#E8B84B", "#FF6B6B", "#5EEAD4", "#8B7CF6", "#4ECDC4", "#F97316"];
const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode() {
  let s = "";
  for (let i = 0; i < 5; i++) s += codeAlphabet[Math.floor(Math.random() * codeAlphabet.length)];
  return s;
}

function colorFor(i) {
  return PALETTE[i % PALETTE.length];
}

// POST /api/rooms  { name, region }
exports.createRoom = async (req, res) => {
  try {
    const { name, region = "US" } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });

    const movies = await fetchTmdbMovies(region);

    let code = generateCode();
    while (await Room.findOne({ code })) code = generateCode(); // guard against the rare collision

    const participantId = nanoid(10);
    const room = await Room.create({
      code,
      region: region.toUpperCase(),
      movies,
      participants: [{ participantId, name: name.trim(), color: colorFor(0), initial: name.trim()[0].toUpperCase() }],
    });

    res.status(201).json({
      roomCode: room.code,
      participantId,
      movies: room.movies,
      participants: room.participants,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to create room" });
  }
};

// POST /api/rooms/:code/join  { name }
exports.joinRoom = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });

    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ error: "Room not found" });

    const participantId = nanoid(10);
    room.participants.push({
      participantId,
      name: name.trim(),
      color: colorFor(room.participants.length),
      initial: name.trim()[0].toUpperCase(),
    });
    await room.save();

    req.app.get("io").to(room.code).emit("participants-updated", room.participants);

    res.json({
      roomCode: room.code,
      participantId,
      movies: room.movies,
      participants: room.participants,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to join room" });
  }
};

// GET /api/rooms/:code
exports.getRoom = async (req, res) => {
  const room = await Room.findOne({ code: req.params.code.toUpperCase() });
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({
    roomCode: room.code,
    movies: room.movies,
    participants: room.participants,
    matches: room.matches,
  });
};
