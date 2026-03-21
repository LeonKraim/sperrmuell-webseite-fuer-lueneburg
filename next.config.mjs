/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ["192.168.31.251"],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Dev mode uses eval-source-map which requires 'unsafe-eval'
              isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagservices.com https://va.vercel-scripts.com https://vercel.live https://www.googletagmanager.com"
                : "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagservices.com https://va.vercel-scripts.com https://vercel.live https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://*.tile.openstreetmap.org",
              "connect-src 'self' https://vitals.vercel-insights.com https://www.googletagmanager.com",
              "frame-src https://googleads.g.doubleclick.net https://vercel.live",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), microphone=(), camera=()",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/public/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache images
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=432000",
          },
        ],
      },
      // Cache Web App Manifest and icons
      {
        source: "/(manifest.json|robots.txt|sitemap.xml|favicon.ico|icon-.*\\.png|google.*\\.html)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
