const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_freepage_editor.html";
const SET = 5;
const WIDTH = 1280;

const MARKS = [
  "#headerWrap", ".header-txt", ".h-txt-inner", "#header", ".head_contents",
  "#gNav", ".head_nav_contents", "#bgMain", "#wrapper",
  "#M_leftContents", ".M_mainContents",
  "#colum-wrap", "#footer_guideWrap", "#footer", ".f-copy"
];

const ids = process.argv.slice(2).map(Number).filter(Boolean);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function probe(marks) {
  return `(function () {
    var marks = ${JSON.stringify(marks)};
    var out = { view: document.documentElement.clientWidth, url: location.href, items: {} };
    marks.forEach(function (sel) {
      var e = document.querySelector(sel);
      if (!e) { out.items[sel] = null; return; }
      var r = e.getBoundingClientRect();
      out.items[sel] = {
        l: Math.round(r.left + window.pageXOffset),
        rt: Math.round(r.right + window.pageXOffset),
        w: Math.round(r.width)
      };
    });
    return out;
  })()`;
}

async function settle(p) {
  await p.evaluate("window.scrollTo(0, document.body.scrollHeight); 1");
  await sleep(1200);
  await p.evaluate("window.scrollTo(0, 0); 1");
  await sleep(700);
}

(async () => {
  const lines = fs.readFileSync("tools/cdp/freepage-ids.txt", "utf8").split("\n").filter(Boolean);
  const want = ids.length ? lines.filter(l => ids.indexOf(Number(l.split(" ")[0])) >= 0) : lines.slice(0, 8);

  const p = await page();
  await p.send("Emulation.setDeviceMetricsOverride",
    { width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: false });

  let ng = 0;
  for (const line of want) {
    const id = Number(line.split(" ")[0]);
    const file = line.split(" ")[1];

    await p.navigate("about:blank");
    await sleep(300);
    await p.navigate(BASE + "?design_set_id=" + SET + "&freepage_id=" + id);
    let ready = false;
    for (let i = 0; i < 50 && !ready; i++) {
      await sleep(500);
      ready = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
    }
    if (!ready) { console.log(String(id).padStart(3) + " " + file + "  ※ 編集画面が開けません"); ng++; continue; }
    const wasAt = await p.evaluate("location.href");
    await p.evaluate("if (document.formPreview) { document.formPreview.target = '_self'; } previewContent(); 1");
    for (let i = 0; i < 40; i++) {
      await sleep(700);
      const u = await p.evaluate("location.href");
      if (u.indexOf("isp-sp.com") >= 0 && u !== wasAt) { break; }
    }
    await sleep(3000);
    await settle(p);
    const nu = await p.evaluate(probe(MARKS));

    await p.navigate("about:blank");
    await sleep(300);
    await p.navigate("https://www.isp-sp.com/html/" + file);
    await sleep(4500);
    await settle(p);
    const live = await p.evaluate(probe(MARKS));

    const bad = [];
    MARKS.forEach(function (sel) {
      const a = live.items[sel], b = nu.items[sel];
      if (!a || !b) {
        if (a && !b) { bad.push(sel + " が移植版に無い"); }
        return;
      }
      if (Math.abs(b.l - a.l) > 4 || Math.abs(b.w - a.w) > 8) {
        bad.push(sel + " 左" + (b.l - a.l >= 0 ? "+" : "") + (b.l - a.l) +
                 " 幅" + (b.w - a.w >= 0 ? "+" : "") + (b.w - a.w));
      }
    });
    if (bad.length) { ng++; }
    console.log(String(id).padStart(3) + " " + file.padEnd(16) +
      (bad.length ? "※ " + bad.join(" / ") : "OK 現行と一致"));
  }

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  p.close();
  console.log("");
  console.log(ng ? "※ ずれているもの " + ng + " 枚" : "OK 見た " + want.length + " 枚すべて現行と一致");
  if (ng) { process.exit(1); }
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

