import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const IS_VERCEL = !!process.env.VERCEL || !!process.env.VERCEL_ENV;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

// Completely disable file logging for Vercel and Production to avoid ENOENT errors
if (!IS_VERCEL && !IS_PRODUCTION && process.env.NODE_ENV !== "test") {
  try {
    transports.push(
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
      }),
      new winston.transports.File({ filename: "logs/all.log" }),
    );
  } catch (e) {
    console.warn("⚠️ Failed to initialize file logging, falling back to console only.");
  }
}

const Logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  levels,
  format,
  transports,
});

if (IS_VERCEL) {
  Logger.info("🚀 PROTOCOL 9.2: Stateless Neural Core Active (No-Log-Dir Mode)");
}

export default Logger;
