const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const OUT = "tools/cdp/shots";

const PAGES = [
  ["top", 2], ["detail", 3], ["category", 4], ["search", 5], ["cart", 6],
  ["news-list", 9], ["news-detail", 10], ["guide", 11], ["company", 12],
  ["contract", 13], ["policy", 14]
];

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const onlyPage = process.argv[2];
const onlyWidth = Number(process.argv[3] || 0);
const WIDTHS = onlyWidth ? [onlyWidth] : [1280, 375];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const p = await page();

  for (const [name, type] of PAGES) {
    if (onlyPage && onlyPage !== name) { continue; }
    for (const w of WIDTHS) {
      const mobile = w < 700;
      await p.send("Emulation.setDeviceMetricsOverride",
        { width: w, height: 900, deviceScaleFactor: 1, mobile: mobile });
      await p.send("Network.setUserAgentOverride",
        { userAgent: mobile ? IPHONE : "", platform: mobile ? "iPhone" : "" });

      await p.navigate("about:blank");
      await sleep(300);
      await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
      let ready = false;
      for (let i = 0; i < 60 && !ready; i++) {
        await sleep(500);
        ready = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
      }
      if (!ready) { console.log(name + " " + w + "  ※ 編集画面が開けません"); continue; }

      const wasAt = await p.evaluate("location.href");
      await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
      for (let i = 0; i < 40; i++) {
        await sleep(700);
        const u = await p.evaluate("location.href");
        if (u.indexOf("isp-sp.com") >= 0 && u !== wasAt) { break; }
      }
      await sleep(4500);

      await p.evaluate(`(function(){
        window.scrollTo(0, document.body.scrollHeight);
        return 1;
      })()`);
      await sleep(1200);
      await p.evaluate("window.scrollTo(0, 0); 1");
      await sleep(800);

      const size = await p.evaluate(`(function(){
        var d = document.documentElement, b = document.body;
        return { w: Math.max(d.scrollWidth, b.scrollWidth), h: Math.max(d.scrollHeight, b.scrollHeight) };
      })()`);
      const h = Math.min(size.h, 12000);
      await p.send("Emulation.setDeviceMetricsOverride",
        { width: w, height: h, deviceScaleFactor: 1, mobile: mobile });
      await sleep(900);

      const shot = await p.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
      const file = OUT + "/" + name + "-" + w + ".png";
      fs.writeFileSync(file, Buffer.from(shot.result.data, "base64"));
      console.log(name.padEnd(12) + String(w).padStart(5) + "px  " +
        String(size.w) + "x" + h + "  → " + file);
    }
  }

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

