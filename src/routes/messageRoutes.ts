
import express from "express";
import {
    sendMessage,
    getMessages,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Send a message — authentication required
router.post("/send", protect, sendMessage);

// Fetch conversation history — authentication required
router.get("/:userId/:otherUserId", protect, getMessages);

export default router;
