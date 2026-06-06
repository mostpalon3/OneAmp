// server.ts — Custom Next.js server with Socket.IO
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { getToken } from "next-auth/jwt";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ─── Types ────────────────────────────────────────────────
interface JamUser {
  userId: string;
  name: string;
  joinedAt: Date;
}

interface JamRoom {
  jamId: string;
  users: Map<string, JamUser>;
}

// ─── Global State ─────────────────────────────────────────
const jamRooms = new Map<string, JamRoom>();

// ─── Playback Sync State ──────────────────────────────────
interface PlaybackState {
  streamId: string;
  currentTime: number;
  updatedAt: number; // Date.now() when last updated
}
const jamPlayback = new Map<string, PlaybackState>();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // ─── Socket.IO Server ────────────────────────────────────
  const io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: dev ? [`http://localhost:${port}`, `http://127.0.0.1:${port}`] : process.env.NEXTAUTH_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Performance tuning
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
  });

  // ─── Authentication Middleware ────────────────────────────
  io.use(async (socket, next) => {
    try {
      // Extract session token from handshake cookies
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        console.warn("🔌 Socket auth: No cookies provided, allowing anonymous connection");
        socket.data.userId = "anonymous";
        socket.data.email = "anonymous";
        socket.data.name = "Anonymous";
        return next();
      }

      // Parse the NextAuth session token
      const token = await getToken({
        req: {
          headers: { cookie: cookies },
        } as any,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token?.email) {
        console.warn("🔌 Socket auth: No valid token, allowing anonymous connection");
        socket.data.userId = "anonymous";
        socket.data.email = "anonymous";
        socket.data.name = "Anonymous";
        return next();
      }

      // Attach user info to socket
      socket.data.userId = token.sub;
      socket.data.email = token.email;
      socket.data.name = token.name || "User";

      next();
    } catch (error) {
      console.error("🔌 Socket auth error:", error);
      // Allow connection even on auth error — features gracefully degrade
      socket.data.userId = "anonymous";
      socket.data.email = "anonymous";
      socket.data.name = "Anonymous";
      next();
    }
  });

  // ─── Connection Handling ──────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.data.email})`);

    // ── Join a Jam Room ─────────────────────────────────────
    socket.on("join-jam", (jamId: string) => {
      if (!jamId || typeof jamId !== "string") return;

      socket.join(`jam:${jamId}`);

      // Track presence
      if (!jamRooms.has(jamId)) {
        jamRooms.set(jamId, {
          jamId,
          users: new Map(),
        });
      }

      const room = jamRooms.get(jamId)!;
      room.users.set(socket.id, {
        userId: socket.data.userId,
        name: socket.data.name || "Anonymous",
        joinedAt: new Date(),
      });

      // Broadcast updated viewer count to all users in the room
      const viewerData = {
        count: room.users.size,
        viewers: Array.from(room.users.values()).map((u) => ({
          name: u.name,
          joinedAt: u.joinedAt,
        })),
      };
      io.to(`jam:${jamId}`).emit("viewer-count", viewerData);

      // 🎵 Send current playback position to the new joiner
      const playback = jamPlayback.get(jamId);
      if (playback) {
        const elapsed = (Date.now() - playback.updatedAt) / 1000;
        socket.emit("playback-position", {
          streamId: playback.streamId,
          currentTime: playback.currentTime + elapsed,
          timestamp: Date.now(),
        });
        console.log(`🎵 Sent playback sync to ${socket.data.email}: ${Math.floor(playback.currentTime + elapsed)}s`);
      }

      console.log(`👤 User ${socket.data.email} joined jam:${jamId} (${room.users.size} viewers)`);
    });

    // ── Playback Sync (from creator) ─────────────────────────
    socket.on("playback-sync", (data: { jamId: string; streamId: string; currentTime: number }) => {
      if (!data.jamId || !data.streamId) return;
      jamPlayback.set(data.jamId, {
        streamId: data.streamId,
        currentTime: data.currentTime,
        updatedAt: Date.now(),
      });
    });

    // ── Leave a Jam Room ────────────────────────────────────
    socket.on("leave-jam", (jamId: string) => {
      if (!jamId || typeof jamId !== "string") return;
      socket.leave(`jam:${jamId}`);
      handleLeaveJam(socket, jamId, io);
    });

    // ── Disconnect ──────────────────────────────────────────
    socket.on("disconnect", () => {
      // Remove from all jam rooms
      for (const [jamId, room] of jamRooms.entries()) {
        if (room.users.has(socket.id)) {
          handleLeaveJam(socket, jamId, io);
        }
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // ─── Export io for use in API routes ──────────────────────
  (global as any).io = io;

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO path: /api/socketio`);
    });
});

// ─── Helper ─────────────────────────────────────────────────
function handleLeaveJam(socket: any, jamId: string, io: SocketIOServer) {
  const room = jamRooms.get(jamId);
  if (room) {
    room.users.delete(socket.id);

    if (room.users.size === 0) {
      jamRooms.delete(jamId);
      jamPlayback.delete(jamId); // Clean up playback sync
    } else {
      io.to(`jam:${jamId}`).emit("viewer-count", {
        count: room.users.size,
        viewers: Array.from(room.users.values()).map((u) => ({
          name: u.name,
          joinedAt: u.joinedAt,
        })),
      });
    }

    console.log(`👤 User ${socket.data.email} left jam:${jamId} (${room?.users.size ?? 0} viewers remaining)`);
  }
}
