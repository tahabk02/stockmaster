import dotenv from "dotenv";
import path from "path";
// Load env vars before anything else
dotenv.config(); // Look in CWD
dotenv.config({ path: path.resolve(__dirname, "../.env") }); // Look in backend root relative to src or dist

import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { registerModels } from "./models";
import app from "./app"; // Import the configured app
import { ENV } from "./config/env"; // Use the validated env
import Logger from "./utils/logger";

import { connectDatabase } from "./config/database";

registerModels();

// Infrastructure Initialized
const PORT = ENV.PORT || 3000;
const server = http.createServer(app);

const IS_VERCEL = !!process.env.VERCEL;

export let io: Server | null = null;

if (!IS_VERCEL) {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    pingTimeout: 60000,
  });

  // --- 🌐 SECURE SOCKET LAYER ---
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded: any = jwt.verify(token, ENV.JWT_SECRET || "your_secret_key");
      (socket as any).userId = (decoded.id || decoded._id).toString();
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  const onlineUsers = new Map(); // userId -> socketId

  io.on("connection", (socket: any) => {
    const userId = socket.userId;
    socket.join(userId); 
    onlineUsers.set(userId, socket.id);
    
    Logger.info(`🚀 [CONNECTED] User: ${userId}`);
    io?.emit("userStatus", { userId, status: "ONLINE" });

    // Send current online users to the new client
    socket.emit("initialOnlineUsers", Array.from(onlineUsers.keys()));

    // 1. Message Relay
    socket.on("sendMessage", ({ to, message }: { to: string, message: any }) => {
      if (!to) return;
      io?.to(to.toString()).emit("newMessage", message);
      Logger.info(`✉️ [MSG] From ${userId} to ${to}`);
    });

    // 2. Typing Indicator
    socket.on("typing", ({ to, conversationId }: { to: string, conversationId: string }) => {
      io?.to(to.toString()).emit("userTyping", { conversationId, userId });
    });

    // 3. Call Signaling
    socket.on("callUser", async (data: any) => {
      const { userToCall, signalData, from, name, avatar, callType } = data;
      const targetRoom = userToCall.toString();
      const socketsInRoom = await io?.in(targetRoom).fetchSockets();
      
      Logger.info(`📞 [CALL] From ${from} to ${userToCall} (${callType}). Target online: ${socketsInRoom && socketsInRoom.length > 0}`);
      
      if (!socketsInRoom || socketsInRoom.length === 0) {
        Logger.warn(`⚠️ [CALL] Target ${userToCall} is offline or not in room.`);
      }

      io?.to(targetRoom).emit("callUser", { 
        signal: signalData, 
        from, 
        name, 
        avatar, 
        callType 
      });
    });

    socket.on("answerCall", (data: any) => {
      io?.to(data.to.toString()).emit("callAccepted", data.signal);
    });

    socket.on("ice-candidate", ({ to, candidate }: { to: string, candidate: any }) => {
      io?.to(to.toString()).emit("ice-candidate", { from: userId, candidate });
    });

    socket.on("endCall", ({ to, reason }: { to: string, reason?: string }) => {
      if(to) io?.to(to.toString()).emit("callEnded", { reason });
    });

    // 4. Community Events
    socket.on("newPost", (post: any) => {
      socket.broadcast.emit("postCreated", post);
    });

    socket.on("postLiked", ({ postId, likesCount, userId }: { postId: string, likesCount: number, userId: string }) => {
      socket.broadcast.emit("postInteraction", { postId, likesCount, userId, type: 'LIKE' });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io?.emit("userStatus", { userId, status: "OFFLINE" });
      Logger.info(`🔌 [DISCONNECTED] User: ${userId}`);
    });
  });
}

// For local development
if (!IS_VERCEL) {
  connectDatabase().then(() => {
    server.listen(Number(PORT), "0.0.0.0", () => Logger.info(`📡 Neural Core listening on port ${PORT}`));
  });
} else {
  // Ensure DB connects on serverless invocation
  connectDatabase();
}

export default app;
