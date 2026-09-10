/* ---------------------------------------------------------------------------
   item-compare.js — 商品ページを、型ごとに現行と突き合わせます

   🔴 9,513商品のうち、1商品しか実測していませんでした

      商品詳細の検査は 003001000005（ノック式ボールペン）1件だけです。
      商品は型がいろいろあります。

        オプションあり / なし     選択肢の表と価格の連動
        品切れ                  カゴを出さず再入荷リンクを出す
        セール中                 セール枠と割引率
        サブ画像が多い            タブとギャラリー
        名入れ対応               名入れの入力欄
        見積依頼                 リンクの有無

      **型が違えばテンプレートの通り道も違います。** 1件通ったから
      9,513件通る、とは言えません。型ごとに代表を出して比べます。

     node tools/cdp/item-compare.js
     node tools/cdp/item-compare.js 000000020559

   ⚠️ プレビューの鍵（ptk）で任意の商品を開けることを確かめてあります。
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const PTK = "45bdf24edcff928f2fc86d299ab4a0dd03aeee10";

/* [商品コード, なぜ選んだか] */
const ITEMS = [
  ["003001000005", "標準（オプション1軸）"],
  ["000000020559", "品切れ・種類選択"],
  ["000000014246", "サブ画像17枚・13種選択"],
  ["000000020086", "名入れ欄あり"],
  ["003003000870", "セール中"],
  ["003002000091", "スマホ側にだけ品番がある"],
  ["003002000179", "入荷予定の記載あり"],
  ["003001000055", "スマホ側にだけ商品説明がある"]
];

const only = process.argv[2];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* 画面に出ている「意味のあるもの」を数えます */
const LOOK = `(function () {
  var b = document.body;
  var txt = b ? b.innerText.replace(/[\\s　]+/g, "") : "";
  function n(sel) { return document.querySelectorAll(sel).length; }
  return {
    title: document.title,
    textLen: txt.length,
    text: txt,
    price: n(".M_cl_taxPrice, .price, #M_itemPrice"),
    cart: n('a[href^="#makeshop-item-cart-entry-url"], .goCart, #goCart'),
    qty: n(".quantityInput, input[name=quantity], #quantity"),
    options: n("select, .makeshop-option-select"),
    images: n("#itemImg img, .M_imageThumbnail img, [data-zoom]"),
    tabs: n(".tab-list"),
    review: n(".review-container, #u_komi"),
    soldout: /品切れ|再入荷/.test(txt),
    sale: /セール|OFF/.test(txt),
    quote: n('a[href*="contact"], a[href*="mitsumori"], a[href*="#makeshop-item-contact-url"]'),
    unexpanded: (b ? b.innerHTML : "").indexOf("<{") >= 0
  };
})()`;

(async () => {
  const p = await page();
  let bad = 0;

  console.log("商品            型                         現行 / 移植版");
  for (const [code, why] of ITEMS) {
    if (only && only !== code) { continue; }

    await p.navigate("about:blank");
    await sleep(250);
    await p.navigate("https://www.isp-sp.com/shopdetail/" + code + "/");
    await sleep(4200);
    const live = await p.evaluate(LOOK);

    await p.navigate("about:blank");
    await sleep(250);
    await p.navigate("https://www.isp-sp.com/view/item/" + code + "?ptk=" + PTK);
    await sleep(4200);
    const nu = await p.evaluate(LOOK);

    const notes = [];
    function cmp(key, label, kind) {
      const a = live[key], b = nu[key];
      if (kind === "bool") {
        if (a !== b) { notes.push(label + " 現行" + (a ? "有" : "無") + "→移植" + (b ? "有" : "無")); }
        return;
      }
      if (kind === "atLeast") {
        if (a > 0 && b === 0) { notes.push(label + " が無くなった（現行 " + a + "）"); }
        return;
      }
      if (a !== b) { notes.push(label + " " + a + "→" + b); }
    }
    cmp("price", "価格", "atLeast");
    cmp("cart", "カートボタン", "atLeast");
    cmp("qty", "数量欄", "atLeast");
    cmp("options", "選択肢", "atLeast");
    cmp("images", "画像", "atLeast");
    cmp("review", "レビュー枠", "atLeast");
    cmp("quote", "見積・問合せ", "atLeast");
    cmp("soldout", "品切れ表示", "bool");
    cmp("sale", "セール表示", "bool");
    if (nu.unexpanded) { notes.push("🔴 未展開タグあり"); }
    if (nu.textLen < live.textLen * 0.5) {
      notes.push("本文が半分以下（" + live.textLen + "→" + nu.textLen + "）");
    }

    if (notes.length) { bad += notes.length; }
    console.log(code + "  " + why.padEnd(26) +
      (notes.length ? "🔴 " + notes.join(" / ") : "✅ 揃っています") +
      "   本文 " + live.textLen + "/" + nu.textLen);
  }

  p.close();
  console.log("");
  console.log(bad ? "🔴 気になるもの " + bad + " 件" : "✅ どの型も、現行と同じものが出ています");
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
