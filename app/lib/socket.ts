// app/lib/socket.ts — Server-side helper to emit Socket.IO events from API routes
import type { Server as SocketIOServer } from "socket.io";

/**
 * Gets the global Socket.IO server instance.
 * Returns null if Socket.IO is not initialized (e.g., during build).
 */
export function getIO(): SocketIOServer | null {
  return (global as any).io || null;
}

/**
 * Emit an event to all users in a specific jam room.
 */
export function emitToJam(jamId: string, event: string, data: any) {
  const io = getIO();
  if (io) {
    io.to(`jam:${jamId}`).emit(event, data);
    console.log(`🔌 Socket.IO → jam:${jamId} [${event}]`);
  }
}

/**
 * Emit an event to a specific user across all their connections.
 */
export function emitToUser(userId: string, event: string, data: any) {
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}
