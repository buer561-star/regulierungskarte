import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = 8137;
http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(root, p);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    const ext = path.extname(file).toLowerCase();
    const type = ext === ".html" ? "text/html; charset=utf-8" : ext === ".json" ? "application/json" : "application/octet-stream";
    res.writeHead(200, { "content-type": type });
    res.end(data);
  });
}).listen(port, () => console.log("serving on http://localhost:" + port));
