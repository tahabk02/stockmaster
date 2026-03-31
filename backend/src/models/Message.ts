import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: false,
      index: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String, // Texte
      default: "",
    },
    mediaUrl: {
      type: String, // Photo/Vidéo/Fichier
      default: null,
    },
    mediaType: {
      type: String,
      enum: ["TEXT", "IMAGE", "VIDEO", "FILE", "AUDIO", "CALL"],
      default: "TEXT",
    },
    metadata: {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String,
      }
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
