"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

// ─── Socket Context ─────────────────────────────────────────
export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinJam: (jamId: string) => void;
  leaveJam: (jamId: string) => void;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinJam: () => {},
  leaveJam: () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}

// ─── Custom Hook for Jam-Specific Socket Events ─────────────
export function useJamSocket(jamId: string) {
  const { socket, isConnected, joinJam, leaveJam } = useSocket();
  const [viewerCount, setViewerCount] = useState(0);
  const [viewers, setViewers] = useState<Array<{ name: string }>>([]);

  useEffect(() => {
    if (!socket || !isConnected || !jamId) return;

    joinJam(jamId);

    const handleViewerCount = (data: { count: number; viewers: Array<{ name: string }> }) => {
      setViewerCount(data.count);
      setViewers(data.viewers);
    };

    socket.on("viewer-count", handleViewerCount);

    return () => {
      socket.off("viewer-count", handleViewerCount);
      leaveJam(jamId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected, jamId]);

  return {
    socket,
    isConnected,
    viewerCount,
    viewers,
  };
}
