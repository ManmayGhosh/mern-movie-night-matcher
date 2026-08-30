import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// autoConnect is off so we only open the socket once someone actually enters a room
export const socket = io(SOCKET_URL, { autoConnect: false });
