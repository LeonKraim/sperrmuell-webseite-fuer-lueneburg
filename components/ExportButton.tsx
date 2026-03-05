"use client";

import { useState } from "react";
import { Download, ChevronDown, Loader2 } from "lucide-react";
import config from "@/config";

export default function ExportButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setOpen(false);
    setLoading(true);
    showToast("Download started");
    try {
      window.location.href = `/api/export?format=${format}`;
      setTimeout(() => setLoading(false), 2000);
    } catch {
      showToast("Export failed");
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="absolute top-3 right-3 z-[1000]">
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium shadow-md hover:bg-gray-50 disabled:opacity-60"
          aria-label="Export data"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export
          <ChevronDown className="h-3 w-3" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-36 rounded-lg bg-white shadow-lg ring-1 ring-black/5">
            {config.exportFormats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                className="block w-full px-4 py-2 text-left text-sm uppercase hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="absolute right-0 top-full mt-2 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
