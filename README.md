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

### Option A — Docker (recommended if you're already using Docker)

You only need Docker and Docker Compose installed — no local Node or MongoDB
required. Mongo, the server, and the client each run in their own container.

1. Get a free TMDB API key: https://www.themoviedb.org/settings/api
2. Create the server's env file:
   ```bash
   cp server/.env.example server/.env
   ```
   Open `server/.env` and set `TMDB_API_KEY`. You can leave `MONGO_URI` and
   `CLIENT_URL` as-is — `docker-compose.yml` overrides both automatically so
   the server always points at the `mongo` container.
3. From the project root, build and start everything:
   ```bash
   docker compose up --build
   ```
   (older installs use `docker-compose up --build` with a hyphen)
4. Open **http://localhost:5173** in a browser. The API is on
   **http://localhost:4000**, Mongo on **localhost:27017**.

Source files are bind-mounted into the containers, so editing anything in
`server/` or `client/` hot-reloads inside the running containers — no rebuild
needed. Rebuild only if you change a `package.json` or a `Dockerfile`:
```bash
docker compose up --build
```

Useful commands:
```bash
docker compose logs -f server   # tail one service's logs
docker compose down             # stop everything
docker compose down -v          # stop and also wipe the Mongo volume (fresh DB)
```

To test matching between two "people," just open two browser tabs (or two
different browsers) to `http://localhost:5173` — each gets its own
`participantId` and they'll see each other's votes live.

### Option C — Deploy to Render

The included `render.yaml` blueprint deploys the backend as a Node web
service and the frontend as a static site — kept as two separate services,
same as in Docker.

1. Push this repo to GitHub.
2. Get a free MongoDB Atlas connection string (Render doesn't offer managed
   MongoDB): https://www.mongodb.com/atlas
3. In the Render dashboard: **New → Blueprint**, point it at your repo. It
   reads `render.yaml` and creates both services.
4. Render will prompt for the `sync: false` env vars — fill in:
   - `movie-matcher-server`: `MONGO_URI` (your Atlas string), `TMDB_API_KEY`
   - `movie-matcher-client`: `VITE_API_URL` — leave blank for now
5. Once both services have deployed once, copy each one's `.onrender.com`
   URL from the dashboard and set:
   - On `movie-matcher-server`: `CLIENT_URL` = the client's URL
   - On `movie-matcher-client`: `VITE_API_URL` = the server's URL
   Then manually redeploy the client (env var changes require a rebuild for
   static sites, since Vite bakes `VITE_API_URL` in at build time).

If room creation works fine on Render but fails locally in Docker with a
TLS/connection error reaching `api.themoviedb.org`, that points to something
on your local network (firewall, VPN, antivirus, or ISP-level blocking)
rather than the app — Render's servers have unrestricted outbound internet
access, so it's a good way to isolate the two.

### Option D — Run locally with Node + MongoDB

#### 1. MongoDB

Run MongoDB locally, or grab a free connection string from
[MongoDB Atlas](https://www.mongodb.com/atlas).

#### 2. TMDB API key

Free, instant signup: https://www.themoviedb.org/settings/api

#### 3. Backend

```bash
cd server
cp .env.example .env   # fill in MONGO_URI and TMDB_API_KEY
npm install
npm run dev             # http://localhost:4000
```

#### 4. Frontend

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
