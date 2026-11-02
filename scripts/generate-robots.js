const fs = require("fs");
const path = require("path");

const isStaging =
  process.env.APP_ENV === "staging" ||
  process.env.NEXT_PUBLIC_SITE_URL?.includes("staging");

const outputPath = path.join(process.cwd(), "public", "robots.txt");

const stagingRobots = `# Staging - Bloqueo total para evitar indexacion accidental
User-agent: *
Disallow: /
`;

const productionRobots = `User-agent: *
Allow: /

Disallow: /dashboard/
Disallow: /dashboard*

Disallow: /login/
Disallow: /login*

Disallow: /*.json$
Disallow: /*.js$
Disallow: /*.env$
Disallow: /.env*
Disallow: /api/
Disallow: /admin/
Disallow: /node_modules/
Disallow: /src/
Disallow: /.next/
Disallow: /_next/
Disallow: /.git/
Disallow: /data/
Disallow: /edition/
Disallow: /header_footer/

Allow: /public/
Allow: /images/
Allow: /css/
Allow: /js/
Allow: /productos/
Allow: /servicios/
Allow: /contacto/
Allow: /blog/
Allow: /blog*

# Sitemap
Sitemap: https://ledneonpublicidad.com/sitemap.xml
`;

fs.writeFileSync(
  outputPath,
  isStaging ? stagingRobots : productionRobots,
  "utf-8",
);
console.log(
  `[robots.txt] Generado exitosamente para: ${isStaging ? "STAGING (Bloqueado)" : "PRODUCCIÓN (Permitido)"}`,
);
