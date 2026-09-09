/* ---------------------------------------------------------------------------
   open.js — URLを開いて、中身の骨格を報告する

     node tools/cdp/open.js <URL> [待ち秒]

   🔴 編集画面は console.makeshop.jp ではありません

      新しい管理画面は入れ物だけで、中身は
      shop1.makeshop.jp/makeshop/newmanager/ の iframe です。
      別ドメインなので、親からは中を触れません。**直接そちらを開きます。**
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const url = process.argv[2];
const wait = Number(process.argv[3] || 5) * 1000;
if (!url) { console.error("使い方: node tools/cdp/open.js <URL> [待ち秒]"); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  await p.navigate(url);
  await sleep(wait);

  const info = await p.evaluate(`(function(){
    const list = (sel, n) => Array.from(document.querySelectorAll(sel)).slice(0, n).map(function(e){
      const label = (e.innerText || e.value || e.getAttribute("alt") || "").replace(/\\s+/g, " ").trim().slice(0, 44);
      const id = e.id ? "#" + e.id : "";
      const nm = e.name ? "[" + e.name + "]" : "";
      return (label || "(無題)") + " " + id + nm;
    });
    return {
      url: location.href,
      title: document.title,
      forms: Array.from(document.forms).map(function(f){ return (f.name || "(無名)") + " -> " + f.action; }),
      textareas: Array.from(document.querySelectorAll("textarea")).map(function(t){
        return (t.name || t.id || "(無名)") + "  " + (t.value || "").length + "文字";
      }),
      frames: Array.from(document.querySelectorAll("iframe")).map(function(f){ return f.src; }),
      buttons: list("button, input[type=submit], input[type=button], a.btn", 40),
      links: list("a", 60)
    };
  })()`);

  console.log("URL   : " + info.url);
  console.log("タイトル: " + info.title);
  console.log("");
  if (info.frames.length) { console.log("iframe:"); info.frames.forEach(f => console.log("  " + f)); console.log(""); }
  if (info.forms.length) { console.log("フォーム:"); info.forms.forEach(f => console.log("  " + f)); console.log(""); }
  if (info.textareas.length) { console.log("テキスト欄:"); info.textareas.forEach(f => console.log("  " + f)); console.log(""); }
  console.log("ボタン:"); info.buttons.forEach(b => console.log("  " + b));
  console.log("");
  console.log("リンク:"); info.links.forEach(b => console.log("  " + b));
  p.close();
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
