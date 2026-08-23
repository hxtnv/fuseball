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
import {
  botName,
  computeBotInput,
  createBotMemory,
  type BotMemory,
} from "./bots";

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

interface Bot {
  mem: BotMemory;
  name: string;
}

interface Room {
  id: string;
  state: GameState;
  clients: Map<ServerWebSocket<ClientData>, Client>;
  bots: Map<number, Bot>; // playerId -> bot; filled to keep games full
  goals: Map<number, number>; // playerId -> goals scored this match
  nextPlayerId: number;
  nextBotName: number;
}

const rooms = new Map<string, Room>();
let roomCounter = 0;

const createRoom = (): Room => {
  const id = `room-${++roomCounter}`;
  const room: Room = {
    id,
    state: createGameState(),
    clients: new Map(),
    bots: new Map(),
    goals: new Map(),
    nextPlayerId: 0,
    nextBotName: 0,
  };
  rooms.set(id, room);
  return room;
};

const teamCount = (room: Room, team: number): number =>
  room.state.players.reduce((n, p) => n + (p.team === team ? 1 : 0), 0);

// add one bot, assigning a defender only if its team doesn't have one yet
const addBot = (room: Room): void => {
  const id = room.nextPlayerId++;
  const p = addPlayer(room.state, id); // auto-balanced onto the smaller team
  let hasDefender = false;
  for (const [bid, b] of room.bots) {
    const bp = room.state.players.find((pl) => pl.id === bid);
    if (bp && bp.team === p.team && b.mem.role === "defender") {
      hasDefender = true;
      break;
    }
  }
  room.bots.set(id, {
    mem: createBotMemory(hasDefender ? "attacker" : "defender"),
    name: botName(room.nextBotName++),
  });
};

// drop one bot, preferring the larger team so removing it keeps sides even
const evictBot = (room: Room): void => {
  if (room.bots.size === 0) return;
  const bigger = teamCount(room, 0) >= teamCount(room, 1) ? 0 : 1;
  let target: number | null = null;
  for (const bid of room.bots.keys()) {
    const bp = room.state.players.find((pl) => pl.id === bid);
    if (bp && bp.team === bigger) {
      target = bid;
      break;
    }
  }
  if (target === null) target = room.bots.keys().next().value ?? null;
  if (target === null) return;
  removePlayer(room.state, target);
  room.bots.delete(target);
};

// top the room up with bots so a lone human still gets a full game
const fillBots = (room: Room): void => {
  while (room.state.players.length < ROOM.MAX_PLAYERS) addBot(room);
};

// quick-play matchmaking: first room with a free HUMAN slot, else a new room
// (bots don't count toward capacity — they're evicted to seat arriving players)
const findRoomWithSpace = (): Room => {
  for (const room of rooms.values()) {
    if (room.clients.size < ROOM.MAX_PLAYERS) return room;
  }
  return createRoom();
};

// join a specific room by id if it exists and has space, else fall back to quick-play
const pickRoom = (roomId: string | null): Room => {
  if (roomId) {
    const room = rooms.get(roomId);
    if (room && room.clients.size < ROOM.MAX_PLAYERS) return room;
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
      // seat the human, evicting a bot first if the room is already full
      if (room.state.players.length >= ROOM.MAX_PLAYERS) evictBot(room);
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
      fillBots(room); // instant play: keep the match full with bots
      if (room.state.status === "warmup" && room.state.players.length >= 2) {
        startMatch(room.state);
        room.goals.clear();
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
      if (type === MSG.RESTART) {
        const room = rooms.get(ws.data.roomId);
        if (room && room.state.status === "finished") {
          startMatch(room.state);
          room.goals.clear();
        }
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
      else {
        fillBots(room); // backfill the vacated slot with a bot
        broadcastRoster(room);
      }
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

  // bots produce their own input each tick
  for (const [botId, bot] of room.bots) {
    const bp = room.state.players.find((p) => p.id === botId);
    if (bp) inputs[botId] = computeBotInput(room.state, bp, bot.mem);
  }

  const before = room.state.status;
  const s0 = room.state.score[0];
  const s1 = room.state.score[1];
  step(room.state, inputs);

  // credit the goal to whoever last touched the ball for the scoring team
  if (room.state.score[0] > s0 || room.state.score[1] > s1) {
    const team = room.state.score[0] > s0 ? 0 : 1;
    const scorer = room.state.ball.lastTouchedBy;
    if (scorer !== null) {
      const p = room.state.players.find((pl) => pl.id === scorer);
      if (p && p.team === team)
        room.goals.set(scorer, (room.goals.get(scorer) ?? 0) + 1);
    }
  }

  // report once, on the tick the match ends; it then waits for a rematch request
  if (room.state.status === "finished" && before !== "finished") {
    reportMatch(room);
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
    results.push({
      userId: client.userId,
      won: winner === p.team,
      goals: room.goals.get(client.playerId) ?? 0,
    });
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
  for (const [botId, bot] of room.bots) {
    const p = room.state.players.find((pl) => pl.id === botId);
    entries.push({ id: botId, team: p?.team ?? 0, name: bot.name });
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
