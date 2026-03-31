import { Request, Response } from "express";
import Post from "../models/Post";
import Comment from "../models/Comment";
import Like from "../models/Like";
import Story from "../models/Story";
import User from "../models/User";
import { cloudinary } from "../config/cloudinary";
import mongoose from "mongoose";

/**
 * ULTRA PRO FEED ENGINE
 * Supports: Normal Posts, Reels, Tag filtering, and Popular algorithms
 */
export const getFeed = async (req: any, res: Response) => {
  try {
    const rawUserId = req.user?.id || req.user?._id;
    const { tab, type, tag } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    if (!rawUserId) return res.status(401).json({ message: "Identification Failure" });
    const userId = new mongoose.Types.ObjectId(rawUserId);

    let query: any = {};
    let sort: any = { createdAt: -1 };

    if (tab === "SAVED") query.savedBy = userId;
    else if (tab === "POPULAR") sort = { likesCount: -1, createdAt: -1 };
    
    if (type) query.postType = type;
    if (tag) query.tags = tag;

    // 1. Stories Registry
    let stories: any[] = [];
    try {
      if (page === 1) {
        stories = await Story.find({ expiresAt: { $gt: new Date() } })
          .populate("author", "name avatar jobTitle role")
          .sort({ createdAt: -1 }).limit(20).lean();
      }
    } catch (storyErr) {
      console.error("⚠️ Stories Fetch Error:", storyErr);
    }

    // 2. Main Signal Stream
    const posts = await Post.find(query)
      .sort(sort).skip(skip).limit(limit)
      .populate("author", "name avatar jobTitle role followers following bio")
      .lean();

    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      try {
        const pId = post._id || (post as any).id;
        if (!pId) return null;

        const userLike = await Like.findOne({ postId: pId, user: userId });
        const reactions = await Like.aggregate([
          { $match: { postId: new mongoose.Types.ObjectId(pId) } },
          { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);
        
        return { 
          ...post, 
          isLiked: !!userLike, 
          reactionType: userLike?.type || null, 
          isSaved: Array.isArray(post.savedBy) ? post.savedBy.some((uid: any) => uid && uid.toString() === userId.toString()) : false,
          reactionSummary: reactions.map(r => ({ type: r._id, count: r.count }))
        };
      } catch (postErr) {
        console.error(`⚠️ Post Enrich Error (${post._id}):`, postErr);
        return { ...post, isLiked: false, reactionType: null, isSaved: false, reactionSummary: [] };
      }
    }));

    res.status(200).json({ 
      feed: enrichedPosts.filter(Boolean), 
      stories: Array.isArray(stories) ? stories : [] 
    });
  } catch (error: any) {
    console.error("❌ CRITICAL COMMUNITY FEED ERROR:", error);
    res.status(500).json({ success: false, message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
};

/**
 * REELS ARCHITECTURE
 * Returns only video/reel content for immersive vertical viewing
 */
export const getReels = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const posts = await Post.find({ postType: "REEL" })
      .sort({ createdAt: -1 })
      .populate("author", "name avatar jobTitle bio")
      .limit(10).lean();

    const enriched = await Promise.all(posts.map(async (p) => {
      const liked = await Like.exists({ postId: p._id, user: userId });
      return { ...p, isLiked: !!liked };
    }));

    res.status(200).json(enriched);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GLOBAL DISCOVERY SEARCH
 * Search for Nodes (Users) and Signals (Posts/Tags)
 */
export const searchCommunity = async (req: any, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [], posts: [] });

    const [users, posts] = await Promise.all([
      User.find({ 
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }).limit(5).select("name avatar role bio followers"),
      Post.find({ 
        $or: [
          { content: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } }
        ]
      }).limit(5).populate("author", "name avatar")
    ]);

    res.json({ users, posts });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const tenantId = req.user?.tenantId || "GLOBAL";
    const { content, file, type, tags = [], isReel = false, poll } = req.body; 

    let mediaUrl = null;
    let mediaType = "NONE";

    if (file && file.startsWith("data:")) {
      const isVideo = type === "VIDEO" || isReel;
      const uploadRes = await cloudinary.uploader.upload(file, {
        folder: `stockmaster/community/${tenantId}/posts`,
        resource_type: isVideo ? "video" : "image",
        transformation: isVideo ? [{ quality: "auto", fetch_format: "mp4" }] : [{ quality: "auto", fetch_format: "auto" }]
      });
      mediaUrl = uploadRes.secure_url;
      mediaType = isReel ? "REEL" : (isVideo ? "VIDEO" : "IMAGE");
    }

    const newPost = await Post.create({
      tenantId, author: userId, content: content || "", mediaUrl, mediaType,
      tags: Array.isArray(tags) ? tags : [],
      postType: mediaType === "NONE" ? (poll ? "SQUAD_UPDATE" : "TEXT") : mediaType,
      poll: poll ? {
        question: poll.question,
        options: poll.options.map((opt: string) => ({ text: opt, votes: [] })),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      } : undefined
    });

    await newPost.populate("author", "name avatar jobTitle role");
    res.status(201).json(newPost);
  } catch (error: any) {
    console.error("❌ POST_CREATION_FAILURE:", error);
    res.status(500).json({ message: error.message });
  }
};

