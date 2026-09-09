/* ---------------------------------------------------------------------------
   modules.js — モジュールを1つずつ開いて、IDと中身を読む／書き込む

     node tools/cdp/modules.js              全部読むだけ
     node tools/cdp/modules.js write        必要なものを書き込んで確かめる

   🔴 テンプレートが呼ぶのは「モジュールID」です

      一覧に出ている「モジュール名」は見出しにすぎません。
      <{$module.leftmenu}> が探すのは ID のほう。違っていても
      **エラーは出ず、その部分だけ空**になります。

   🔴 モジュール画面は、ページ種別の画面と別物です

        ページ種別  g_editor_object["html_pc"]  →  saveContent()
        モジュール  textarea[name=content] に付いた CodeMirror ひとつ
                    →  updateModule()

      同じつもりで書くと、**何も入らないまま保存**します。
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_module_editor.html";
const SET = 5;
const LAST = 13;

const CM = "document.querySelector('.CodeMirror').CodeMirror";
const HAS_CM = "(document.querySelector('.CodeMirror') && document.querySelector('.CodeMirror').CodeMirror) ? 1 : 0";

/* テンプレートが呼ぶ ID → 流し込むファイル */
const WANT = {
  header: "package/modules/header.tpl",
  leftmenu: "package/modules/leftmenu.tpl",
  footer: "package/modules/footer.tpl",
  calendar1: "package/modules/calendar1.tpl",
  calendar2: "package/modules/calendar2.tpl",
  freespace_calendar: "package/modules/freespace_calendar.tpl"
};

const doWrite = process.argv[2] === "write";
/* 🔴 改行コードをLFに揃えます
 *
 *    リポジトリの作業コピーは CRLF です（git の autocrlf）。CodeMirror は
 *    setValue のときに LF へ揃えるので、**渡した文字数と入った文字数が
 *    合わなくなり**、行数ぶんだけ短く見えます。freespace_calendar で
 *    234文字ずれました。先に揃えてから渡します。 */
function lf(s) { return s.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
/* 🔴 数値参照は「両側とも」戻してから比べます
 *
 *    サーバーは保存のときに一部の文字を数値参照にします（— は &#8212;、
 *    🔴 は &#128308;）。ところが**元のファイル自体が &#12316; や &#169;
 *    を持っています**（現行サイトから写した文面です）。片側だけ戻すと、
 *    こちらの &#12316; まで 〜 に変わって、一致しないと誤判定します。
 *    フッターで実際にそうなりました。両側に同じ処理をかけます。 */
function unescapeNum(s) { return s.replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n))); }

const READ = `(function(){
  var f = document.forms.formMain;
  var g = function (n) { var e = f ? f.elements[n] : null; return e ? e.value : null; };
  var cm = document.querySelector(".CodeMirror");
  var body = (cm && cm.CodeMirror) ? cm.CodeMirror.getValue() : (g("content") || "");
  return {
    id: g("name") || "",
    label: g("description") || "",
    len: body.length
  };
})()`;

async function waitCm(p) {
  for (let i = 0; i < 24; i++) {
    await sleep(400);
    if (await p.evaluate(HAS_CM)) { return true; }
  }
  return false;
}

(async () => {
  const p = await page();
  const found = {};

  for (let id = 1; id <= LAST; id++) {
    await p.navigate(BASE + "?design_set_id=" + SET + "&module_id=" + id);
    if (!await waitCm(p)) { console.log(String(id).padStart(2) + "  🔴 開けません"); continue; }
    const m = await p.evaluate(READ);
    console.log(String(id).padStart(2) + "  ID=" + String(m.id).padEnd(20) +
      " 名前=" + String(m.label).padEnd(22) + String(m.len).padStart(6) + " 文字");
    if (m.id) { found[m.id] = { moduleId: id, len: m.len }; }
  }

  console.log("");
  console.log("テンプレートが必要とするID:");
  for (const key of Object.keys(WANT)) {
    console.log("  " + key.padEnd(20) +
      (found[key] ? "あり（module_id=" + found[key].moduleId + " / " + found[key].len + " 文字）" : "🔴 ありません"));
  }

  if (!doWrite) { p.close(); return; }

  console.log("");
  console.log("書き込み:");
  let ng = 0;
  for (const key of Object.keys(WANT)) {
    if (!found[key]) { console.log("  " + key.padEnd(20) + "🔴 IDが無いので書けません"); ng++; continue; }
    const body = lf(fs.readFileSync(WANT[key], "utf8"));
    const at = BASE + "?design_set_id=" + SET + "&module_id=" + found[key].moduleId;

    await p.navigate(at);
    if (!await waitCm(p)) { console.log("  " + key.padEnd(20) + "🔴 エディタが出ません"); ng++; continue; }

    const before = await p.evaluate(CM + ".getValue().length");
    await p.evaluate(CM + ".setValue(" + JSON.stringify(body) + ")");
    const inEditor = await p.evaluate(CM + ".getValue().length");
    if (inEditor !== body.length) {
      console.log("  " + key.padEnd(20) + "🔴 入りきりません " + inEditor + "/" + body.length); ng++; continue;
    }
    await p.evaluate("window.confirm = function(){ return true; }; updateModule(); 1");
    await sleep(4000);

    await p.navigate(at);
    if (!await waitCm(p)) { console.log("  " + key.padEnd(20) + "🔴 読み直せません"); ng++; continue; }
    const live = await p.evaluate(CM + ".getValue()");
    const back = unescapeNum(live);
    if (back === unescapeNum(body)) {
      console.log("  " + key.padEnd(20) + "✅ " + before + " → " + live.length + " 文字");
    } else {
      console.log("  " + key.padEnd(20) + "🔴 " + before + " → " + live.length + "（渡した " + body.length + "）");
      ng++;
    }
  }
  p.close();
  if (ng) { process.exit(1); }
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
