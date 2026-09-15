import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import Message from "./models/Message.js";
import User from "./models/User.js";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const server = createServer(app);


// ===============================
// SOCKET.IO
// ===============================

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});


// ===============================
// SOCKET.IO JWT AUTHENTICATION
// ===============================

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(
                new Error("Authentication error: No token provided")
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as { id: string };

        // Store authenticated user ID
        socket.data.userId = decoded.id;

        next();

    } catch (error) {

        next(
            new Error("Authentication error: Invalid token")
        );

    }
});


// ===============================
// SOCKET.IO CONNECTION
// ===============================

io.on("connection", (socket) => {

    console.log("A user connected:", socket.id);


    // ===============================
    // JOIN USER ROOM
    // ===============================

    socket.on("join", async () => {

        try {

            const userId = socket.data.userId as string;

            socket.join(userId);

            await User.findByIdAndUpdate(userId, {
                isOnline: true,
                lastSeen: null,
            });

            io.emit("userOnline", userId);

            console.log(`User ${userId} joined room`);
            console.log(`User ${userId} is online`);

        } catch (error) {

            console.error(
                "Error updating online status:",
                error
            );

        }

    });


    // ===============================
    // REAL-TIME MESSAGE
    // ===============================
socket.on("sendMessage", async (data) => {
    try {
        const { receiver, message } = data;

        const sender = socket.data.userId as string;

        if (!receiver || !message?.trim()) {
            console.log("Invalid message data");
            return;
        }

        if (message.trim().length > 1000) {
            console.log("Message is too long");
            return;
        }

        const receiverUser = await User.findById(receiver);

        if (!receiverUser) {
            console.log("Receiver not found");
            return;
        }

        const newMessage = await Message.create({
            sender,
            receiver,
            message: message.trim(),
        });

        io.to(receiver).emit(
            "receiveMessage",
            newMessage
        );

        io.to(sender).emit(
            "receiveMessage",
            newMessage
        );

    } catch (error) {
        console.error(
            "Error sending message:",
            error
        );
    }
});
  

    // ===============================
    // TYPING
    // ===============================

    socket.on("typing", (receiverId) => {

        const userId = socket.data.userId as string;

        io.to(receiverId).emit(
            "userTyping",
            userId
        );

    });


    // ===============================
    // STOP TYPING
    // ===============================

    socket.on("stopTyping", (receiverId) => {

        const userId = socket.data.userId as string;

        io.to(receiverId).emit(
            "userStoppedTyping",
            userId
        );

    });


    // ===============================
    // DISCONNECT
    // ===============================

    socket.on("disconnect", async () => {

        console.log(
            "A user disconnected:",
            socket.id
        );


        const userId =
            socket.data.userId as string;


        if (userId) {

            try {

                await User.findByIdAndUpdate(userId, {
                    isOnline: false,
                    lastSeen: new Date(),
                });


                io.emit(
                    "userOffline",
                    userId
                );


                console.log(
                    `User ${userId} is offline`
                );

            } catch (error) {

                console.error(
                    "Error updating offline status:",
                    error
                );

            }

        }

    });

});


// ===============================
// EXPRESS MIDDLEWARE
// ===============================

app.use(express.json());

app.use(express.static("public"));


// ===============================
// DATABASE
// ===============================

connectDB();


// ===============================
// ROUTES
// ===============================

app.use("/api", authRoutes);

app.use("/api/messages", messageRoutes);


// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

    console.log(
        `Server is running on port ${PORT}`
    );

});