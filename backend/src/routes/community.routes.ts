import { Router } from "express";
import {
  getFeed,
  createPost,
  createStory,
  updatePost,
  deletePost,
  toggleLike,
  sharePost,
  addComment,
  getComments,
  getUserPosts,
  toggleSavePost,
  toggleCommentLike,
  deleteComment,
  getReels,
  searchCommunity,
  votePoll,
  viewStory,
  toggleFollow,
  getStoreInfo
} from "../controllers/community.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Feed & Posts
router.get("/", authMiddleware, getFeed);
router.get("/reels", authMiddleware, getReels);
router.get("/search", authMiddleware, searchCommunity);
router.get("/user/:userId", authMiddleware, getUserPosts);
router.post("/user/:userId/follow", authMiddleware, toggleFollow);
router.get("/store/:tenantId", authMiddleware, getStoreInfo);
router.post("/:postId/vote", authMiddleware, votePoll);
router.post("/", authMiddleware, createPost);
router.put("/:postId", authMiddleware, updatePost);
router.delete("/:postId", authMiddleware, deletePost);

// Stories
router.post("/stories", authMiddleware, createStory);
router.post("/stories/:storyId/view", authMiddleware, viewStory);

// Interactions
router.post("/:postId/like", authMiddleware, toggleLike);
router.post("/:postId/save", authMiddleware, toggleSavePost);
router.post("/:postId/share", authMiddleware, sharePost);
router.post("/:postId/comments", authMiddleware, addComment);
router.get("/:postId/comments", authMiddleware, getComments);
router.post("/comments/:commentId/like", authMiddleware, toggleCommentLike);
router.delete("/comments/:commentId", authMiddleware, deleteComment);

export default router;
