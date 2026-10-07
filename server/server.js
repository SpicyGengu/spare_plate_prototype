import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { randomUUID } from "crypto";

const app = express();

// Prototype listings live in memory only — restarting the server clears them.
const listings = [];

app.use(cors());
// Images come in as base64 inside the JSON body, so allow a generous size.
app.use(express.json({ limit: "15mb" }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Phone 2 calls this once on load to get whatever already exists.
app.get("/listings", (req, res) => {
  res.json(listings);
});

// Phone 1 calls this when it submits a new listing.
app.post("/listings", (req, res) => {
  const { photoBase64, dietaryTags, description } = req.body;

  if (!photoBase64 || !description) {
    return res.status(400).json({ error: "photoBase64 and description are required" });
  }

  const listing = {
    id: randomUUID(),
    photoBase64,
    dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : [],
    description,
    status: "pending", // "pending" | "accepted" | "denied"
    createdAt: Date.now(),
  };

  listings.unshift(listing);
  io.emit("listing:new", listing);

  res.status(201).json(listing);
});

// Phone 2 calls this when someone taps accept/deny.
app.post("/listings/:id/respond", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["accepted", "denied"].includes(status)) {
    return res.status(400).json({ error: "status must be 'accepted' or 'denied'" });
  }

  const listing = listings.find((l) => l.id === id);
  if (!listing) {
    return res.status(404).json({ error: "listing not found" });
  }

  listing.status = status;
  io.emit("listing:update", listing);

  res.json(listing);
});

io.on("connection", (socket) => {
  console.log("phone connected:", socket.id);
  socket.on("disconnect", () => console.log("phone disconnected:", socket.id));
});

const PORT = 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  console.log("Find your LAN IP with: ifconfig | grep inet");
});