export const votePoll = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { postId } = req.params;
    const { optionIndex } = req.body;

    const post = await Post.findById(postId);
    if (!post || !post.poll) return res.status(404).json({ message: "Poll not found" });

    // Remove existing vote from any option
    post.poll.options.forEach((opt: any) => {
      opt.votes = opt.votes.filter((uid: any) => uid.toString() !== userId.toString());
    });

    // Add new vote
    if (optionIndex !== undefined && post.poll.options[optionIndex]) {
      post.poll.options[optionIndex].votes.push(userId);
    }

    await post.save();
    res.json(post.poll);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleLike = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { postId } = req.params;
    const { type = "LIKE" } = req.body;

    const existingLike = await Like.findOne({ postId, user: userId });
    
    if (existingLike) {
      if (existingLike.type === type) {
        // Remove reaction (Decouple)
        await Like.deleteOne({ _id: existingLike._id });
        await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      } else {
        // Change frequency (Switch reaction)
        existingLike.type = type;
        await existingLike.save();
      }
    } else {
      // Establish resonance (New reaction)
      await Like.create({ postId, user: userId, type });
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
    }

    // High-Fidelity Recalculation
    const [likesCount, reactions] = await Promise.all([
      Like.countDocuments({ postId }),
      Like.aggregate([
        { $match: { postId: new mongoose.Types.ObjectId(postId) } },
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ])
    ]);

    const reactionSummary = reactions.map(r => ({ type: r._id, count: r.count }));
    const liked = await Like.exists({ postId, user: userId });

    res.status(200).json({ 
      liked: !!liked, 
      likesCount, 
      reactionType: liked ? type : null,
      reactionSummary 
    });
  } catch (error: any) { 
    res.status(500).json({ message: error.message }); 
  }
};

export const addComment = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { postId } = req.params;
    const { content, parentId } = req.body;

    const comment = await Comment.create({ postId, author: userId, content, parentId: parentId || null });
    if (parentId) await Comment.findByIdAndUpdate(parentId, { $inc: { repliesCount: 1 } });
    
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    await comment.populate("author", "name avatar");
    res.status(201).json(comment);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const viewStory = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { storyId } = req.params;
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    if (!story.viewers.includes(userId)) {
      story.viewers.push(userId);
      story.viewsCount = (story.viewsCount || 0) + 1;
      await story.save();
    }
    res.json({ success: true, views: story.viewsCount });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getComments = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const { parentId } = req.query;
    const userId = req.user?.id || req.user?._id;

    const query: any = { postId, parentId: parentId || null };
    const comments = await Comment.find(query).sort({ createdAt: 1 }).populate("author", "name avatar jobTitle");
    
    const enriched = comments.map((c: any) => ({
      ...c.toObject(),
      isLiked: c.likes?.some((uid: any) => uid.toString() === userId.toString()),
      likesCount: c.likes?.length || 0
    }));

    res.status(200).json(enriched);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const deletePost = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== userId.toString() && !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) return res.status(403).json({ message: "Deny" });

    await Promise.all([Like.deleteMany({ postId }), Comment.deleteMany({ postId }), Post.deleteOne({ _id: postId })]);
    res.json({ message: "Purged" });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const toggleSavePost = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Not found" });
    const isSaved = post.savedBy?.some((uid: any) => uid.toString() === userId.toString());
    await Post.findByIdAndUpdate(postId, isSaved ? { $pull: { savedBy: userId } } : { $addToSet: { savedBy: userId } });
    res.json({ saved: !isSaved });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const sharePost = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const p = await Post.findByIdAndUpdate(postId, { $inc: { sharesCount: 1 } }, { new: true });
    res.json({ sharesCount: p?.sharesCount });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const createStory = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const tenantId = req.user?.tenantId || "GLOBAL";
    const { file, type } = req.body;
    const isVideo = type === "VIDEO";

    const uploadRes = await cloudinary.uploader.upload(file, {
      folder: `stockmaster/community/${tenantId}/stories`,
      resource_type: isVideo ? "video" : "image",
      transformation: isVideo ? 
        [{ width: 720, height: 1280, crop: "fill", quality: "auto" }] : 
        [{ width: 1080, height: 1920, crop: "fill", quality: "auto" }]
    });

    const story = await Story.create({
      tenantId, author: userId, mediaUrl: uploadRes.secure_url, mediaType: isVideo ? "VIDEO" : "IMAGE"
    });
    await story.populate("author", "name avatar");
    res.status(201).json(story);
  } catch (error: any) {
    console.error("❌ STORY_CREATION_FAILURE:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const post = await Post.findByIdAndUpdate(postId, { content }, { new: true }).populate("author", "name avatar jobTitle role");
    res.json(post);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getUserPosts = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 }).populate("author", "name avatar jobTitle role");
    res.json(posts);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const toggleFollow = async (req: any, res: Response) => {
  try {
    const currentUserId = req.user?.id || req.user?._id;
    const { userId: targetUserId } = req.params;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: "Cannot couple with self node" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "Target node not found" });

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow (Decouple)
      await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
    } else {
      // Follow (Couple)
      await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });
    }

    res.json({ coupled: !isFollowing });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStoreInfo = async (req: any, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { Tenant } = require("../models/Tenant");
    const store = await Tenant.findOne({ slug: tenantId });
    if (!store) return res.status(404).json({ message: "Store lattice not found" });
    res.json(store);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleCommentLike = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Not found" });
    const isLiked = comment.likes?.some((uid: any) => uid.toString() === userId.toString());
    if (isLiked) comment.likes = comment.likes.filter((uid: any) => uid.toString() !== userId.toString());
    else comment.likes.push(userId);
    await comment.save();
    res.json({ liked: !isLiked, likesCount: comment.likes.length });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const deleteComment = async (req: any, res: Response) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (comment) {
      await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });
      await Comment.deleteOne({ _id: commentId });
    }
    res.json({ message: "Deleted" });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};
