import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/** @type {(phase: string) => import('next').NextConfig} */
export default (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    ...(isDev ? {} : { output: "export" }),
    poweredByHeader: false,
    images: {
      unoptimized: true,
      formats: ["image/webp"],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**.githubusercontent.com",
        },
        {
          protocol: "https",
          hostname: "ui-avatars.com",
        },
        {
          protocol: "https",
          hostname: "avatars.google.com",
        },
        {
          protocol: "https",
          hostname: "images.unsplash.com",
        },
      ],
    },
    trailingSlash: true,
    experimental: {
      optimizeCss: true,
    },
  };
};
