const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const TYPE = Number(process.argv[2] || 2);

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const PROBE = `(function () {
  var out = { width: document.documentElement.clientWidth, nodes: [] };
  var sel = ["#headerWrap", ".header-txt", ".h-txt-inner", "p.shipping", ".head_nav_contents"];
  sel.forEach(function (s) {
    var e = document.querySelector(s);
    if (!e) { out.nodes.push({ sel: s, missing: true }); return; }
    var cs = getComputedStyle(e);
    var r = e.getBoundingClientRect();
    out.nodes.push({
      sel: s,
      rect: Math.round(r.left) + ".." + Math.round(r.right) + " (w " + Math.round(r.width) + ")",
      scrollW: e.scrollWidth,
      display: cs.display,
      position: cs.position,
      width: cs.width,
      minWidth: cs.minWidth,
      whiteSpace: cs.whiteSpace,
      flexWrap: cs.flexWrap,
      padding: cs.paddingLeft + "/" + cs.paddingRight,
      text: (e.innerText || "").replace(/[\\r\\n\\t ]+/g, " ").trim().slice(0, 90)
    });
  });
  /* いちばん広い子を辿ります */
  var worst = null;
  var head = document.querySelector("#headerWrap");
  if (head) {
    Array.from(head.querySelectorAll("*")).forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (!worst || r.right > worst.right) {
        worst = { right: r.right, tag: e.tagName, id: e.id,
          cls: (typeof e.className === "string" ? e.className : ""),
          w: Math.round(r.width),
          text: (e.innerText || "").replace(/[\\r\\n\\t ]+/g, " ").trim().slice(0, 70) };
      }
    });
  }
  out.worst = worst;
  return out;
})()`;

(async () => {
  const p = await page();
  await p.send("Emulation.setDeviceMetricsOverride",
    { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
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
  const r = await p.evaluate(PROBE);

  console.log("page_type " + TYPE + " / 画面幅 " + r.width);
  console.log("");
  r.nodes.forEach(function (n) {
    if (n.missing) { console.log(n.sel.padEnd(20) + "（ありません）"); return; }
    console.log(n.sel.padEnd(20) + n.rect + "  scrollW " + n.scrollW);
    console.log("".padEnd(20) + "display " + n.display + " / position " + n.position +
      " / width " + n.width + " / min-width " + n.minWidth +
      " / white-space " + n.whiteSpace + " / flex-wrap " + n.flexWrap +
      " / padding " + n.padding);
    console.log("".padEnd(20) + "文言: " + n.text);
  });
  console.log("");
  console.log("いちばん右へ出ている子: " + JSON.stringify(r.worst));

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

