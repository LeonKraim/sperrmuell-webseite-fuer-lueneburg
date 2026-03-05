import winston from "winston";
import config from "../config";
import fs from "fs";
import path from "path";

// Detect if running on Vercel or other serverless platform
// On Vercel, process.env.VERCEL is always set to "1"
const isServerless = 
  process.env.DISABLE_FILE_LOGGING === "true" ||
  !!process.env.VERCEL || 
  !!process.env.AWS_LAMBDA_FUNCTION_NAME;

// Ensure log directory exists (only on non-serverless platforms)
let logFileTransport: winston.transport | null = null;

if (!isServerless) {
  try {
    const logDir = path.dirname(config.logFilePath);
    // Double-check the directory is writable before creating transport
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    // Test write access
    const testFile = path.join(logDir, ".write-test");
    fs.writeFileSync(testFile, "test", { flag: "w" });
    fs.unlinkSync(testFile);
    
    logFileTransport = new winston.transports.File({
      filename: config.logFilePath,
      maxsize: config.logMaxSizeMb * 1024 * 1024,
      maxFiles: config.logMaxFiles,
      tailable: true,
    });
  } catch (err) {
    // Silently fall back to console-only logging if file logging fails
    if (process.env.NODE_ENV !== "production") {
      console.warn("File logging unavailable, using console only", err);
    }
  }
}

const transports: winston.transport[] = [new winston.transports.Console()];
if (logFileTransport) {
  transports.push(logFileTransport);
}

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

export default logger;
