import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
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
    content: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ["IMAGE", "VIDEO", "REEL", "NONE"],
      default: "NONE",
    },
    postType: {
      type: String,
      enum: ["TEXT", "IMAGE", "VIDEO", "REEL", "ASSET_ALERT", "MILESTONE", "SQUAD_UPDATE"],
      default: "TEXT",
    },
    metadata: {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      yieldValue: { type: Number },
    },
    tags: [{
      type: String,
      trim: true
    }],
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    sharesCount: {
      type: Number,
      default: 0
    },
    savedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    poll: {
      question: String,
      options: [{
        text: String,
        votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
      }],
      expiresAt: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour la recherche rapide dans le feed
postSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.models.Post || mongoose.model("Post", postSchema);
