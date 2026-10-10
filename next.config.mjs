/ @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    unoptimized: true,
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: ".githubusercontent.com",
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
    async redirects() {
        return [
            {
                source: '/blog/letras-acrilicas-3d-moda',
                destination: '/productos/letras-acrilico',
                permanent: true,
            },
            {
                source: '/blog/cafeterias-con-estilo',
                destination: '/productos/menu-board',
                permanent: true,
            },
            {
                source: '/blog/techos-led-para-gimnasios',
                destination: '/productos/techos-led',
                permanent: true,
            },
            {
                source: '/blog/neon-led-para-bares-modernos',
                destination: '/productos/neon-led',
                permanent: true,
            },
            {
                source: '/blog/pantallas-led-para-locales',
                destination: '/productos/pantalla-led',
                permanent: true,
            },
            {
                source: '/blog/led-pixel-para-discotecas',
                destination: '/productos/pixel-led',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;