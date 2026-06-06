"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { SocketContext } from "@/app/lib/hooks/useSocket";

let socketInstance: Socket | null = null;

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentJamRef = useRef<string | null>(null);

  useEffect(() => {
    // Create singleton socket
    if (!socketInstance) {
      socketInstance = io({
        path: "/api/socketio",
        transports: ["websocket", "polling"],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
    }

    const sock = socketInstance;
    setSocket(sock);

    sock.on("connect", () => {
      console.log("🔌 Socket.IO connected:", sock.id);
      setIsConnected(true);

      // Rejoin jam room if we were in one (handles reconnection)
      if (currentJamRef.current) {
        sock.emit("join-jam", currentJamRef.current);
      }
    });

    sock.on("disconnect", (reason) => {
      console.log("🔌 Socket.IO disconnected:", reason);
      setIsConnected(false);
    });

    sock.on("connect_error", (error) => {
      console.error("🔌 Socket.IO connection error:", error.message);
    });

    // Connect
    if (!sock.connected) {
      sock.connect();
    }

    return () => {
      // Don't disconnect on unmount — keep the singleton alive
      // Only clean up event listeners to prevent duplicates
    };
  }, []);

  const joinJam = (jamId: string) => {
    if (socket && isConnected) {
      // Leave previous jam if any
      if (currentJamRef.current && currentJamRef.current !== jamId) {
        socket.emit("leave-jam", currentJamRef.current);
      }
      currentJamRef.current = jamId;
      socket.emit("join-jam", jamId);
    }
  };

  const leaveJam = (jamId: string) => {
    if (socket && isConnected) {
      socket.emit("leave-jam", jamId);
      if (currentJamRef.current === jamId) {
        currentJamRef.current = null;
      }
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinJam, leaveJam }}>
      {children}
    </SocketContext.Provider>
  );
}
