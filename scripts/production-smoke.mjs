const baseUrl = new URL(process.env.TEST_BASE_URL || "http://127.0.0.1:3400");

const publicHtmlRoutes = [
  "/",
  "/prikolice",
  "/vesta",
  "/trigano",
  "/kontakt",
  "/prikolice/vesta-light-23",
];

const failures = [];
const checked = new Set();

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

async function request(path, options) {
  const response = await fetch(new URL(path, baseUrl), {
    redirect: "manual",
    ...options,
  });
  return { response, body: await response.text() };
}

function getAttribute(tag, attribute) {
  return tag.match(new RegExp(`${attribute}=["']([^"']+)["']`, "i"))?.[1];
}

function inspectHtml(path, html) {
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta[^>]+name=["']description["'][^>]*>/i)?.[0];
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0];
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  assert(Boolean(title), `${path}: nema title`);
  assert(!title?.includes("| Povuci.rs | Povuci.rs"), `${path}: dupliran naziv sajta u title`);
  assert(Boolean(description && getAttribute(description, "content")), `${path}: nema meta description`);
  assert(Boolean(canonical && getAttribute(canonical, "href")), `${path}: nema canonical URL`);
  assert(getAttribute(canonical || "", "href")?.startsWith("https://povuci.rs"), `${path}: canonical nije na produkcijskom domenu`);
  assert(h1Count === 1, `${path}: očekivan je tačno jedan H1, pronađeno ${h1Count}`);
  assert(!html.includes("placeholder.supabase.co"), `${path}: placeholder Supabase URL je završio u HTML-u`);

  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [, jsonLd] of jsonLdBlocks) {
    try {
      JSON.parse(jsonLd);
    } catch {
      fail(`${path}: pronađen neispravan JSON-LD`);
    }
  }
}

for (const path of publicHtmlRoutes) {
  const { response, body } = await request(path);
  checked.add(path);
  assert(response.status === 200, `${path}: očekivan 200, dobijen ${response.status}`);
  if (response.status === 200) inspectHtml(path, body);
}

const admin = await request("/admin/login");
assert(admin.response.status === 200, `/admin/login: očekivan 200, dobijen ${admin.response.status}`);
assert(/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(admin.body), "/admin/login: nedostaje noindex");

const unauthorizedCreate = await request("/api/admin/trailers/create", {
  method: "POST",
  body: new FormData(),
});
assert(unauthorizedCreate.response.status === 401, `/api/admin/trailers/create: očekivan 401 bez sesije, dobijen ${unauthorizedCreate.response.status}`);

const robots = await request("/robots.txt");
assert(robots.response.status === 200, `/robots.txt: dobijen ${robots.response.status}`);
assert(robots.body.includes("Disallow: /admin"), "/robots.txt: /admin nije blokiran");
assert(robots.body.includes("Disallow: /api"), "/robots.txt: /api nije blokiran");
assert(robots.body.includes("Sitemap: https://povuci.rs/sitemap.xml"), "/robots.txt: nedostaje produkcijski sitemap");

const sitemap = await request("/sitemap.xml");
assert(sitemap.response.status === 200, `/sitemap.xml: dobijen ${sitemap.response.status}`);
const sitemapLocations = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert(sitemapLocations.length >= 60, `/sitemap.xml: očekivano najmanje 60 URL-ova, pronađeno ${sitemapLocations.length}`);
assert(sitemapLocations.every((url) => url.startsWith("https://povuci.rs/")), "/sitemap.xml: pronađen URL van produkcijskog domena");
assert(sitemapLocations.every((url) => !url.includes("/admin") && !url.includes("/api/")), "/sitemap.xml: pronađena interna ruta");

const manifest = await request("/manifest.webmanifest");
assert(manifest.response.status === 200, `/manifest.webmanifest: dobijen ${manifest.response.status}`);
try {
  const parsedManifest = JSON.parse(manifest.body);
  assert(parsedManifest.lang === "sr-Latn", "/manifest.webmanifest: pogrešan jezik");
  assert(Array.isArray(parsedManifest.icons) && parsedManifest.icons.length > 0, "/manifest.webmanifest: nedostaju ikone");
} catch {
  fail("/manifest.webmanifest: odgovor nije validan JSON");
}

const missing = await request("/__smoke-test-ne-postoji");
assert(missing.response.status === 404, `nepostojeća ruta: očekivan 404, dobijen ${missing.response.status}`);
assert(/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(missing.body), "404 stranica: nedostaje noindex");

for (const sourcePath of ["/", "/prikolice", "/vesta", "/trigano", "/kontakt"]) {
  const { body } = await request(sourcePath);
  const links = [...body.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const href of links) {
    const url = new URL(href, baseUrl);
    if (url.origin !== baseUrl.origin || !url.pathname.startsWith("/") || url.pathname.startsWith("/admin")) continue;
    const path = `${url.pathname}${url.search}`;
    if (checked.has(path)) continue;
    checked.add(path);
    const { response } = await request(path);
    assert(response.status < 400, `${sourcePath} -> ${path}: interni link vraća ${response.status}`);
  }
}

if (failures.length) {
  console.error(`Smoke test nije prošao (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Smoke test je prošao: ${checked.size} internih ruta, ${sitemapLocations.length} sitemap URL-ova i admin/API zaštita.`);
