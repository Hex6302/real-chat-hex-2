import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}
const userLastSeen = {}; // {userId: timestamp}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    delete userLastSeen[userId]; // Remove last seen when user comes online
    // Emit updated last seen data to all clients
    io.emit("userLastSeen", { [userId]: null });
    // Emit user online status
    io.emit("userOnlineStatus", { userId, isOnline: true });
  }

  // Send initial online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle typing status
  socket.on("typing", ({ receiverId, isTyping }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typingStatus", {
        senderId: userId,
        isTyping,
      });
    }
  });

  // Handle message status updates
  socket.on("messageStatus", ({ messageId, status, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageStatusUpdate", {
        messageId,
        status,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      userLastSeen[userId] = Date.now();
      // Emit updated last seen data to all clients
      io.emit("userLastSeen", { [userId]: userLastSeen[userId] });
      // Emit user offline status
      io.emit("userOnlineStatus", { userId, isOnline: false });
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Helper function to get user's last seen time
export const getUserLastSeen = (userId) => {
  return userLastSeen[userId];
};

export { io, app, server };
