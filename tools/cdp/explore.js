/* explore.js — クリエイターモードの編集画面がどう出来ているかを見る */
const { page } = require("./cdp.js");

const URL = "https://console.makeshop.jp/design/editor?shopId=isplanning";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  await p.navigate(URL);
  await sleep(6000);

  const info = await p.evaluate(`(function(){
    const t = s => Array.from(document.querySelectorAll(s)).map(function(e){
      return (e.innerText || e.value || "").replace(/\\s+/g, " ").trim().slice(0, 40);
    }).filter(Boolean);
    return {
      url: location.href,
      title: document.title,
      buttons: t("button").slice(0, 60),
      links: t("a").slice(0, 60),
      textareas: document.querySelectorAll("textarea").length,
      codemirror: document.querySelectorAll(".CodeMirror, .cm-editor, .monaco-editor").length,
      iframes: document.querySelectorAll("iframe").length
    };
  })()`);

  console.log("URL   : " + info.url);
  console.log("タイトル: " + info.title);
  console.log("textarea: " + info.textareas + " / エディタ部品: " + info.codemirror + " / iframe: " + info.iframes);
  console.log("");
  console.log("ボタン:");
  info.buttons.forEach(b => console.log("  " + b));
  console.log("");
  console.log("リンク:");
  info.links.forEach(b => console.log("  " + b));
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

