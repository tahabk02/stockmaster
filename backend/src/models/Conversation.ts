import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isGroup: { type: Boolean, default: false },
    name: { type: String, default: null }, // Nom du groupe
    description: { type: String, default: null },
    avatar: { type: String, default: null },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    updatedAt: { type: Date, default: Date.now }, // Pour trier par conversation récente
  },
  {
    timestamps: true,
  }
);

// Index pour trouver rapidement les conversations d'un utilisateur
conversationSchema.index({ participants: 1, updatedAt: -1 });

export default mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
