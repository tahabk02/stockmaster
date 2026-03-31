import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["IMAGE", "VIDEO"],
      default: "IMAGE",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // +24 heures
    },
    viewers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    viewsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

// Index TTL : MongoDB supprimera automatiquement le document quand expiresAt est atteint
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Story || mongoose.model("Story", storySchema);
