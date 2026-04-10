import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { Tenant } from "../models/Tenant";
import { AuthService } from "../services/auth.service";
import AuditLog from "../models/AuditLog";
import { loginSchema } from "../schemas/loginSchema";
import { v4 as uuidv4 } from "uuid";
import { NotificationService } from "../services/notification.service";
import { NotificationType } from "../models/Notification";
import { addMailJob } from "../jobs/sendMail.job";
import { emailTemplates } from "../services/mail.service";
import crypto from "crypto";
import { cloudinary } from "../config/cloudinary";

export class AuthController {
  // ... rest of class

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Pour des raisons de sécurité, on ne dit pas si l'email existe ou non
        return res.status(200).json({ success: true, message: "Si votre compte existe, un email de réinitialisation vous a été envoyé." });
      }

      // 1. Générer un token unique
      const resetToken = crypto.randomBytes(32).toString("hex");
      
      // 2. Sauvegarder dans la BDD (valable 1h)
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); 
      await user.save();

      // 3. Envoyer l'email via le Job Queue
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
      const template = emailTemplates.passwordReset(user.name, resetUrl);
      await addMailJob(user.email, template.subject, template.html);

      res.status(200).json({ success: true, message: "Email de réinitialisation envoyé." });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ success: false, message: "Le jeton est invalide ou a expiré." });
      }

      // Mettre à jour le mot de passe (le hachage est géré par le middleware pre-save)
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ success: true, message: "Mot de passe réinitialisé avec succès." });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // --- LOGIN LOGIC ---
  static login = async (req: Request, res: Response) => {
    console.log(`[Auth] 🛡️ LOGIN_SEQUENCE_INITIATED for: ${req.body?.email}`);
    try {
      // 1. Validation du format des données
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        console.warn("[Auth] ❌ Validation failed:", validation.error.format());
        return res.status(400).json({
          success: false,
          message: "Format invalide",
          errors: validation.error.format(),
        });
      }

      const { email, password } = validation.data;
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`[Auth] 🔍 Searching for user: ${normalizedEmail}`);

      // 2. Recherche de l'utilisateur (on force l'inclusion du password)
      const user = await User.findOne({ email: normalizedEmail }).select(
        "+password",
      );

      if (!user) {
        console.log(`[Auth] ❌ Utilisateur non trouvé : ${normalizedEmail}`);
        return res
          .status(401)
          .json({ success: false, message: "Identifiants invalides" });
      }

      console.log(`[Auth] 👤 User found: ${user.email} (ID: ${user._id})`);

      // 3. Vérification du mot de passe
      console.log("[Auth] 🔑 Verifying password...");
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (bcryptErr: any) {
        console.error("[Auth] 💥 Bcrypt comparison error:", bcryptErr.message);
        throw new Error(`Bcrypt error: ${bcryptErr.message}`);
      }

      // logic Auto-Fix : Si le mot de passe est en clair (non haché), on le hache proprement
      if (!isMatch && password === user.password) {
        console.log(
          `[Auth] 🛠️ Migration du mot de passe en clair vers Hash pour : ${user.email}`,
        );
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        isMatch = true;
      }

      if (!isMatch) {
        console.log(`[Auth] ❌ Mot de passe incorrect pour : ${normalizedEmail}`);
        await AuditLog.create({
          tenantId: user.tenantId,
          userId: user._id,
          action: "LOGIN_FAILED",
          details: `Tentative échouée: ${normalizedEmail}`,
        }).catch(err => console.error("[Auth] AuditLog failed:", err.message));
        
        return res
          .status(401)
          .json({ success: false, message: "Identifiants invalides" });
      }

      console.log("[Auth] ✅ Password matched. Generating token...");

      // 4. Succès : Mise à jour du Last Login et Génération du Token
      user.lastLogin = new Date();
      await user.save().catch(err => console.error("[Auth] User save failed:", err.message));

      let token;
      try {
        token = AuthService.generateToken(user);
        console.log("[Auth] 🎫 Token generated successfully");
      } catch (tokenErr: any) {
        console.error("[Auth] 💥 Token generation error:", tokenErr.message);
        throw new Error(`Token generation failed: ${tokenErr.message}`);
      }

      await AuditLog.create({
        tenantId: user.tenantId,
        userId: user._id,
        action: "LOGIN_SUCCESS",
        details: "Connexion réussie",
      }).catch(err => console.error("[Auth] AuditLog Success failed:", err.message));

      console.log(
        `[Auth] 🚀 LOGIN_COMPLETE : ${user.email} (Role: ${user.role})`,
      );

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role.toUpperCase(), // On force la majuscule pour les permissions
          tenantId: user.tenantId,
        },
      });
    } catch (error: any) {
      console.error("❌ CRITICAL LOGIN ERROR:", error);
      return res
        .status(500)
        .json({ 
          success: false, 
          message: "Erreur serveur", 
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
  };

  // --- REGISTER LOGIC ---
  static register = async (req: Request, res: Response) => {
    try {
      console.log("[Auth] Register request received:", req.body);
      const { name, email, password, role, phone } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: "Données manquantes (nom, email ou mot de passe)" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // 1. Vérification d'existence
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        console.warn(`[Auth] Registration failed: Email ${normalizedEmail} already exists.`);
        return res
          .status(400)
          .json({ success: false, message: "Cet email est déjà utilisé" });
      }

      // 2. Attribution du Role et du Tenant
      const userRole = role?.toUpperCase() || "USER";

      // Si c'est un VENDOR ou un ADMIN, on crée un nouveau Tenant unique
      // Si c'est un USER simple, il appartient à la plateforme principale
      const userTenantId =
        userRole === "VENDOR" || userRole === "ADMIN"
          ? `TENANT-${uuidv4().slice(0, 8).toUpperCase()}`
          : "MAIN-PLATFORM";

      // 3. Création de l'utilisateur (le hashing est normalement géré par le middleware .pre('save') du modèle User)
      const user = await User.create({
        name,
        email: normalizedEmail,
        password, // Assure-toi que ton model User hache le mot de passe avant de sauvegarder
        phone,
        role: userRole,
        tenantId: userTenantId,
        isActive: true,
      });

      // 4. Création du document Tenant si c'est un nouveau store
      if (userRole === "VENDOR" || userRole === "ADMIN") {
        await Tenant.create({
          name: `${name}'s Store`,
          slug: userTenantId,
        });
      }

      const token = AuthService.generateToken(user);

      await AuditLog.create({
        tenantId: userTenantId,
        userId: user._id,
        action: "USER_REGISTERED",
        details: `Nouveau compte créé : ${userRole}`,
      });

      // 🆕 NOTIFY: Welcome Notification
      await NotificationService.createNotification({
        userId: user._id,
        tenantId: userTenantId,
        title: "Bienvenue sur StockMaster!",
        message: "Votre infrastructure est prête. Commencez par configurer votre catalogue.",
        type: NotificationType.SUCCESS
      });

      // 🆕 EMAIL: Welcome Email
      const template = emailTemplates.welcome(name);
      await addMailJob(email, template.subject, template.html);

      res.status(201).json({
        success: true,
        message: "Inscription réussie",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
      });
    } catch (error: any) {
      console.error("❌ Register Error:", error);
      
      // Handle Mongoose Validation Errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
      }

      // Handle Duplicate Key Errors (e.g., unique email)
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: "Cet email ou cet identifiant est déjà utilisé." });
      }

      res
        .status(500)
        .json({ success: false, message: "Erreur lors de l'inscription" });
    }
  };

  static getProfile = async (req: any, res: Response) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static updateProfile = async (req: any, res: Response) => {
    try {
      const { name, phone, avatar, bio, jobTitle } = req.body;
      const userId = req.user?.id || req.user?._id;

      if (!userId) return res.status(401).json({ success: false, message: "Utilisateur non identifié" });

      let updateData: any = { name, phone, bio, jobTitle };

      // Handle Avatar Upload to Cloudinary
      if (avatar && avatar.startsWith("data:image")) {
        console.log(`[Auth] Uploading profile avatar for user ${userId}...`);
        try {
          const uploadRes = await cloudinary.uploader.upload(avatar, {
            folder: "stockmaster_avatars",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" }
            ]
          });
          updateData.avatar = uploadRes.secure_url;
          console.log(`[Auth] Avatar uploaded: ${updateData.avatar}`);
        } catch (uploadErr: any) {
          console.error("[Auth] Cloudinary avatar upload failed:", uploadErr.message);
        }
      } else if (avatar === "") {
        updateData.avatar = "";
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true },
      );

      if (!user) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          tenantId: user.tenantId,
          avatar: user.avatar,
          bio: user.bio,
          jobTitle: user.jobTitle
        },
      });
    } catch (error: any) {
      console.error("❌ Update Profile Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static changePassword = async (req: any, res: Response) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId).select("+password");
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Ancien mot de passe incorrect" });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.status(200).json({ success: true, message: "Mot de passe mis à jour avec succès" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
