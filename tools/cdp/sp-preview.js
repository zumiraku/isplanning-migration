/* ---------------------------------------------------------------------------
   sp-preview.js — スマートフォンの名乗りで、実際に何が出るか

   ページ種別の「スマホ」欄は全部 0 文字です。空のまま切り替えて
   **スマホが真っ白になる**なら、それが一番大きな事故になります。

   デザインセットは「レスポンシブ」なので PC と同じページが出るはず、と
   記録には書いてあります。**書いてあることを信じずに、もう一度出します。**

     node tools/cdp/sp-preview.js

   見るもの
     - /smartphone/ に飛ばされないか
     - こちらのヘッダー・ドロワー・左メニューが入っているか
     - 375px 幅ではみ出さないか
     - 本文の文字数（真っ白でないこと）
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
/* 🔴 4種別しか見ていませんでした。実機幅でしか出ない崩れがあるので、
 *    ページ種別は全部まわします（2026-09-09）。 */
const PAGES = [
  ["トップ", 2], ["商品詳細", 3], ["商品カテゴリー", 4], ["商品検索結果", 5],
  ["買い物カゴ", 6], ["レビュー一覧", 7], ["レビュー投稿", 8],
  ["お知らせ一覧", 9], ["お知らせ詳細", 10], ["利用案内", 11],
  ["会社概要", 12], ["特定商取引法", 13], ["プライバシー", 14],
  ["まとめ買い割引", 18], ["会員制・年齢確認", 19]
];

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const LOOK = `(function () {
  var b = document.body;
  var doc = document.documentElement;
  /* 🔴 祖先が overflow で切っているものは、はみ出しではありません。
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
    /* 🔴 トップのプレビューURLは、サイトのルートそのものです
     *
     *      トップ            https://www.isp-sp.com/?ptk=…
     *      会員制・年齢確認   https://www.isp-sp.com/?ptk=…   ← 同じ
     *
     *    直前に別のページ種別をプレビューしていると、タブはすでにその
     *    URLにいます。「isp-sp.com が入るまで」で待つと最初から満たされ、
     *    **前のページを測ります。** トップの本文が 52文字（＝会員制の
     *    著作権表示）と出たのはこれです。いったん空ページへ行って、
     *    タブの状態を必ずリセットします。 */
    await p.navigate("about:blank");
    await sleep(400);
    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
    let ready = false;
    for (let i = 0; i < 40 && !ready; i++) {
      await sleep(500);
      ready = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
    }
    if (!ready) { console.log(name.padEnd(12) + "🔴 編集画面が開けません"); ng++; continue; }

    /* 🔴 前の実行のプレビューURLが残っていると、それを測ってしまいます
     *
     *    押したあと「URLに isp-sp.com が入るまで」待っていました。タブが
     *    **前回のプレビューのまま**だと、その条件は最初から満たされていて、
     *    古いページをそのまま測ります。実際、トップの本文が 52文字
     *    （＝会員制ページの著作権表示だけ）と出ました。
     *    **押す前のURLを控えて、変わるまで**待ちます。 */
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

    /* 🔴 まとめ買い割引（18）のプレビューURLは 404 です
     *
     *    機能が有効になっていないページ種別なので、プレビューが
     *    `/error/404.html` を返し、その404ページが3秒でトップへ飛ばします。
     *    いまはベーシックモードなので、スマホの名乗りだとトップが
     *    `/smartphone/` へ転送されます。**こちらのテンプレートの問題では
     *    ありません**（PCの名乗りでも同じ404です。sp-redirect.js で確認）。 */
    const marks = [];
    const toSp = r.url.indexOf("/smartphone/") >= 0;
    if (type === 18 && toSp) {
      console.log(name.padEnd(12) + "－ プレビューURLが404（機能が無効なページ種別）。テンプレートは " +
        "保存済み。sp-redirect.js で確認済み");
      continue;
    }
    /* 🔴 会員制・年齢確認（19）は、著作権表示だけ返すのが正しい動作です
     *
     *    中身は Basics 標準のゲートページで、こう書かれています。
     *
     *      <{if $member_verification.is_enabled}> … 会員確認 … <{/if}>
     *      <{if $age_verification.is_enabled}>    … 年齢確認 … <{/if}>
     *      <p class="copyright"><{$shop.copyright}></p>
     *
     *    この店舗は会員確認も年齢確認も使っていないので、両方の if が
     *    偽になり、**著作権表示の52文字だけ**が残ります。ヘッダーも
     *    フッターも元から呼んでいません（tools/cdp/box-out/type19.tpl）。
     *    どちらかの機能を入れたときだけ表に出るページです。 */
    if (type === 19) {
      console.log(name.padEnd(12) + "－ 会員確認・年齢確認とも無効なので著作権表示のみ（" +
        r.text + "字）。Basics標準のゲートページで、正しい挙動です");
      continue;
    }
    marks.push(toSp ? "🔴 /smartphone/ へ転送" : "PCページ○");
    marks.push("本文 " + r.text + "字" + (r.text > 800 ? "○" : " 🔴"));
    marks.push("ヘッダー" + (r.header ? "○" : "🔴"));
    marks.push("ドロワー" + (r.drawer ? "○" : "🔴"));
    marks.push("左メニュー" + (r.leftmenu ? "○" : "－"));
    marks.push("フッター" + (r.footer ? "○" : "🔴"));
    marks.push("未展開タグ" + (r.unexpanded ? "🔴あり" : "0"));
    marks.push("横幅 " + r.scrollWidth + "/" + r.docWidth + (r.scrollWidth <= r.docWidth + 2 ? "○" : " 🔴"));

    if (toSp || r.text < 800 || !r.header || !r.drawer || !r.footer ||
        r.unexpanded || r.scrollWidth > r.docWidth + 2) { ng++; }

    console.log(name.padEnd(12) + marks.join(" "));
    if (r.over.length) { r.over.forEach(function (o) { console.log("      はみ出し " + o); }); }
  }

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
  console.log("");
  console.log(ng ? "🔴 スマホで気になるもの " + ng + " 件" : "✅ スマホ（iPhoneの名乗り・375px）でも同じページが正しく出ます");
  if (ng) { process.exit(1); }
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
