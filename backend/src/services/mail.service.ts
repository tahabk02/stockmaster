import nodemailer from "nodemailer";
import { mailConfig } from "../config/mail";

// Create Transporter using config
const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  auth: {
    user: mailConfig.user,
    pass: mailConfig.pass,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  // Graceful handling for development when no credentials are provided
  if (!mailConfig.user || !mailConfig.pass) {
    console.warn(`[Mail Service] ⚠️ Missing SMTP credentials. Skipping email delivery to ${to}.`);
    console.warn(`[Mail Service] Subject: ${subject}`);
    return { messageId: "skipped-no-credentials" };
  }

  try {
    const info = await transporter.sendMail({
      from: mailConfig.from,
      to,
      subject,
      html,
    });
    console.log(`[Mail Service] Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("[Mail Service] Error sending email:", error);
    throw error;
  }
};

/**
 * Enhanced Email Templates (Hardened Oracle Design)
 */
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: `Bienvenue sur StockMaster Pro, ${name}!`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="background: #4f46e5; width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-center; margin: auto; color: white; font-weight: 900; font-size: 32px; line-height: 64px;">S</div>
          <h1 style="font-size: 24px; font-weight: 900; margin-top: 20px; text-transform: uppercase; letter-spacing: -0.05em;">StockMaster. <span style="color: #4f46e5;">Cloud</span></h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">Bonjour <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">Votre compte administrateur a été provisionné avec succès sur notre infrastructure Cloud.</p>
        <div style="background: #f8fafc; padding: 24px; border-radius: 16px; margin: 32px 0; border-left: 4px solid #4f46e5;">
          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.1em;">Statut du Système</p>
          <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 900; color: #10b981;">ACTIF & OPÉRATIONNEL</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">Vous pouvez maintenant accéder à votre tableau de bord BI pour piloter vos flux logistiques.</p>
        <div style="text-align: center; margin-top: 40px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background: #1e293b; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">Accéder au Dashboard</a>
        </div>
        <hr style="margin: 40px 0; border: 0; border-top: 1px solid #f1f5f9;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 StockMaster Global Inc. Infrastructure Sécurisée.</p>
      </div>
    `
  }),
  passwordReset: (name: string, resetUrl: string) => ({
    subject: "Réinitialisation de votre mot de passe - StockMaster Pro",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="background: #4f46e5; width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-center; margin: auto; color: white; font-weight: 900; font-size: 32px; line-height: 64px;">S</div>
          <h1 style="font-size: 24px; font-weight: 900; margin-top: 20px; text-transform: uppercase; letter-spacing: -0.05em;">StockMaster. <span style="color: #4f46e5;">Security</span></h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">Bonjour <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le bouton ci-dessous pour procéder. Ce lien est valable pendant 1 heure.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">Réinitialiser mon mot de passe</a>
        </div>
        <p style="font-size: 14px; color: #64748b; text-align: center;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
        <hr style="margin: 40px 0; border: 0; border-top: 1px solid #f1f5f9;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 StockMaster Global Inc. Sécurité des données.</p>
      </div>
    `
  }),
  lowStockAlert: (productName: string, currentQty: number) => ({
    subject: `ALERTE CRITIQUE : Stock Bas pour ${productName}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; border: 1px solid #fee2e2; border-radius: 24px; padding: 40px; color: #1e293b;">
        <h2 style="color: #ef4444; text-transform: uppercase; font-weight: 900; letter-spacing: -0.02em;">Alerte de Rupture Immédiate</h2>
        <p style="font-size: 16px;">Le produit suivant a atteint un seuil de sécurité critique :</p>
        <div style="background: #fef2f2; padding: 24px; border-radius: 16px; margin: 24px 0; border: 1px solid #fecaca;">
          <p style="margin: 0; font-size: 18px; font-weight: 900;">${productName}</p>
          <p style="margin: 8px 0 0 0; color: #ef4444; font-weight: 700;">Quantité restante : ${currentQty} unités</p>
        </div>
        <p style="font-size: 14px; color: #64748b;">Veuillez passer une commande de réapprovisionnement auprès de vos fournisseurs certifiés.</p>
      </div>
    `
  })
};
