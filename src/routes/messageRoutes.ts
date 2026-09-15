import express from "express";
import { sendMessage,getMessages } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/send", sendMessage);
router.get("/:userId/:otherUserId", getMessages);
router.post("/send", protect, sendMessage);
export default router;