import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  createSeed,
  publishListing,
  reserveListing,
  collectReservation,
  cancelReservation,
} from "./domain.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

let state = createSeed();

function emitListing(listing) {
  if (listing) io.emit("listing:upsert", listing);
}

function emitReservation(reservation) {
  if (reservation) io.emit("reservation:upsert", reservation);
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "spare-plate" });
});

app.get("/state", (_req, res) => {
  res.json(state);
});

app.get("/merchants", (_req, res) => {
  res.json(state.merchants);
});

app.get("/listings", (_req, res) => {
  res.json(state.listings);
});

app.get("/listings/:id", (req, res) => {
  const listing = state.listings.find((item) => item.id === req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found." });
  res.json(listing);
});

app.get("/reservations", (_req, res) => {
  res.json(state.reservations);
});

app.post("/listings", (req, res) => {
  try {
    const result = publishListing(state, req.body);
    state = { ...state, listings: result.listings };
    emitListing(result.listing);
    res.status(201).json(result.listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/reservations", (req, res) => {
  try {
    const result = reserveListing(state, req.body);
    state = { ...state, listings: result.listings, reservations: result.reservations };
    emitListing(result.listing);
    emitReservation(result.reservation);
    res.status(201).json({ listing: result.listing, reservation: result.reservation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/reservations/collect", (req, res) => {
  try {
    const result = collectReservation(state, { code: req.body?.code });
    state = { ...state, reservations: result.reservations };
    emitReservation(result.reservation);
    res.json({ reservation: result.reservation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/reservations/:id/collect", (req, res) => {
  try {
    const result = collectReservation(state, { id: req.params.id });
    state = { ...state, reservations: result.reservations };
    emitReservation(result.reservation);
    res.json({ reservation: result.reservation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/reservations/:id/cancel", (req, res) => {
  try {
    const result = cancelReservation(state, req.params.id);
    state = { ...state, listings: result.listings, reservations: result.reservations };
    emitListing(result.listing);
    emitReservation(result.reservation);
    res.json({ listing: result.listing, reservation: result.reservation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Spare Plate API listening on http://0.0.0.0:${PORT}`);
  console.log(`${state.merchants.length} venues, ${state.listings.length} listings ready in Parramatta.`);
});
