import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      select: false, // لا يظهر في الاستعلامات العادية للحماية
    },
    phone: {
      type: String,
      required: false, // اختياري للزبناء، مهم للبائعين
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      default: "Collaborateur",
    },
    bio: {
      type: String,
      maxlength: 200,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      language: { type: String, default: "fr" },
      notifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "VENDOR", "USER"],
      default: "USER",
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
    // لإضافة الحقول الافتراضية عند التحويل لـ JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index({ email: 1, tenantId: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
