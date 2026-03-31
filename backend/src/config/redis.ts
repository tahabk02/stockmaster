import { ConnectionOptions } from "bullmq";
import { ENV } from "./env";

export const redisConfig: ConnectionOptions = {
  host: "127.0.0.1",
  port: 6379,
  // إلا كان عندك password زيدو هنا
};
