/* probe-desc.js — 商品詳細の説明タグ4つに、実際に何が入るのかを確かめる */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5, TYPE = 3;
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const TAGS = ["description", "description2", "description3", "description4", "special_display"];

(async () => {
  const p = await page();
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + TYPE);
  let ok = false;
  for (let i = 0; i < 30 && !ok; i++) {
    await sleep(500);
    ok = !!(await p.evaluate("(typeof previewContent === 'function' && typeof g_editor_object !== 'undefined' && !!g_editor_object.html_pc) ? 1 : 0"));
  }
  if (!ok) { console.log("※ エディタが出ません"); p.close(); process.exit(1); }

  const probe = TAGS.map((t, i) =>
    '<div class="ZQPROBE">ZQ' + i + 'START<{$item.' + t + '}>ZQ' + i + 'END</div>').join("\n");

  const set = await p.evaluate(`(function(){
    var ed = g_editor_object.html_pc;
    var body = ed.getValue();
    var at = body.lastIndexOf("<body>");
    if (at < 0) { return "no-body"; }
    ed.setValue(body.slice(0, at + 6) + ${JSON.stringify("\n" + probe + "\n")} + body.slice(at + 6));
    return ed.getValue().length;
  })()`);
  console.log("印を入れた: " + set);

  await p.evaluate("window.confirm = function(){ return true; }; saveContent(); 1");
  await sleep(4500);
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + TYPE);
  for (let i = 0; i < 30; i++) { await sleep(500); if (await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) break; }
  await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
  let url = "";
  for (let i = 0; i < 30; i++) {
    await sleep(700);
    url = await p.evaluate("location.href");
    if (url.indexOf("isp-sp.com") >= 0) { break; }
  }
  await sleep(2000);
  const html = await p.evaluate("document.documentElement.outerHTML");
  p.close();

  const back = await page();
  await back.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + TYPE);
  for (let i = 0; i < 30; i++) { await sleep(500); if (await back.evaluate("(typeof g_editor_object !== 'undefined' && !!g_editor_object.html_pc) ? 1 : 0")) break; }
  const orig = fs.readFileSync("package/templates/detail.tpl", "utf8").split(String.fromCharCode(13)+String.fromCharCode(10)).join(String.fromCharCode(10));
  await back.evaluate("g_editor_object.html_pc.setValue(" + JSON.stringify(orig) + ")");
  await back.evaluate("window.confirm = function(){ return true; }; saveContent(); 1");
  await sleep(4500);
  back.close();
  console.log("元に戻しました");

  fs.writeFileSync("tools/cdp/preview-out/_probe.html", html);
  console.log("URL: " + url.slice(0, 70));
  console.log("");

  TAGS.forEach((t, i) => {
    const a = html.indexOf("ZQ" + i + "START");
    const b = html.indexOf("ZQ" + i + "END");
    if (a < 0 || b < 0) { console.log("$item." + t.padEnd(18) + "※ 印が出ません"); return; }
    const seg = html.slice(a + ("ZQ" + i + "START").length, b);
    const text = seg.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    console.log("$item." + t.padEnd(18) + String(seg.length).padStart(6) + " 文字  " + text.slice(0, 90));
  });
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

