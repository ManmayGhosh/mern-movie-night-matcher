const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
  {
    tmdbId: Number,
    title: String,
    year: String,
    genres: [String],
    runtime: Number,
    rating: Number,
    blurb: String,
    posterUrl: String,
    streaming: [{ name: String, logoUrl: String }],
  },
  { _id: false }
);

const ParticipantSchema = new mongoose.Schema(
  {
    participantId: { type: String, required: true },
    name: { type: String, required: true },
    color: String,
    initial: String,
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SwipeSchema = new mongoose.Schema(
  {
    participantId: String,
    tmdbId: Number,
    direction: { type: String, enum: ["like", "pass"] },
  },
  { _id: false }
);

const RoomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  region: { type: String, default: "US" },
  movies: [MovieSchema],
  participants: [ParticipantSchema],
  swipes: [SwipeSchema],
  matches: [MovieSchema],
  // Rooms auto-delete 6 hours after creation so movie nights don't pile up in the DB.
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 6 },
});

module.exports = mongoose.model("Room", RoomSchema);
