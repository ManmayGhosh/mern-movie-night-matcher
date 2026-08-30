const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function handle(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function createRoom(name, region) {
  return fetch(`${API_URL}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, region }),
  }).then(handle);
}

export function joinRoom(code, name) {
  return fetch(`${API_URL}/api/rooms/${code}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }).then(handle);
}

export function getRoom(code) {
  return fetch(`${API_URL}/api/rooms/${code}`).then(handle);
}
