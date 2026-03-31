import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"],
      default: "LIKE",
    }
  },
  {
    timestamps: true,
  }
);

// Un utilisateur ne peut liker un post qu'une seule fois
likeSchema.index({ postId: 1, user: 1 }, { unique: true });

export default mongoose.models.Like || mongoose.model("Like", likeSchema);
