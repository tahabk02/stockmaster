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

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

const Logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  levels,
  format,
  transports,
});

if (IS_VERCEL) {
  console.log("🚀 StockMaster Pro: Production Shield Active");
}

export default Logger;
