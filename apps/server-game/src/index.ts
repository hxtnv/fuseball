import {
  DT,
  EMPTY_INPUT,
  GAME_VERSION,
  MSG,
  ROOM,
  addPlayer,
  createGameState,
  decodeInput,
  decodePingId,
  encodePong,
  encodeRoster,
  encodeSnapshot,
  encodeWelcome,
  messageType,
  removePlayer,
  startMatch,
  step,
  type GameState,
  type InputMap,
  type PlayerInput,
  type RosterEntry,
} from "@fuseball/shared";
import { verifyToken } from "@fuseball/auth";
import type { ServerWebSocket } from "bun";

const port = Number(process.env.PORT ?? 3002);
const TICK_MS = DT * 1000;
const MAX_INPUT_QUEUE = 10; // safety cap on a client's jitter buffer
const CENTRAL_URL = process.env.CENTRAL_URL ?? "http://localhost:3001";
const INTERNAL_SECRET =
  process.env.INTERNAL_SECRET ?? "dev-internal-secret-change-me";

interface ClientData {
  roomId: string;
  userId: string;
  name: string;
}

interface QueuedInput {
  seq: number;
  input: PlayerInput;
}

interface Client {
  playerId: number;
  userId: string; // authenticated account id (from the validated JWT)
  name: string;
  queue: QueuedInput[]; // jitter buffer: one input consumed per tick
  lastRecvSeq: number; // highest seq enqueued (drops stale/duplicate packets)
  ackSeq: number; // seq of the last input actually applied
}

interface Room {
  id: string;
  state: GameState;
  clients: Map<ServerWebSocket<ClientData>, Client>;
  nextPlayerId: number;
}

const rooms = new Map<string, Room>();
let roomCounter = 0;

const createRoom = (): Room => {
  const id = `room-${++roomCounter}`;
  const room: Room = {
    id,
    state: createGameState(),
    clients: new Map(),
    nextPlayerId: 0,
  };
  rooms.set(id, room);
  return room;
};

// quick-play matchmaking: first room with a free slot, else a new room
const findRoomWithSpace = (): Room => {
  for (const room of rooms.values()) {
    if (room.state.players.length < ROOM.MAX_PLAYERS) return room;
  }
  return createRoom();
};

// join a specific room by id if it exists and has space, else fall back to quick-play
const pickRoom = (roomId: string | null): Room => {
  if (roomId) {
    const room = rooms.get(roomId);
    if (room && room.state.players.length < ROOM.MAX_PLAYERS) return room;
  }
  return findRoomWithSpace();
};

const server = Bun.serve<ClientData>({
  port,
  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      let players = 0;
      for (const room of rooms.values()) players += room.clients.size;
      return Response.json({
        ok: true,
        service: "server-game",
        version: GAME_VERSION,
        rooms: rooms.size,
        players,
      });
    }
    // room list for the central server's picker (queried server-side, no CORS needed)
    if (url.pathname === "/rooms") {
      const list = [...rooms.values()].map((room) => ({
        id: room.id,
        players: room.clients.size,
        max: ROOM.MAX_PLAYERS,
        status: room.state.status,
      }));
      return Response.json({ rooms: list });
    }
    if (url.pathname === "/ws") {
      // the game server only VALIDATES the token; it never issues one
      const token = url.searchParams.get("token");
      const payload = token ? await verifyToken(token) : null;
      if (!payload) return new Response("unauthorized", { status: 401 });
      const room = pickRoom(url.searchParams.get("room"));
      if (
        server.upgrade(req, {
          data: { roomId: room.id, userId: payload.userId, name: payload.name },
        })
      )
        return;
      return new Response("websocket upgrade failed", { status: 400 });
    }
    return new Response("fuseball game server", { status: 200 });
  },
  websocket: {
    open(ws) {
      const room = rooms.get(ws.data.roomId);
      if (!room) {
        ws.close();
        return;
      }
      const playerId = room.nextPlayerId++;
      addPlayer(room.state, playerId);
      room.clients.set(ws, {
        playerId,
        userId: ws.data.userId,
        name: ws.data.name,
        queue: [],
        lastRecvSeq: 0,
        ackSeq: 0,
      });
      if (room.state.status === "warmup" && room.state.players.length >= 2) {
        startMatch(room.state);
      }
      ws.send(encodeWelcome(playerId));
      broadcastRoster(room);
    },
    message(ws, message) {
      if (typeof message === "string") return;
      const type = messageType(message);
      // latency probe: reply at once (not on the tick) so it measures pure RTT
      if (type === MSG.PING) {
        ws.send(encodePong(decodePingId(message)));
        return;
      }
      if (type !== MSG.INPUT) return;
      const room = rooms.get(ws.data.roomId);
      const client = room?.clients.get(ws);
      if (!room || !client) return;
      const { seq, input } = decodeInput(message);
      if (seq > client.lastRecvSeq) {
        client.lastRecvSeq = seq;
        client.queue.push({ seq, input });
        if (client.queue.length > MAX_INPUT_QUEUE) client.queue.shift();
      }
    },
    close(ws) {
      const room = rooms.get(ws.data.roomId);
      if (!room) return;
      const client = room.clients.get(ws);
      if (client) {
        removePlayer(room.state, client.playerId);
        room.clients.delete(ws);
      }
      if (room.clients.size === 0) rooms.delete(room.id);
      else broadcastRoster(room);
    },
  },
});

