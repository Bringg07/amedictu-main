// lib/socket-server.ts
// Setup Socket.io untuk notifikasi antrian real-time
// Diintegrasikan dengan Next.js custom server

import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

let io: SocketIOServer;

export function getSocketIO(): SocketIOServer | null {
  return io || null;
}

export function initSocketIO(httpServer: NetServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client terhubung: ${socket.id}`);

    // Client bergabung ke "room" poli tertentu untuk update real-time
    socket.on("join:poli", (poli: string) => {
      socket.join(`poli:${poli}`);
      console.log(`[Socket.io] ${socket.id} bergabung ke room poli:${poli}`);
    });

    // Client bergabung ke room user untuk notifikasi personal
    socket.on("join:user", (id_user: string) => {
      socket.join(`user:${id_user}`);
      console.log(`[Socket.io] ${socket.id} bergabung ke room user:${id_user}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client terputus: ${socket.id}`);
    });
  });

  return io;
}

// ── Emit Events dari Server ──────────────────────────────

/**
 * Emit ke semua client di poli tertentu saat status antrian berubah
 */
export function emitAntrianUpdate(poli: string, data: object) {
  if (!io) return;
  io.to(`poli:${poli}`).emit("antrian:update", data);
}

/**
 * Emit notifikasi personal ke user tertentu
 */
export function emitNotifikasiUser(id_user: number, data: object) {
  if (!io) return;
  io.to(`user:${id_user}`).emit("notifikasi:baru", data);
}

/**
 * Emit ke SEMUA client yang terhubung (misal: pengumuman global)
 */
export function emitBroadcast(event: string, data: object) {
  if (!io) return;
  io.emit(event, data);
}
