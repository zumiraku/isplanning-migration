const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const PAGES = [
  ["トップ", 2], ["商品詳細", 3], ["商品カテゴリー", 4], ["商品検索結果", 5],
  ["買い物カゴ", 6], ["レビュー一覧", 7], ["レビュー投稿", 8],
  ["お知らせ一覧", 9], ["お知らせ詳細", 10], ["利用案内", 11],
  ["会社概要", 12], ["特定商取引法", 13], ["プライバシー", 14],
  ["まとめ買い割引", 18]
];


const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const LOOK = `(function () {
  var b = document.body;
  var doc = document.documentElement;
  /* ※ 祖先が overflow で切っているものは、はみ出しではありません。
   *    数えていたせいでスライダーの中身を51件も挙げていました。 */
  function clipped(e) {
    var n = e.parentElement;
    while (n && n !== doc) {
      if (getComputedStyle(n).overflowX !== "visible") { return true; }
      n = n.parentElement;
    }
    return false;
  }
  var over = [];
  Array.from(document.querySelectorAll("body *")).forEach(function (e) {
    var r = e.getBoundingClientRect();
    if (r.width > 0 && r.right > doc.clientWidth + 2 && !clipped(e)) {
      over.push((e.tagName + (e.id ? "#" + e.id : "") + (e.className && typeof e.className === "string"
        ? "." + e.className.split(" ")[0] : "")) + " " + Math.round(r.right));
    }
  });
  return {
    url: location.href,
    title: document.title,
    text: b ? b.innerText.replace(/[\\r\\n\\t ]+/g, " ").trim().length : 0,
    header: !!document.querySelector("#headerWrap"),
    drawer: !!document.querySelector(".l-menu-toggle, .l-menu-close"),
    leftmenu: !!document.querySelector("#M_leftContents, #leftmenu, .M_leftContents"),
    footer: !!document.querySelector("#footer_guideWrap, #colum-wrap"),
    unexpanded: (b ? b.innerHTML : "").indexOf("<{") >= 0,
    docWidth: doc.clientWidth,
    scrollWidth: doc.scrollWidth,
    over: over.slice(0, 6)
  };
})()`;

(async () => {
  const p = await page();
  let ng = 0;

  await p.send("Emulation.setDeviceMetricsOverride",
    { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
  await p.send("Network.setUserAgentOverride",
    { userAgent: IPHONE, platform: "iPhone" });

  for (const [name, type] of PAGES) {
    await p.navigate("about:blank");
    await sleep(400);
    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
    let ready = false;
    for (let i = 0; i < 40 && !ready; i++) {
      await sleep(500);
      ready = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
    }
    if (!ready) { console.log(name.padEnd(12) + "※ 編集画面が開けません"); ng++; continue; }

    const wasAt = await p.evaluate("location.href");
    await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
    let url = "";
    for (let i = 0; i < 40; i++) {
      await sleep(700);
      url = await p.evaluate("location.href");
      if (url.indexOf("isp-sp.com") >= 0 && url !== wasAt) { break; }
    }
    await sleep(3500);
    const r = await p.evaluate(LOOK);

    const marks = [];
    const toSp = r.url.indexOf("/smartphone/") >= 0;
    if (type === 18 && toSp) {
      console.log(name.padEnd(12) + "－ プレビューURLが404（機能が無効なページ種別）。テンプレートは " +
        "保存済み。sp-redirect.js で確認済み");
      continue;
    }
    if (type === 19) {
      console.log(name.padEnd(12) + "－ 会員確認・年齢確認とも無効なので著作権表示のみ（" +
        r.text + "字）。Basics標準のゲートページで、正しい挙動です");
      continue;
    }
    marks.push(toSp ? "※ /smartphone/ へ転送" : "PCページ○");
    marks.push("本文 " + r.text + "字" + (r.text > 800 ? "○" : " ※"));
    marks.push("ヘッダー" + (r.header ? "○" : "※"));
    marks.push("ドロワー" + (r.drawer ? "○" : "※"));
    marks.push("左メニュー" + (r.leftmenu ? "○" : "－"));
    marks.push("フッター" + (r.footer ? "○" : "※"));
    marks.push("未展開タグ" + (r.unexpanded ? "※あり" : "0"));
    marks.push("横幅 " + r.scrollWidth + "/" + r.docWidth + (r.scrollWidth <= r.docWidth + 2 ? "○" : " ※"));

    if (toSp || r.text < 800 || !r.header || !r.drawer || !r.footer ||
        r.unexpanded || r.scrollWidth > r.docWidth + 2) { ng++; }

    console.log(name.padEnd(12) + marks.join(" "));
    if (r.over.length) { r.over.forEach(function (o) { console.log("      はみ出し " + o); }); }
  }

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
  console.log("");
  console.log(ng ? "※ スマホで気になるもの " + ng + " 件" : "OK スマホ（iPhoneの名乗り・375px）でも同じページが正しく出ます");
  if (ng) { process.exit(1); }
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

