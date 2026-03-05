import winston from "winston";
import config from "../config";
import fs from "fs";
import path from "path";

// Ensure log directory exists
const logDir = path.dirname(config.logFilePath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: config.logFilePath,
      maxsize: config.logMaxSizeMb * 1024 * 1024,
      maxFiles: config.logMaxFiles,
      tailable: true,
    }),
  ],
});

export default logger;
