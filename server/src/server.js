require("dotenv").config();

// Docker containers frequently have broken/unrouted IPv6 even when DNS still
// returns an IPv6 address for a host. Node's built-in fetch (undici) tries
// IPv6 first by default, which then hangs/dies mid-TLS-handshake against
// sites like TMDB that publish AAAA records. Preferring IPv4 avoids that.
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const roomRoutes = require("./routes/roomRoutes");
const registerSocketHandlers = require("./sockets");

const app = express();
const server = http.createServer(app);
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, { cors: { origin: clientUrl } });
app.set("io", io); // controllers can reach the socket server via req.app.get('io')

app.use(cors({ origin: clientUrl }));
app.use(express.json());

app.use("/api/rooms", roomRoutes);
app.get("/api/health", (req, res) => res.json({ ok: true }));

registerSocketHandlers(io);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
