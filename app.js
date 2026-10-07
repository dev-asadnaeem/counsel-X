const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
let PORT = process.env.PORT || 3000;
const path = require("path");
let client = require("./utils/redisDatabase");
// const authentication = require("./middleware/authentication").authentication
const counselorRoute = require("./router/counselor");
const authRoute = require("./router/auth");
const messageRoute = require("./router/message");
const profileRoute = require("./router/profile");
const userStatusRoute = require("./router/userStatus");
const counselorProfileRoute = require("./router/counselingSession");
const adminRoute = require("./router/admin");
const studentRoute = require("./router/student");
const notificationRoute = require("./router/notification");
const error = require("./controller/error404");
const { Server } = require("socket.io");
const CallLog = require("./model/CallLog");
const Notification = require("./model/Notification");
const User = require("./model/User");
const server = http.createServer(app);
const allowedOrigins = [
  "https://counsel-x-4wvg.onrender.com",
  // "http://localhost:5173",
  // "http://localhost:5174",
  // "http://localhost:3000",
  // "http://127.0.0.1:5173",
  // "http://127.0.0.1:5174",
  // "http://127.0.0.1:3000",
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(...process.env.FRONTEND_URL.split(','));
}

const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const corsOptions = {
  origin: (origin, callback) => {
    // Exact Origin Matching for Security!
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  credentials: true,
};

// Socket.IO CORS config (must include all allowed origins explicitly)
const socketCorsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true,
};

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.set('trust proxy', 1);
app.use(mongoSanitize());
app.use(xss());

// CORS must come BEFORE rate-limiter so OPTIONS preflight is handled correctly
app.use(cors(corsOptions));

// Apply the rate limiting middleware to API calls only

// app.use(authentication)

app.use(express.json());
const io = new Server(server, {
  cors: socketCorsOptions,
  transports: ["websocket", "polling"],
});
app.set("io", io);

