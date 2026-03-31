import { ENV } from "./env";

export interface MailConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
}

export const mailConfig: MailConfig = {
  host: ENV.MAIL_HOST || "localhost",
  port: Number(ENV.MAIL_PORT) || 587,
  user: ENV.MAIL_USER,
  pass: ENV.MAIL_PASS,
  from: process.env.MAIL_FROM || '"StockMaster Pro" <no-reply@stockmaster.com>',
};
