const baseUrl = new URL(process.env.TEST_BASE_URL || "http://127.0.0.1:3400");

const publicHtmlRoutes = [
  "/",
  "/prikolice",
  "/vesta",
  "/trigano",
  "/kontakt",
  "/prikolice/vesta-light-23",
  "/prikolice/trigano-39750",
  "/prikolice/kategorija/lake-teretne",
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
  const canonicalTags = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/gi) || [];
  const canonical = canonicalTags[0];
  const descriptionContent = getAttribute(description || "", "content") || "";
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  assert(Boolean(title), `${path}: nema title`);
  assert(!title?.includes("| Povuci.rs | Povuci.rs"), `${path}: dupliran naziv sajta u title`);
  assert((title?.length || 0) <= 80, `${path}: title je predugačak (${title?.length || 0})`);
  assert(Boolean(descriptionContent), `${path}: nema meta description`);
  assert(descriptionContent.length <= 180, `${path}: meta description je predugačak (${descriptionContent.length})`);
  assert(canonicalTags.length === 1, `${path}: očekivan je jedan canonical, pronađeno ${canonicalTags.length}`);
  assert(Boolean(canonical && getAttribute(canonical, "href")), `${path}: nema canonical URL`);
  assert(getAttribute(canonical || "", "href")?.startsWith("https://povuci.rs"), `${path}: canonical nije na produkcijskom domenu`);
  assert(h1Count === 1, `${path}: očekivan je tačno jedan H1, pronađeno ${h1Count}`);
  assert(/<html[^>]+lang=["']sr-Latn["']/i.test(html), `${path}: html lang nije sr-Latn`);
  assert(!html.includes("placeholder.supabase.co"), `${path}: placeholder Supabase URL je završio u HTML-u`);
  assert(!/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html), `${path}: javna stranica ima noindex`);

  for (const property of ["og:title", "og:description", "og:url", "og:image"]) {
    assert(
      new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["'][^"']+`, "i").test(html),
      `${path}: nedostaje ${property}`
    );
  }
  assert(/<meta[^>]+name=["']twitter:card["'][^>]+content=["']summary_large_image["']/i.test(html), `${path}: nedostaje Twitter card`);

  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const jsonLdTypes = [];
  for (const [, jsonLd] of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(jsonLd);
      const types = Array.isArray(parsed["@type"]) ? parsed["@type"] : [parsed["@type"]];
      jsonLdTypes.push(...types.filter(Boolean));
    } catch {
      fail(`${path}: pronađen neispravan JSON-LD`);
    }
  }

  if (path === "/") {
    assert(jsonLdTypes.includes("Organization"), `${path}: nedostaje Organization JSON-LD`);
    assert(jsonLdTypes.includes("WebSite"), `${path}: nedostaje WebSite JSON-LD`);
  }
  if (path === "/prikolice" || path === "/vesta" || path === "/trigano" || path.startsWith("/prikolice/kategorija/")) {
    assert(jsonLdTypes.includes("CollectionPage"), `${path}: nedostaje CollectionPage JSON-LD`);
    assert(jsonLdTypes.includes("BreadcrumbList"), `${path}: nedostaje BreadcrumbList JSON-LD`);
  }
  if (/^\/prikolice\/[^/]+$/.test(path)) {
    assert(jsonLdTypes.includes("Product"), `${path}: nedostaje Product JSON-LD`);
    assert(jsonLdTypes.includes("BreadcrumbList"), `${path}: nedostaje BreadcrumbList JSON-LD`);
    assert(jsonLdTypes.includes("WebPage"), `${path}: nedostaje WebPage JSON-LD`);
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
assert(admin.response.headers.get("x-robots-tag")?.includes("noindex"), "/admin/login: nedostaje X-Robots-Tag noindex");

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
assert(sitemapLocations.length >= 75, `/sitemap.xml: očekivano najmanje 75 URL-ova, pronađeno ${sitemapLocations.length}`);
assert(new Set(sitemapLocations).size === sitemapLocations.length, "/sitemap.xml: pronađeni duplirani URL-ovi");
assert(sitemapLocations.every((url) => url.startsWith("https://povuci.rs/")), "/sitemap.xml: pronađen URL van produkcijskog domena");
assert(sitemapLocations.every((url) => !url.includes("/admin") && !url.includes("/api/")), "/sitemap.xml: pronađena interna ruta");
assert((sitemap.body.match(/<image:image>/g) || []).length >= 400, "/sitemap.xml: očekivano najmanje 400 product slika");
assert((sitemap.body.match(/<lastmod>/g) || []).length >= 60, "/sitemap.xml: nedostaju datumi izmene modela");
for (const category of ["lake-teretne", "cargo-teske", "nautika-camci", "kiper", "moto-atv", "plato-slep"]) {
  assert(sitemapLocations.includes(`https://povuci.rs/prikolice/kategorija/${category}`), `/sitemap.xml: nedostaje kategorija ${category}`);
}

for (const location of sitemapLocations) {
  const url = new URL(location);
  const path = `${url.pathname}${url.search}`;
  if (checked.has(path)) continue;
  const { response, body } = await request(path);
  checked.add(path);
  assert(response.status === 200, `${path}: sitemap URL vraća ${response.status}`);
  if (response.status === 200) inspectHtml(path, body);
}

const trigano39750 = await request("/prikolice/trigano-39750");
assert(trigano39750.body.includes("Karakteristike prikolice TP39750"), "/prikolice/trigano-39750: opis nije kompletan");
for (let imageIndex = 1; imageIndex <= 9; imageIndex += 1) {
  assert(trigano39750.body.includes(`trigano-39750/${imageIndex}.webp`), `/prikolice/trigano-39750: nedostaje slika ${imageIndex}`);
}

const trigano2c250 = await request("/prikolice/trigano-2c250");
const trigano2c250Html = trigano2c250.body.replaceAll("<!-- -->", "");
assert(trigano2c250Html.includes("Mehanički"), "/prikolice/trigano-2c250: nedostaje mehanički kip");

const trigano39560 = await request("/prikolice/trigano-tp39560-kiper");
const trigano39560Html = trigano39560.body.replaceAll("<!-- -->", "");
assert(trigano39560Html.includes("Hidraulični"), "/prikolice/trigano-tp39560-kiper: nedostaje hidraulični kip");

const trigano2d250 = await request("/prikolice/trigano-2d250");
const trigano2d250Html = trigano2d250.body.replaceAll("<!-- -->", "");
assert(!trigano2d250Html.includes(">Kip:</span>"), "/prikolice/trigano-2d250: prikazan je nepostojeći kip");
assert(!trigano2d250Html.includes("Standardno (fiksno)"), "/prikolice/trigano-2d250: prikazana je stara podrazumevana vrednost kipa");

const vestaMarine750 = await request("/prikolice/vesta-marine-750");
const vestaMarine750Html = vestaMarine750.body.replaceAll("<!-- -->", "");
assert(!vestaMarine750Html.includes(">Pod:</span>"), "/prikolice/vesta-marine-750: prikazan je nepostojeći pod");
assert(/>Točkovi:<\/span><span[^>]*>155\/80 R13<\/span>/.test(vestaMarine750Html), "/prikolice/vesta-marine-750: format točkova nije normalizovan");
assert(!/>Točkovi:<\/span><span[^>]*>155\/ 80 R13<\/span>/.test(vestaMarine750Html), "/prikolice/vesta-marine-750: ostao je pogrešan razmak u dimenziji točkova");

const triganoBoat750 = await request("/prikolice/trigano-za-amac-750");
const triganoBoat750Html = triganoBoat750.body.replaceAll("<!-- -->", "");
assert(triganoBoat750Html.includes("4300 × 1810 mm"), "/prikolice/trigano-za-amac-750: nedostaju spoljašnje dimenzije iz opisa");
assert(!triganoBoat750Html.includes(">Pod:</span>"), "/prikolice/trigano-za-amac-750: prikazan je nepostojeći pod");

const characteristicLabels = [
  "Tovarni prostor",
  "Spoljašnje dimenzije",
  "Ukupna masa",
  "Masa prikolice",
  "Broj osovina",
  "Kip",
  "Točkovi",
  "Pod",
  "Konstrukcija šasije",
  "Garancija",
];
let previousLabelIndex = -1;
for (const label of characteristicLabels) {
  const labelIndex = trigano2c250Html.indexOf(`>${label}:</span>`, previousLabelIndex + 1);
  assert(labelIndex > previousLabelIndex, `/prikolice/trigano-2c250: pogrešan redosled ili nedostaje karakteristika ${label}`);
  if (labelIndex !== -1) previousLabelIndex = labelIndex;
}

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
