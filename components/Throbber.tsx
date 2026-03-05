"use client";

interface ThrobberProps {
  visible: boolean;
}

export default function Throbber({ visible }: ThrobberProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 transition-opacity duration-300"
      aria-label="Loading"
      role="status"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-500" />
    </div>
  );
}
