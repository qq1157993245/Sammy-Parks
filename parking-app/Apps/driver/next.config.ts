// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  basePath: "/driver",
  devIndicators: false,

  /** NEW — forward bare /api/auth/* to the real location */
//   async rewrites() {
//     return [
//       {
//         source: "/api/auth/:path*",
//         destination: "/driver/api/auth/:path*",
//       },
//     ];
//   },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

