async function sendToServer(level: string, message: string, stack?: string) {
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level,
        message,
        stack,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Silently fail — don't loop on logging errors
  }
}

export const clientLogger = {
  log: (...args: unknown[]) => {
    console.log(...args);
  },
  info: (message: string, extra?: Record<string, unknown>) => {
    const full = extra ? `${message} ${JSON.stringify(extra)}` : message;
    console.info(full);
    sendToServer("info", full);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (message: string, error?: Error) => {
    console.error(message, error);
    sendToServer("error", message, error?.stack);
  },
};
