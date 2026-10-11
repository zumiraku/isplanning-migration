const { page } = require("./cdp.js");
(async () => {
  const p = await page("makeshop.jp");
  const r = await p.send("Network.getAllCookies");
  const all = (r.result && r.result.cookies) || [];
  console.log("Cookie 総数: " + all.length);
  const by = {};
  all.forEach(c => { by[c.domain] = (by[c.domain] || 0) + 1; });
  Object.keys(by).sort().forEach(d => console.log("  " + d + "  " + by[d]));
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

