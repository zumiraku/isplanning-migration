/* freepage-fetch.js — 独自ページ82枚を、公開中のサイトから取ってくる */
const fs = require("fs");
const https = require("https");

const LIST = "tools/cdp/freepage-ids.txt";
const OUT = "tools/cdp/freepage-src";

function get(path) {
  return new Promise((ok, ng) => {
    const rq = https.get({ host: "www.isp-sp.com", path: path, timeout: 20000 }, res => {
      const chunks = [];
      res.on("data", d => chunks.push(d));
      res.on("end", () => ok({ status: res.statusCode, body: Buffer.concat(chunks) }));
    });
    rq.on("error", ng);
    rq.on("timeout", () => { rq.destroy(); ng(new Error("timeout")); });
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const lines = fs.readFileSync(LIST, "utf8").split("\n").filter(Boolean);
  let ok = 0, ng = 0;
  for (const line of lines) {
    const parts = line.split(" ");
    const pageId = parts[1];
    if (!pageId) { continue; }
    const at = OUT + "/" + pageId;
    if (fs.existsSync(at) && fs.statSync(at).size > 1000) { ok++; continue; }
    try {
      const r = await get("/html/" + pageId);
      if (r.status !== 200 || r.body.length < 1000) {
        console.log("※ " + pageId + "  " + r.status + " / " + r.body.length + " バイト");
        ng++; continue;
      }
      fs.writeFileSync(at, r.body);
      ok++;
    } catch (e) {
      console.log("※ " + pageId + "  " + e.message);
      ng++;
    }
  }
  console.log("取れた " + ok + " 枚 / 取れない " + ng + " 枚  → " + OUT);
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

