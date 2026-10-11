const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { page } = require("./cdp.js");
const { openAt, sleep } = require("./bind.js");
const { PAGES, landed } = require("./pages.js");

const OUT = path.join(__dirname, "parity-out");
const only = process.argv[2];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const p = await page();
  const jobs = [];

  for (const [name, livePath, portPath, type] of PAGES) {
    if (only && only !== name) { continue; }
    await p.navigate("about:blank"); await sleep(250);
    await p.navigate("https://www.isp-sp.com" + livePath); await sleep(5000);
    const at = await p.evaluate("location.href");
    if (!landed(livePath, at)) {
      console.log("※ " + name + " ── 現行 " + livePath + " は飛ばされました。飛ばします");
      continue;
    }
    const liveHtml = await p.evaluate("document.documentElement.outerHTML");

    const bound = await openAt(p, type, portPath, 5000);
    if (!bound.ok) { console.log("※ " + name + " ── " + bound.why); continue; }
    const portHtml = await p.evaluate("document.documentElement.outerHTML");

    const a = path.join(OUT, name + "-live.html");
    const b = path.join(OUT, name + "-port.html");
    fs.writeFileSync(a, liveHtml);
    fs.writeFileSync(b, portHtml);
    jobs.push([name, a, b]);
  }
  p.close();

  console.log("");
  let bad = 0;
  for (const [name, a, b] of jobs) {
    let out = "";
    try {
      out = execFileSync(process.execPath,
        ["tools/port/check-content-parity.js", a, b, name], { encoding: "utf8" });
    } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
    const line = out.split("\n").filter(Boolean);
    const head = line.find(l => l.indexOf("移植版に無い") >= 0) || line[line.length - 1] || "(出力なし)";
    const n = Number((head.match(/移植版に無い (\d+)/) || [])[1] || 0);
    if (n) { bad += n; }
    console.log((n ? "※ " : "   ") + name.padEnd(14) + head.trim());
    if (n) { line.slice(line.indexOf(head) + 1, line.indexOf(head) + 9).forEach(l => console.log("       " + l)); }
  }
  console.log("");
  console.log(bad ? "※ 現行にあって移植版に無い塊 " + bad + " 件"
                  : "OK 現行の文言は、移植版に全部あります");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

