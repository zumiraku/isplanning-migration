/* ancestors.js — ある要素の親を根まで辿って、幅と「基準になる指定」を並べます */
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const SEL = process.argv[2] || "#headerWrap";
const TYPE = Number(process.argv[3] || 2);
const WIDTH = Number(process.argv[4] || 375);

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function probe(sel) {
  return `(function () {
    var e = document.querySelector(${JSON.stringify(sel)});
    if (!e) { return { err: "見つかりません" }; }
    var out = { view: document.documentElement.clientWidth, chain: [] };
    var node = e;
    while (node && node.nodeType === 1) {
      var cs = getComputedStyle(node);
      var r = node.getBoundingClientRect();
      out.chain.push({
        tag: node.tagName + (node.id ? "#" + node.id : "") +
             (typeof node.className === "string" && node.className ? "." + node.className.trim().split(/[\\t ]+/)[0] : ""),
        w: Math.round(r.width), right: Math.round(r.right), scrollW: node.scrollWidth,
        cssWidth: cs.width, cssMinWidth: cs.minWidth, position: cs.position,
        display: cs.display, overflowX: cs.overflowX,
        transform: cs.transform === "none" ? "" : "transform",
        filter: cs.filter === "none" ? "" : "filter",
        willChange: cs.willChange === "auto" ? "" : "will-change:" + cs.willChange,
        contain: (cs.contain && cs.contain !== "none") ? "contain:" + cs.contain : "",
        perspective: cs.perspective === "none" ? "" : "perspective"
      });
      node = node.parentElement;
    }
    return out;
  })()`;
}

(async () => {
  const p = await page();
  await p.send("Emulation.setDeviceMetricsOverride",
    { width: WIDTH, height: 812, deviceScaleFactor: 2, mobile: true });
  await p.send("Network.setUserAgentOverride", { userAgent: IPHONE, platform: "iPhone" });

  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + TYPE);
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    if (await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { break; }
  }
  await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    const u = await p.evaluate("location.href");
    if (u.indexOf("isp-sp.com") >= 0) { break; }
  }
  await sleep(4000);
  const r = await p.evaluate(probe(SEL));

  if (r.err) { console.log("※ " + r.err); }
  else {
    console.log("画面幅 " + r.view + " / " + SEL + " の親を根まで");
    console.log("");
    console.log("要素".padEnd(30) + "  幅   右端  scrollW  css幅      position   基準になる指定");
    r.chain.forEach(function (c) {
      const flags = [c.transform, c.filter, c.willChange, c.contain, c.perspective].filter(Boolean).join(" ");
      console.log(c.tag.slice(0, 30).padEnd(30) +
        String(c.w).padStart(5) + String(c.right).padStart(6) + String(c.scrollW).padStart(8) + "  " +
        c.cssWidth.padEnd(10) + " " + c.position.padEnd(10) + " " + (flags || "-"));
    });
  }

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

