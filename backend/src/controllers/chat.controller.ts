import { Request, Response } from "express";
import mongoose from "mongoose";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import User from "../models/User";
import { cloudinary } from "../config/cloudinary";
import { AIService } from "../services/ai.service";

// ID réservé pour Liya l'IA (On utilise un ID constant simulé)
export const LIYA_ID = "000000000000000000000000";

// Récupérer les conversations (Globales - sans filtre tenantId)
export const getConversations = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({ 
      participants: userId 
    })
    .populate("participants", "name avatar jobTitle role email tenantId followers following")
    .populate("lastMessage")
    .sort({ updatedAt: -1 })
    .lean();

    // Calculer les messages non lus pour chaque conversation
    const conversationsWithUnread = await Promise.all(conversations.map(async (conv: any) => {
      try {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: userId },
          readBy: { $ne: userId }
        });
        
        // Logic: Get other participant for status HUD
        let other = conv.participants.find((p: any) => p._id.toString() !== userId.toString());
        
        // Si c'est une conversation avec Liya (virtuelle)
        if (!other && conv.participants.some((p: any) => p._id.toString() === LIYA_ID)) {
          other = {
            _id: LIYA_ID,
            name: "Liya Intelligence",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Liya",
            role: "AI",
            jobTitle: "Neural Assistant"
          };
        }

        return { 
          ...conv, 
          unreadCount,
          otherParticipant: other 
        };
      } catch (err) {
        return { ...conv, unreadCount: 0 };
      }
    }));

    res.status(200).json(conversationsWithUnread);
  } catch (error: any) {
    console.error("getConversations Error:", error);
    res.status(500).json({ message: "Erreur chargement conversations", detail: error.message });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "ID de conversation invalide" });
    }

    await Message.updateMany(
      { 
        conversationId: new mongoose.Types.ObjectId(conversationId), 
        sender: { $ne: userId }, 
        readBy: { $ne: userId } 
      },
      { $addToSet: { readBy: userId } }
    );

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("markAsRead Error:", error);
    res.status(500).json({ message: "Erreur marquage lecture", detail: error.message });
  }
};

// Créer ou récupérer une conversation existante
export const createConversation = async (req: any, res: Response) => {
  try {
    const { id, tenantId } = req.user as any;
    const { participantId } = req.body;

    if (!participantId) return res.status(400).json({ message: "Participant manquant" });

    // Cas spécial Liya
    if (participantId === LIYA_ID) {
      let conversation = await Conversation.findOne({
        participants: { $all: [id, LIYA_ID] }
      });
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [id, LIYA_ID],
          tenantId
        });
      }
      return res.status(200).json({
        ...conversation.toObject(),
        otherParticipant: {
          _id: LIYA_ID,
          name: "Liya Intelligence",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Liya",
          role: "AI"
        }
      });
    }

    // Chercher une conversation existante entre ces deux-là
    let conversation = await Conversation.findOne({
      participants: { $all: [id, participantId] }
    }).populate("participants", "name avatar jobTitle role email");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [id, participantId],
        tenantId
      });
      // Important: Repopulate après création
      conversation = await Conversation.findById(conversation._id).populate("participants", "name avatar jobTitle role email");
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Erreur création conversation", error });
  }
};

export const createGroup = async (req: any, res: Response) => {
  try {
    const { id, tenantId } = req.user as any;
    const { name, description, participants, avatar } = req.body;

    if (!name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ message: "Données de groupe invalides" });
    }

    const conversation = await Conversation.create({
      tenantId,
      name,
      description,
      avatar,
      isGroup: true,
      participants: [...new Set([...participants, id])],
      admins: [id]
    });

    const populated = await Conversation.findById(conversation._id)
      .populate("participants", "name avatar jobTitle role")
      .populate("admins", "name avatar");

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur création groupe", error: error.message });
  }
};

