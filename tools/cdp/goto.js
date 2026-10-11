const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/";
const CONSOLE = "https://console.makeshop.jp/";

const WHERE = {
  design_top: BASE + "design_top.html",
  design_brandpage: BASE + "design_brandpage.html",
  creator: BASE + "flex_design_top.html",
  editor: CONSOLE + "design/editor?shopId=isplanning",
  dashboard: CONSOLE + "dashboard?shopId=isplanning",
  products: CONSOLE + "products?shopId=isplanning",
  catalog: CONSOLE + "settings/feature-catalog?shopId=isplanning"
};

const name = process.argv[2];
const wait = Number(process.argv[3] || 5) * 1000;
const target = WHERE[name] || (name && /^[a-z0-9_]+\.html(\?[\w=&]*)?$/i.test(name) ? BASE + name : null);
if (!target) {
  console.error("行き先が分かりません: " + name);
  console.error("使えるもの: " + Object.keys(WHERE).join(" "));
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  await p.navigate(target);
  await sleep(wait);

  const info = await p.evaluate(`(function(){
    const list = (sel, n) => Array.from(document.querySelectorAll(sel)).slice(0, n).map(function(e){
      const label = (e.innerText || e.value || e.getAttribute("alt") || "").replace(/\\s+/g, " ").trim().slice(0, 46);
      return (label || "(無題)") + (e.id ? "  #" + e.id : "") + (e.name ? "  [" + e.name + "]" : "");
    });
    return {
      url: location.href,
      title: document.title,
      forms: Array.from(document.forms).map(function(f){ return (f.name || "(無名)") + " -> " + f.action; }),
      textareas: Array.from(document.querySelectorAll("textarea")).map(function(t){
        return (t.name || t.id || "(無名)") + "  " + (t.value || "").length + "文字";
      }),
      frames: Array.from(document.querySelectorAll("iframe")).map(function(f){ return f.src; }),
      buttons: list("button, input[type=submit], input[type=button]", 40),
      links: list("a", 70),
      body: document.body ? document.body.innerText.replace(/\\s+/g, " ").slice(0, 400) : ""
    };
  })()`);

  console.log("URL   : " + info.url);
  console.log("タイトル: " + info.title);
  if (info.frames.length) { console.log(""); console.log("iframe:"); info.frames.forEach(f => console.log("  " + f)); }
  if (info.forms.length) { console.log(""); console.log("フォーム:"); info.forms.forEach(f => console.log("  " + f)); }
  if (info.textareas.length) { console.log(""); console.log("テキスト欄:"); info.textareas.forEach(f => console.log("  " + f)); }
  console.log("");
  console.log("ボタン:"); info.buttons.forEach(b => console.log("  " + b));
  console.log("");
  console.log("リンク:"); info.links.forEach(b => console.log("  " + b));
  console.log("");
  console.log("本文: " + info.body);
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

