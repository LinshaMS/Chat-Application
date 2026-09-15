import Message from "../models/Message.js";

export const sendMessage = async (req: any, res: any) => {
    try {
        const { receiver, message } = req.body;

        const sender = req.userId;

        if (!sender) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        if (!receiver || !message?.trim()) {
            return res.status(400).json({
                message: "Receiver and message are required"
            });
        }

        const newMessage = await Message.create({
            sender,
            receiver,
            message: message.trim(),
        });

        res.status(201).json({
            message: "Message sent successfully",
            data: newMessage,
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to send message",
            error,
        });
    }
};

export const getMessages = async (req: any, res: any) => {
    try {
        const { userId, otherUserId } = req.params;

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

        res.status(200).json({
            message: "Messages fetched successfully",
            data: messages,
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch messages",
            error,
        });
    }
};