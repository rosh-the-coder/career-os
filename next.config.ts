import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PDFKit loads AFM font metrics from disk — must stay external to the bundle
  serverExternalPackages: ["pdfkit"],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
