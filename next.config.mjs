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
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagservices.com"
                : "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagservices.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://*.tile.openstreetmap.org",
              "connect-src 'self'",
              "frame-src https://googleads.g.doubleclick.net",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
