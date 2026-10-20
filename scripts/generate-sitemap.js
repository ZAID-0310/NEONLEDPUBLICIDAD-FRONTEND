const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.ledneonpublicidad.com"
).replace(/\/\$/, "");

const API_URL =
  process.env.NEXT_PUBLIC_API_URL_PROD || "https://back.ledneonpublicidad.com";

const OUTPUT_PATH = path.join(__dirname, "..", "public", "sitemap.xml");

const isStaging =
  process.env.APP_ENV === "staging" ||
  process.env.NEXT_PUBLIC_SITE_URL?.includes("staging");

if (isStaging) {
  console.log(
    "Entorno Staging detectado: Omitiendo generación de sitemap.xml.",
  );
  if (fs.existsSync(OUTPUT_PATH)) {
    fs.unlinkSync(OUTPUT_PATH);
    console.log(
      "🧹 sitemap.xml previo eliminado de public/ para entorno Staging.",
    );
  }
  process.exit(0);
}

// Páginas estáticas oficiales de Neon Led Publicidad
const STATIC_PAGES = [
  { loc: "/", priority: "1.00" },
  { loc: "/nosotros/", priority: "0.80" },
  { loc: "/productos/", priority: "0.80" },
  { loc: "/contacto/", priority: "0.80" },
  { loc: "/blog/", priority: "0.80" },
  { loc: "/reclamaciones/", priority: "0.80" },
  { loc: "/politica-privacidad/", priority: "0.80" },
  { loc: "/productos/letras-acrilico/", priority: "0.64" },
  { loc: "/productos/letras-doradas/", priority: "0.64" },
  { loc: "/productos/letreros-luminosos/", priority: "0.64" },
  { loc: "/productos/letras-neon/", priority: "0.64" },
  { loc: "/productos/neon-led/", priority: "0.64" },
  { loc: "/productos/impresion-vinilo/", priority: "0.64" },
  { loc: "/productos/menu-board/", priority: "0.64" },
  { loc: "/productos/letras-pintadas/", priority: "0.64" },
  { loc: "/productos/displays/", priority: "0.64" },
  { loc: "/productos/pantalla-led/", priority: "0.64" },
  { loc: "/productos/holografico/", priority: "0.64" },
  { loc: "/productos/pixel-led/", priority: "0.64" },
  { loc: "/productos/sillas-luminosas/", priority: "0.64" },
  { loc: "/productos/techos-led/", priority: "0.64" },
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          reject(
            new Error(
              `Request failed with status ${res.statusCode} for ${url}`,
            ),
          );
          return;
        }
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function getPublishedBlogUrls() {
  try {
    const cards = await fetchJson(`${API_URL}/api/cards_public`);
    if (!Array.isArray(cards)) return [];
    return cards
      .filter((c) => c.blog?.link && c.id_plantilla)
      .map((c) => ({
        loc: `/blog/plantilla${c.id_plantilla}/${c.blog.link}/`,
        lastmod: c.blog.fecha
          ? new Date(c.blog.fecha).toISOString()
          : undefined,
        priority: "0.70",
      }));
  } catch (e) {
    console.warn(
      "⚠️  No se pudo obtener /api/cards_public para el sitemap:",
      e.message,
    );
    return [];
  }
}

function buildXml(urls) {
  const now = new Date().toISOString();
  const entries = urls
    .map((u) => {
      const lastmod = u.lastmod || now;
      return `<url>\n  <loc>${SITE}${u.loc}</loc>\n  <lastmod>${lastmod}</lastmod>\n  <priority>${u.priority}</priority>\n</url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

async function main() {
  try {
    const blogUrls = await getPublishedBlogUrls();
    const allUrls = [...STATIC_PAGES, ...blogUrls];
    const xml = buildXml(allUrls);
    fs.writeFileSync(OUTPUT_PATH, xml, "utf8");
    console.log(`✅ sitemap.xml generado con éxito (${allUrls.length} URLs).`);
  } catch (error) {
    console.error("❌ Error al generar sitemap.xml:", error);
    process.exit(1);
  }
}

main();
