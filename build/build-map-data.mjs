/*
 * build/build-map-data.mjs  —  GeoJSON (WGS84) -> kompakte SVG-Pfade (voll detailliert)
 * ---------------------------------------------------------------------------------
 * Liest die echten swisstopo-Quellen aus src/data/source/ und erzeugt
 * build/ch-map.generated.json mit:
 *   - cantons[] {nr,name,d,cx,cy}
 *   - gemeinden[] {bfs,name,kt,d}      (echte CH-Gemeinden, objektart Gemeindegebiet, icc CH)
 *   - sonder[] {bfs,name,kt,d}         (CH-Sondergebiete: Staatswald Galm, Kommunanzen – neutral, keine Löcher)
 *   - lakes[] {name,d}                 (Seen, bfs>=9000)
 *   - meta {viewBox,...}
 *
 * Liechtenstein (icc LI), Büsingen (DE), Campione (IT) werden ausgeschlossen.
 * Projektion: equirectangular mit cos(lat0)-Korrektur (für die kleine CH-Ausdehnung praktisch verzerrungsfrei).
 *
 * Aufruf:  node build/build-map-data.mjs [viewBoxWidth] [decimals]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "src", "data", "source");
const W = +(process.argv[2] || 2000);     // viewBox-Breite
const DEC = +(process.argv[3] ?? 1);      // Nachkommastellen

const gem = JSON.parse(fs.readFileSync(path.join(SRC, "gemeinden.geojson"), "utf8"));
const ktn = JSON.parse(fs.readFileSync(path.join(SRC, "kantone.geojson"), "utf8"));

/* ---- 1. Filtern ---- */
const isCommune = (p) => p.objektart === "Gemeindegebiet" && p.icc === "CH";
const isLake    = (p) => p.objektart === "Kantonsgebiet" && p.bfs_nummer >= 9000;
const isSonder  = (p) => p.icc === "CH" && !isCommune(p) && !isLake(p); // Galm + Kommunanzen

const communeF = gem.features.filter((f) => isCommune(f.properties));
const lakeF    = gem.features.filter((f) => isLake(f.properties));
const sonderF  = gem.features.filter((f) => isSonder(f.properties));
const cantonF  = ktn.features; // 26, alle CH

/* ---- 2. Projektion: Pass 1 = globale bbox ---- */
const DEG = Math.PI / 180;
let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
function scanGeom(geom) {
  const each = (ring) => { for (const [lon, lat] of ring) {
    if (lon < minLon) minLon = lon; if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
  } };
  if (geom.type === "Polygon") geom.coordinates.forEach(each);
  else if (geom.type === "MultiPolygon") geom.coordinates.forEach((poly) => poly.forEach(each));
}
[...communeF, ...lakeF, ...sonderF, ...cantonF].forEach((f) => scanGeom(f.geometry));

const lat0 = (minLat + maxLat) / 2;
const k = Math.cos(lat0 * DEG);
const pX = (lon) => lon * k, pY = (lat) => lat;
const minX = pX(minLon), maxX = pX(maxLon), minY = pY(minLat), maxY = pY(maxLat);
const projW = maxX - minX, projH = maxY - minY;
const H = +(W * projH / projW);
const sx = (lon) => ((pX(lon) - minX) / projW) * W;
const sy = (lat) => ((maxY - pY(lat)) / projH) * H; // y-Flip

const r = (v) => { const s = (+v.toFixed(DEC)).toString(); return s; };

/* ---- 3. Pfad-Erzeugung (alle Ringe inkl. Löcher -> fill-rule:evenodd) ---- */
function ringToPath(ring) {
  let s = "";
  for (let i = 0; i < ring.length; i++) {
    s += (i === 0 ? "M" : " ") + r(sx(ring[i][0])) + "," + r(sy(ring[i][1]));
  }
  return s + "Z";
}
function geomToPath(geom) {
  let s = "";
  if (geom.type === "Polygon") for (const ring of geom.coordinates) s += ringToPath(ring);
  else if (geom.type === "MultiPolygon") for (const poly of geom.coordinates) for (const ring of poly) s += ringToPath(ring);
  return s;
}

/* ---- 4. Kanton-Schwerpunkt (größter Ring, Flächenschwerpunkt) für Labels ---- */
function ringCentroidArea(ring) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length; i < n - 1; i++) {
    const x0 = sx(ring[i][0]), y0 = sy(ring[i][1]);
    const x1 = sx(ring[i + 1][0]), y1 = sy(ring[i + 1][1]);
    const f = x0 * y1 - x1 * y0; a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
  }
  a *= 0.5; if (!a) return null;
  return { cx: cx / (6 * a), cy: cy / (6 * a), area: Math.abs(a) };
}
function biggestRing(geom) {
  let rings = [];
  if (geom.type === "Polygon") rings = [geom.coordinates[0]];
  else if (geom.type === "MultiPolygon") rings = geom.coordinates.map((p) => p[0]);
  let best = null;
  for (const ring of rings) { const c = ringCentroidArea(ring); if (c && (!best || c.area > best.area)) best = c; }
  return best;
}

/* ---- 5. Ausgabe-Datensätze ---- */
const cantons = cantonF.map((f) => {
  const p = f.properties; const c = biggestRing(f.geometry) || { cx: 0, cy: 0 };
  return { nr: p.kantonsnummer, name: p.name, d: geomToPath(f.geometry), cx: +c.cx.toFixed(1), cy: +c.cy.toFixed(1) };
}).sort((a, b) => a.nr - b.nr);

const gemeinden = communeF.map((f) => {
  const p = f.properties;
  return { bfs: p.bfs_nummer, name: p.name, kt: p.kantonsnummer, d: geomToPath(f.geometry) };
}).sort((a, b) => a.bfs - b.bfs);

const sonder = sonderF.map((f) => {
  const p = f.properties;
  return { bfs: p.bfs_nummer, name: p.name, kt: p.kantonsnummer, d: geomToPath(f.geometry) };
}).sort((a, b) => a.bfs - b.bfs);

const lakes = lakeF.map((f) => ({ name: f.properties.name, d: geomToPath(f.geometry) }))
  .sort((a, b) => a.name.localeCompare(b.name));

const data = {
  meta: {
    quelle: "swisstopo swissBOUNDARIES (TGMG_2025, Rev. 04/2025)",
    crs_in: "WGS84/CRS84", projektion: `equirectangular, lat0=${lat0.toFixed(4)}, k=${k.toFixed(5)}`,
    viewBox: `0 0 ${W} ${+H.toFixed(1)}`, width: W, height: +H.toFixed(1), decimals: DEC,
    bbox_wgs84: { minLon, minLat, maxLon, maxLat },
    counts: { cantons: cantons.length, gemeinden: gemeinden.length, sonder: sonder.length, lakes: lakes.length },
    generated: new Date().toISOString(),
  },
  cantons, gemeinden, sonder, lakes,
};

const outFile = path.join(__dirname, "ch-map.generated.json");
fs.writeFileSync(outFile, JSON.stringify(data));
const kb = (fs.statSync(outFile).size / 1024).toFixed(0);
console.log("viewBox:", data.meta.viewBox, "| decimals:", DEC);
console.log("counts:", JSON.stringify(data.meta.counts));
console.log("Ausgabe:", path.relative(path.join(__dirname, ".."), outFile), `(${kb} KB)`);
console.log("lat0:", lat0.toFixed(4), "k:", k.toFixed(5));