export const getMessages = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("sender", "name avatar jobTitle role");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Erreur chargement messages", error });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  try {
    const { id, tenantId } = req.user as any;
    const { conversationId, content, file, type } = req.body;

    let mediaUrl = null;
    let mediaType = type || "TEXT";

    if (file && file.startsWith("data:")) {
      const uploadRes = await cloudinary.uploader.upload(file, {
        folder: `chat_media_${tenantId}`,
        resource_type: "auto",
      });
      mediaUrl = uploadRes.secure_url;
      if (!type) {
        if (file.includes("audio")) mediaType = "AUDIO";
        else mediaType = "IMAGE";
      }
    }

    const newMessage = await Message.create({
      conversationId,
      tenantId,
      sender: id,
      content,
      mediaType,
      mediaUrl
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: new Date()
    });

    await newMessage.populate("sender", "name avatar role");

    // --- LIYA AI ENGINE INTERCEPTION ---
    const conversation = await Conversation.findById(conversationId);
    if (conversation && conversation.participants.some((p: any) => p.toString() === LIYA_ID)) {
      // Si c'est une conversation avec Liya, elle répond automatiquement
      setTimeout(async () => {
        try {
          const aiResponse = await AIService.processChatQuery(tenantId, content || "Analyse mon stock");
          
          const aiMessage = await Message.create({
            conversationId,
            tenantId,
            sender: LIYA_ID,
            content: aiResponse,
            mediaType: "TEXT"
          });

          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: aiMessage._id,
            updatedAt: new Date()
          });
          
          // Note: In real app, we would emit this via Socket.io here if we had access to IO instance
        } catch (aiErr) {
          console.error("Liya Response Error:", aiErr);
        }
      }, 1000);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Chat Send Error:", error);
    res.status(500).json({ message: "Erreur envoi message", error });
  }
};

export const toggleReaction = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message introuvable" });

    const existingReactionIndex = message.reactions.findIndex(
      (r: any) => r.userId.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();
    res.status(200).json(message.reactions);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur réaction", error: error.message });
  }
};

export const deleteMessage = async (req: any, res: Response) => {
  try {
    const { id, role } = req.user as any;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message introuvable" });

    // Seul l'expéditeur ou un admin peut supprimer
    if (message.sender.toString() !== id && !["ADMIN", "SUPER_ADMIN"].includes(role)) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const conversationId = message.conversationId;
    await Message.deleteOne({ _id: messageId });

    // Mettre à jour le dernier message de la conversation si nécessaire
    const lastMsg = await Message.findOne({ conversationId }).sort({ createdAt: -1 });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: lastMsg ? lastMsg._id : null
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Erreur suppression", error });
  }
};

export const logCall = async (req: any, res: Response) => {
  try {
    const { id } = req.user as any;
    const { participantId, callType, duration, status } = req.body;

    // 1. Trouver ou créer la conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [id, participantId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [id, participantId],
        tenantId: (req.user as any).tenantId
      });
    }

    // 2. Créer le message de type CALL
    const content = status === 'MISSED' 
      ? `Appel ${callType === 'VIDEO' ? 'vidéo' : 'vocal'} manqué`
      : `Appel ${callType === 'VIDEO' ? 'vidéo' : 'vocal'} terminé (${duration})`;

    const newMessage = await Message.create({
      conversationId: conversation._id,
      tenantId: (req.user as any).tenantId,
      sender: id,
      content,
      mediaType: "CALL"
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: newMessage._id,
      updatedAt: new Date()
    });

        res.status(201).json(newMessage);
      } catch (error) {
        res.status(500).json({ message: "Erreur log appel", error });
      }
    };
    
    export const getGlobalMessages = async (req: any, res: Response) => {
      try {
        const { tenantId } = req.user;
        const messages = await Message.find({ tenantId, conversationId: { $exists: false } })
          .sort({ createdAt: 1 })
          .populate("sender", "name avatar jobTitle role");
    
        res.status(200).json({ success: true, data: messages });
      } catch (error: any) {
        res.status(500).json({ message: "Erreur chargement messages globaux", error: error.message });
      }
    };
    
    export const sendGlobalMessage = async (req: any, res: Response) => {
      try {
        const { id, tenantId } = req.user;
        const { content } = req.body;
    
        const newMessage = await Message.create({
          tenantId,
          sender: id,
          content,
          mediaType: "TEXT"
        });
    
        await newMessage.populate("sender", "name avatar role");
    
        res.status(201).json({ success: true, data: newMessage });
      } catch (error: any) {
        res.status(500).json({ message: "Erreur envoi message global", error: error.message });
      }
    };
    