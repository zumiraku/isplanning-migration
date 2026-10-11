const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_freepage_editor.html";
const SET = 5;
const OUT = "tools/cdp/freepage-out";

const CM = "document.querySelector('.CodeMirror').CodeMirror";
const HAS = "(document.querySelector('.CodeMirror') && document.querySelector('.CodeMirror').CodeMirror) ? 1 : 0";

const from = Number(process.argv[2] || 1);
const to = Number(process.argv[3] || 82);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function lf(s) { return s.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)); }
function un(s) { return s.replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n))); }

async function waitCm(p) {
  for (let i = 0; i < 26; i++) { await sleep(400); if (await p.evaluate(HAS)) { return true; } }
  return false;
}

(async () => {
  const lines = fs.readFileSync("tools/cdp/freepage-ids.txt", "utf8").split("\n").filter(Boolean);
  const p = await page();
  let ok = 0, ng = 0;

  for (const line of lines) {
    const sp = line.indexOf(" ");
    const id = Number(line.slice(0, sp));
    const pageId = line.slice(sp + 1).split(" ")[0];
    if (id < from || id > to) { continue; }

    const file = OUT + "/" + pageId + ".tpl";
    if (!fs.existsSync(file)) { console.log(String(id).padStart(3) + "  ※ 作ったものが無い " + pageId); ng++; continue; }
    const body = lf(fs.readFileSync(file, "utf8"));
    const at = BASE + "?design_set_id=" + SET + "&freepage_id=" + id;

    await p.navigate(at);
    if (!await waitCm(p)) { console.log(String(id).padStart(3) + "  ※ 開けません " + pageId); ng++; continue; }

    const before = await p.evaluate(CM + ".getValue().length");
    await p.evaluate(CM + ".setValue(" + JSON.stringify(body) + ")");
    const inEditor = await p.evaluate(CM + ".getValue().length");
    if (inEditor !== body.length) {
      console.log(String(id).padStart(3) + "  ※ 入りきりません " + inEditor + "/" + body.length + " " + pageId);
      ng++; continue;
    }

    const saved = await p.evaluate(`(function(){
      window.confirm = function(){ return true; };
      if (typeof updateFreepage === "function") { updateFreepage(); return "updateFreepage"; }
      if (typeof saveContent === "function") { saveContent(); return "saveContent"; }
      if (typeof updateModule === "function") { updateModule(); return "updateModule"; }
      var b = Array.from(document.querySelectorAll("a,button")).filter(function (x) {
        return (x.innerText || "").replace(/\\s+/g, "") === "保存";
      })[0];
      if (b) { b.click(); return "保存ボタン"; }
      return "(保存の入口が見つかりません)";
    })()`);
    if (String(saved).indexOf("見つかりません") >= 0) {
      console.log(String(id).padStart(3) + "  ※ " + saved + " " + pageId); ng++; continue;
    }
    await sleep(4000);

    await p.navigate(at);
    if (!await waitCm(p)) { console.log(String(id).padStart(3) + "  ※ 読み直せません " + pageId); ng++; continue; }
    const live = await p.evaluate(CM + ".getValue()");
    if (un(live) === un(body)) {
      console.log(String(id).padStart(3) + "  OK " + before + " → " + live.length + "  " + pageId);
      ok++;
    } else {
      console.log(String(id).padStart(3) + "  ※ 一致しません " + before + " → " + live.length +
        "（渡した " + body.length + "） " + pageId);
      ng++;
    }
  }

  p.close();
  console.log("");
  console.log("流し込み " + (ok + ng) + " 枚 / 一致 " + ok + " 枚 / 通らず " + ng + " 枚");
  if (ng) { process.exit(1); }
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

