
import type { Request, Response } from "express";
import Message from "../models/Message.js";

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { receiver, message } = req.body;
        const sender = (req as any).userId;

        if (!sender) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (
            !receiver ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                message: "Receiver and message are required",
            });
        }

        if (message.trim().length > 1000) {
            return res.status(400).json({
                message: "Message cannot exceed 1000 characters",
            });
        }

        const newMessage = await Message.create({
            sender,
            receiver,
            message: message.trim(),
        });

        return res.status(201).json({
            message: "Message sent successfully",
            data: newMessage,
        });
    } catch (error) {
        console.error("Error sending message:", error);

        return res.status(500).json({
            message: "Failed to send message",
        });
    }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { userId, otherUserId } = req.params;

        if (!userId || !otherUserId) {
            return res.status(400).json({
                message: "Both user IDs are required",
            });
        }

        const messages = await Message.find({
            $or: [
                {
                    sender: userId,
                    receiver: otherUserId,
                },
                {
                    sender: otherUserId,
                    receiver: userId,
                },
            ],
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            message: "Messages fetched successfully",
            data: messages,
        });
    } catch (error) {
        console.error("Error fetching messages:", error);

        return res.status(500).json({
            message: "Failed to fetch messages",
        });
    }
};
