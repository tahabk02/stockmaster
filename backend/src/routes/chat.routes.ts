import { Router } from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  createGroup,
  markAsRead,
  deleteMessage,
  logCall,
  getGlobalMessages,
  sendGlobalMessage,
  toggleReaction
} from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/conversations", authMiddleware, getConversations);
router.post("/conversations", authMiddleware, createConversation);
router.post("/groups", authMiddleware, createGroup);
router.get("/global", authMiddleware, getGlobalMessages);
router.post("/global", authMiddleware, sendGlobalMessage);
router.get("/messages/:conversationId", authMiddleware, getMessages);
router.post("/messages", authMiddleware, sendMessage);
router.patch("/messages/:messageId/reaction", authMiddleware, toggleReaction);
router.post("/log-call", authMiddleware, logCall);
router.post("/mark-as-read/:conversationId", authMiddleware, markAsRead);
router.delete("/messages/:messageId", authMiddleware, deleteMessage);

export default router;
