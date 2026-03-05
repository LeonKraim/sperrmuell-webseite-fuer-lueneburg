"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body style={{ padding: 40, fontFamily: "monospace" }}>
        <h2>Something went wrong</h2>
        <pre style={{ whiteSpace: "pre-wrap", color: "red" }}>
          {error.message}
        </pre>
        <pre style={{ whiteSpace: "pre-wrap", color: "#666", fontSize: 12 }}>
          {error.stack}
        </pre>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
