import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PDFKit loads AFM font metrics from disk — must stay external to the bundle
  serverExternalPackages: ["pdfkit", "unpdf"],
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
