/* ---------------------------------------------------------------------------
   gate-check.js — 会員制・年齢確認が本当に入っているのか

   ※ トップのプレビューが、会員制ページを返します。

        <head>  トップのもの（title / description / canonical = /）
        <body>  会員制ページのもの（.verify と著作権表示だけ）

      中の <{if $member_verification.is_enabled}> も
      <{if $age_verification.is_enabled}> も**偽**なので、中身は空です。
      つまり「ゲートを出す判断」と「ゲートの中身」が食い違っています。

      切り替え後に本当にお客様がこれを見るなら、**トップが真っ白**という
      最悪の事故です。設定そのものを見に行きます。

     node tools/cdp/gate-check.js
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const TRY = [
  ["会員設定", "https://shop1.makeshop.jp/makeshop/newmanager/member_config.html"],
  ["会員制設定", "https://shop1.makeshop.jp/makeshop/newmanager/shop_member_only.html"],
  ["ショップ設定", "https://shop1.makeshop.jp/makeshop/newmanager/shop_config.html"],
  ["基本設定", "https://shop1.makeshop.jp/makeshop/newmanager/basic_config.html"],
  ["年齢認証", "https://shop1.makeshop.jp/makeshop/newmanager/age_config.html"]
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();

  /* まず、いまのサイト本体（ベーシック）がゲートを出すか */
  await p.navigate("https://www.isp-sp.com/");
  await sleep(3500);
  const live = await p.evaluate(`(function(){
    return { url: location.href, title: document.title.slice(0, 40),
             verify: !!document.querySelector(".verify"),
             header: !!document.querySelector("#headerWrap"),
             text: document.body ? document.body.innerText.replace(/[\\r\\n\\t ]+/g, " ").trim().length : 0 };
  })()`);
  console.log("いまの本番トップ（ベーシック）");
  console.log("  " + JSON.stringify(live));
  console.log("");

  /* ゲートが cookie で通るものなら、その痕跡があるはずです */
  const cookies = await p.send("Network.getCookies", { urls: ["https://www.isp-sp.com/"] });
  const names = (cookies.result && cookies.result.cookies || []).map(c => c.name);
  console.log("isp-sp.com の cookie " + names.length + " 件");
  console.log("  " + names.join(" "));
  console.log("");

  /* 管理画面に設定の画面があるか、順に当たります */
  for (const [name, url] of TRY) {
    await p.navigate(url);
    await sleep(2500);
    const r = await p.evaluate(`(function(){
      var b = document.body ? document.body.innerText : "";
      var hit = [];
      b.split(/[\\r\\n]+/).forEach(function (line) {
        var t = line.replace(/[\\t ]+/g, " ").trim();
        if (t && /会員制|年齢|認証|閲覧制限/.test(t)) { hit.push(t.slice(0, 90)); }
      });
      var checked = [];
      Array.from(document.querySelectorAll("input[type=radio], input[type=checkbox]")).forEach(function (e) {
        if (e.checked && e.name) { checked.push(e.name + "=" + e.value); }
      });
      return { url: location.href, title: document.title.slice(0, 40),
               notFound: /見つかりません|not found|エラー/i.test(document.title),
               hit: hit.slice(0, 8), checked: checked.slice(0, 14) };
    })()`);
    console.log(name + "  → " + r.url.split("/").slice(-1)[0] + "  [" + r.title + "]");
    if (r.hit.length) { r.hit.forEach(h => console.log("     " + h)); }
    if (r.checked.length) { console.log("     選択: " + r.checked.join(" , ")); }
  }
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });
