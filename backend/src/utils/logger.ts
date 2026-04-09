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

// Only use file logging in local development
if (!IS_VERCEL && !IS_PRODUCTION && process.env.NODE_ENV !== "test") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "logs/all.log" }),
  );
}

const Logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  levels,
  format,
  transports,
});

export default Logger;
