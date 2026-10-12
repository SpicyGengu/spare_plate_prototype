import { io } from "socket.io-client";
import { SERVER_URL } from "../config";

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout ?? 8000);
  try {
    const response = await fetch(`${SERVER_URL}${path}`, {
      method: options.method || "GET",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      body: options.body,
      signal: controller.signal,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(data?.error || `Request failed (${response.status})`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export async function probeServer() {
  try {
    await request("/health", { timeout: 2200 });
    return true;
  } catch {
    return false;
  }
}

export const api = {
  getState: () => request("/state"),
  createListing: (body) => request("/listings", { method: "POST", body: JSON.stringify(body) }),
  reserve: (body) => request("/reservations", { method: "POST", body: JSON.stringify(body) }),
  collect: (id) => request(`/reservations/${id}/collect`, { method: "POST", body: "{}" }),
  collectByCode: (code) => request("/reservations/collect", { method: "POST", body: JSON.stringify({ code }) }),
  cancel: (id) => request(`/reservations/${id}/cancel`, { method: "POST", body: "{}" }),
};

export function connectSocket(handlers) {
  const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });
  socket.on("listing:upsert", (listing) => handlers.onListing?.(listing));
  socket.on("reservation:upsert", (reservation) => handlers.onReservation?.(reservation));
  return () => socket.disconnect();
}
