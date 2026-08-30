# Movie Night Matcher — MERN stack

Real rooms, real-time swiping, and live match detection over Socket.io, backed by
MongoDB and TMDB.

```
movie-night-matcher-mern/
├── server/   Express + MongoDB + Socket.io API
└── client/   React (Vite) frontend
```

## How it works

- **Create/join a room** — `POST /api/rooms` fetches the current TMDB popular
  movies (with runtime, genres, and real streaming providers for your chosen
  country) and stores them on a `Room` document so everyone in the room swipes
  on the same deck. `POST /api/rooms/:code/join` adds a participant to an
  existing room.
- **Swiping** — the client emits a `swipe` socket event per card; the server
  records it, broadcasts `vote-cast` so everyone sees live vote avatars, and
  checks whether *every* participant has now liked that movie.
- **Matching** — the moment everyone's liked the same movie, the server pushes
  a `match` event with the full movie (including streaming info) to everyone
  in the room, triggering the celebration screen.
- **TMDB key stays server-side** — the client never touches TMDB directly, so
  your API key isn't exposed in the browser.

## Setup

### 1. MongoDB

Run MongoDB locally, or grab a free connection string from
[MongoDB Atlas](https://www.mongodb.com/atlas).

### 2. TMDB API key

Free, instant signup: https://www.themoviedb.org/settings/api

### 3. Backend

```bash
cd server
cp .env.example .env   # fill in MONGO_URI and TMDB_API_KEY
npm install
npm run dev             # http://localhost:4000
```

### 4. Frontend

```bash
cd client
cp .env.example .env    # defaults to http://localhost:4000, adjust if needed
npm install
npm run dev              # http://localhost:5173
```

Open two browser windows (or share the room code with a friend on the same
network — set `VITE_API_URL` to your machine's LAN IP for that) to see live
swiping and matching in action.

## Notes / next steps

- Rooms auto-expire 6 hours after creation (Mongo TTL index on `Room.createdAt`).
- There's no auth — anyone with the room code can join under any name. Add a
  login layer if you need to lock rooms down.
- The movie deck is fixed at 12 titles per room (TMDB's first page of
  "popular"). Swap in `/discover/movie` with your own filters, or paginate,
  for more variety.
- Streaming availability is looked up for the region set at room creation.
  TMDB's coverage varies by country.