const stepRoom = (room: Room): void => {
  if (room.clients.size === 0) return;

  // consume exactly one input per client per tick (each applied once, in order)
  const inputs: InputMap = {};
  for (const client of room.clients.values()) {
    const next = client.queue.shift();
    if (next) {
      client.ackSeq = next.seq;
      inputs[client.playerId] = next.input;
    } else {
      inputs[client.playerId] = EMPTY_INPUT;
    }
  }

  step(room.state, inputs);
  if (room.state.status === "finished") {
    reportMatch(room);
    if (room.state.players.length >= 2) startMatch(room.state);
    else room.state.status = "warmup";
  }
};

// Report a finished match to the central server so it can persist per-user stats.
// Fire-and-forget: the game loop must never block on the central server.
const reportMatch = (room: Room): void => {
  const [a, b] = room.state.score;
  const winner = a === b ? -1 : a > b ? 0 : 1; // -1 = draw
  const results = [];
  for (const client of room.clients.values()) {
    const p = room.state.players.find((pl) => pl.id === client.playerId);
    if (!p) continue;
    results.push({ userId: client.userId, won: winner === p.team, goals: 0 });
  }
  if (results.length === 0) return;
  fetch(`${CENTRAL_URL}/internal/match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SECRET,
    },
    body: JSON.stringify({ results }),
  }).catch(() => undefined);
};

const broadcastRoom = (room: Room): void => {
  for (const [ws, client] of room.clients) {
    ws.send(encodeSnapshot(room.state, client.ackSeq));
  }
};

// Send the player-name roster to everyone in the room (on join/leave only).
const broadcastRoster = (room: Room): void => {
  const entries: RosterEntry[] = [];
  for (const client of room.clients.values()) {
    const p = room.state.players.find((pl) => pl.id === client.playerId);
    entries.push({
      id: client.playerId,
      team: p?.team ?? 0,
      name: client.name,
    });
  }
  const msg = encodeRoster(entries);
  for (const ws of room.clients.keys()) ws.send(msg);
};

// Step at exactly the sim rate (catching up missed ticks), but broadcast at most
// ONE snapshot per wake so a server hiccup can't flood clients with a burst.
let acc = 0;
let last = performance.now();
let statMaxBurst = 0;
let statMaxGap = 0;
let statTicks = 0;
let statReportAt = last + 2000;
setInterval(() => {
  const now = performance.now();
  const gap = now - last;
  if (gap > statMaxGap) statMaxGap = gap;
  acc += gap;
  last = now;
  if (acc > 250) acc = 250; // avoid the spiral of death after a stall
  let stepped = false;
  let burst = 0;
  while (acc >= TICK_MS) {
    for (const room of rooms.values()) stepRoom(room);
    acc -= TICK_MS;
    stepped = true;
    burst += 1;
  }
  if (stepped) {
    for (const room of rooms.values()) broadcastRoom(room);
    statTicks += burst;
    if (burst > statMaxBurst) statMaxBurst = burst;
  }
  if (now >= statReportAt) {
    let clients = 0;
    for (const room of rooms.values()) clients += room.clients.size;
    console.log(
      `[server] ticks=${statTicks} maxBurst=${statMaxBurst} maxWakeGap=${statMaxGap.toFixed(0)}ms rooms=${rooms.size} clients=${clients}`,
    );
    statTicks = 0;
    statMaxBurst = 0;
    statMaxGap = 0;
    statReportAt = now + 2000;
  }
}, 8);

console.log(
  `[server-game] ws://localhost:${server.port}/ws (v${GAME_VERSION}, max ${ROOM.MAX_PLAYERS}/room)`,
);