// Initialize Cron Jobs
try {
  const { initCronJobs } = require("./utils/cronJobs");
  initCronJobs(io);
} catch (err) {
  console.log("Cron jobs init error:", err);
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(profileRoute);
app.use(counselorRoute);
app.use(authRoute);
app.use(messageRoute);
app.use(userStatusRoute);
app.use(adminRoute);
app.use(counselorProfileRoute);
app.use(studentRoute);
app.use(notificationRoute);
// Fallback to React for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});
try {
  io.on("connection", async (socket) => {
    // Register user for personal notifications
    socket.on("registerUser", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        socket.userId = userId; // persist for WebRTC signaling
        console.log(`User ${userId} joined their notification room.`);
      }
    });

    // Handle joining the room
    socket.on("join", async ({ room, userId }) => {
      // Leave the previous room if the user was already in one
      if (socket.room) {
        socket.leave(socket.room);
        // Notify the old room that the user is offline
        await client.set(
          userId ? userId.toString() : "unknown",
          JSON.stringify({ status: "offline" }),
          "EX", 3600
        );
        socket
          .to(socket.room)
          .emit("status", { socketId: socket.id, status: "offline" });
      }

      // Join the new room
      socket.join(room);
      await client.set(
        userId ? userId.toString() : "unknown",
        JSON.stringify({ status: "online" }),
        "EX", 3600
      );
      socket.room = room; // Store the current room in the socket object
      socket.userId = userId; // Save the user ID for status tracking
      // Notify the new room that the user is online
      socket.to(room).emit("status", { socketId: socket.id, status: "online" });
    });
    // Handle receiving and broadcasting messages
    socket.on("message", ({ room, data }) => {
      const { _id, message, senderId, file, image, createdAt } = data;
      const newMessage = { _id, message, senderId, file, image, createdAt };
      io.to(room).emit("message", newMessage);
    });

    // ─── WebRTC Signaling ─────────────────────────────────────────────────────

    // Caller initiates a call offer
    socket.on("call:offer", ({ targetUserId, offer, callType, callerInfo, callerId: clientCallerId }) => {
      // Use socket.userId (set on registerUser) OR client-provided callerId as fallback
      const resolvedCallerId = socket.userId || clientCallerId;
      console.log(`[Call] ${resolvedCallerId} → user_${targetUserId} [${callType}]`);
      io.to(`user_${targetUserId}`).emit("call:incoming", {
        offer,
        callType,
        callerInfo,
        callerSocketId: socket.id,
        callerId: resolvedCallerId,
      });
    });

    // Receiver sends back the answer
    socket.on("call:answer", ({ targetUserId, answer }) => {
      console.log(`[Call] Answer from ${socket.userId} → user_${targetUserId}`);
      io.to(`user_${targetUserId}`).emit("call:answered", { answer });
    });

    // ICE candidates exchange
    socket.on("call:ice-candidate", ({ targetUserId, candidate }) => {
      console.log(`[Call] ICE Candidate from ${socket.userId} → user_${targetUserId}`);
      io.to(`user_${targetUserId}`).emit("call:ice-candidate", { candidate });
    });

    // Caller or receiver rejects
    socket.on("call:reject", ({ targetUserId }) => {
      io.to(`user_${targetUserId}`).emit("call:rejected");
    });

    // Either party ends the call
    socket.on("call:end", ({ targetUserId }) => {
      io.to(`user_${targetUserId}`).emit("call:ended");
    });

    // Log call start + notify admins
    socket.on("call:started", async ({ callLogId, callerId, receiverId, callType }) => {
      try {
        await CallLog.findByIdAndUpdate(callLogId, { status: 'accepted', startTime: new Date() });
        const admins = await User.find({ role: 'admin' });
        const caller = await User.findById(callerId);
        const receiver = await User.findById(receiverId);
        const callerName = caller?.personalInfo?.name || caller?.personalInfo?.firstName || 'Unknown';
        const receiverName = receiver?.personalInfo?.name || receiver?.personalInfo?.firstName || 'Unknown';
        const msg = `📞 ${callType === 'video' ? 'Video' : 'Voice'} call started between ${callerName} and ${receiverName}.`;
        for (const admin of admins) {
          const notif = await Notification.create({
            recipient: admin._id,
            message: msg,
            type: 'system_update',
            relatedSession: null
          });
          io.to(`user_${admin._id.toString()}`).emit('newNotification', notif);
        }
      } catch (err) {
        console.error('call:started error', err);
      }
    });

    // Log call end + notify admins with duration
    socket.on("call:log-end", async ({ callLogId, callerId, receiverId, callType, startTime }) => {
      try {
        const endTime = new Date();
        const durationSeconds = startTime ? Math.round((endTime - new Date(startTime)) / 1000) : 0;
        await CallLog.findByIdAndUpdate(callLogId, { status: 'ended', endTime, durationSeconds });
        const admins = await User.find({ role: 'admin' });
        const caller = await User.findById(callerId);
        const receiver = await User.findById(receiverId);
        const callerName = caller?.personalInfo?.name || caller?.personalInfo?.firstName || 'Unknown';
        const receiverName = receiver?.personalInfo?.name || receiver?.personalInfo?.firstName || 'Unknown';
        const mins = Math.floor(durationSeconds / 60);
        const secs = durationSeconds % 60;
        const msg = `📵 ${callType === 'video' ? 'Video' : 'Voice'} call ended between ${callerName} and ${receiverName}. Duration: ${mins}m ${secs}s.`;
        for (const admin of admins) {
          const notif = await Notification.create({
            recipient: admin._id,
            message: msg,
            type: 'system_update',
            relatedSession: null
          });
          io.to(`user_${admin._id.toString()}`).emit('newNotification', notif);
        }
      } catch (err) {
        console.error('call:log-end error', err);
      }
    });

    // Create initial call log record and return ID to caller
    socket.on("call:create-log", async ({ callerId, receiverId, callType }, callback) => {
      try {
        const log = await CallLog.create({ callerId, receiverId, callType, status: 'initiated' });
        if (typeof callback === 'function') callback({ callLogId: log._id.toString() });
      } catch (err) {
        console.error('call:create-log error', err);
        if (typeof callback === 'function') callback({ callLogId: null });
      }
    });

    // ─────────────────────────────────────────────────────────────────────────

    // Handle disconnect
    socket.on("disconnect", async () => {
      if (socket.room) {
        // Notify the room that the user is offline
        await client.set(
          socket.userId ? socket.userId.toString() : "unknown",
          JSON.stringify({ status: "offline" }),
          "EX", 3600
        );
        io.to(socket.room).emit("status", {
          socketId: socket.id,
          status: "offline",
        });
      }
    });
  });
} catch (error) {
  console.error("Error on websockets or redis", error.message);
}

const { initAdmin } = require("./utils/initAdmin");

mongoose.connect(process.env.MONGODB_STRING).then(async () => {
  console.log("✅ MongoDB connected successfully!");

  // Auto-initialize Admin
  await initAdmin();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.log("⚠️ MongoDB connection failed, but starting server anyway...");
  console.log("Error:", error.message);
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (without MongoDB)`);
  });
});
