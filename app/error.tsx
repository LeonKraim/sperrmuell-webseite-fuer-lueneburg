"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h2>Page Error</h2>
      <pre style={{ whiteSpace: "pre-wrap", color: "red" }}>
        {error.message}
      </pre>
      <pre style={{ whiteSpace: "pre-wrap", color: "#666", fontSize: 12 }}>
        {error.stack}
      </pre>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
