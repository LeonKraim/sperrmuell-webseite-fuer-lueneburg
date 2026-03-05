"use client";

import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import config from "@/config";

interface LoadingBarProps {
  done: boolean;
}

NProgress.configure({ showSpinner: false });

export default function LoadingBar({ done }: LoadingBarProps) {
  useEffect(() => {
    // Inject color override
    const style = document.createElement("style");
    style.textContent = `
      #nprogress .bar { background: ${config.loadingBarColor} !important; height: ${config.loadingBarHeight} !important; }
      #nprogress .peg { box-shadow: 0 0 10px ${config.loadingBarColor}, 0 0 5px ${config.loadingBarColor} !important; }
    `;
    document.head.appendChild(style);
    NProgress.start();
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (done) {
      NProgress.done();
    }
  }, [done]);

  return null;
}
