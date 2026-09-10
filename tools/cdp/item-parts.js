/* ---------------------------------------------------------------------------
   item-parts.js — 1商品を、部品ごとに現行と突き合わせます

   🔴 商品詳細には「カテゴリ専用テンプレート」が3つありました

      ct261 / ct646 / ct664 の3つだけ、現行は別のHTMLで出ています。
      違いは文言だけではありません。

        画像   既定は #itemImg + サムネイル（スライダー）
               3つは #Item_detail_Image に1枚（[RESIZE_IMAGE_500]）
        レビュー 既定は外部ウィジェット
               3つは MakeShop純正の枠（[REVIEW_VIEW_ALL]）

      item-compare.js は「数の増減」を見ますが、こちらは
      **どの部品が、いくつ出ているか**を並べます。

     node tools/cdp/item-parts.js 051000000001
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");

const PTK = "45bdf24edcff928f2fc86d299ab4a0dd03aeee10";
const EXPR = fs.readFileSync(__dirname + "/exprs/item-parts.js", "utf8");
const code = process.argv[2] || "051000000001";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const KEYS = [
  ["itemImg", "#itemImg（既定の画像枠）"],
  ["detailImg", "#Item_detail_Image（専用の画像枠）"],
  ["thumbs", "サムネイル"],
  ["mainList", "スライダーの画像"],
  ["imgInBox", "画像枠の中の img"],
  ["zoomIcon", "拡大画像アイコン"],
  ["review", "外部レビューウィジェット"],
  ["nativeReview", "純正レビュー枠"],
  ["reviewLink", "レビューへのリンク"],
  ["saleBox", ".saleBox"],
  ["saleP", "p.sale"],
  ["saleRate", "p.saleRate"],
  ["zaiko9", "p.zaiko9"],
  ["zaiko", "p.zaiko"],
  ["recent", "最近見た商品"],
  ["group", "商品グループ"],
  ["lines", "本文の行数"]
];

(async () => {
  const p = await page();
  await p.navigate("about:blank"); await sleep(250);
  await p.navigate("https://www.isp-sp.com/shopdetail/" + code + "/"); await sleep(4500);
  const live = await p.evaluate(EXPR);
  await p.navigate("about:blank"); await sleep(250);
  await p.navigate("https://www.isp-sp.com/view/item/" + code + "?ptk=" + PTK); await sleep(4500);
  const nu = await p.evaluate(EXPR);
  p.close();

  console.log("商品 " + code);
  console.log("");
  console.log("部品".padEnd(30) + " 現行  移植版");
  let diff = 0;
  for (const [k, label] of KEYS) {
    const a = live[k], b = nu[k];
    const same = a === b;
    if (!same) { diff++; }
    console.log("  " + label.padEnd(28) + String(a).padStart(5) + String(b).padStart(6) +
      (same ? "" : "   ← ちがう"));
  }
  console.log("");
  console.log("  タブ 現行 : " + (live.tabs || []).join(" ｜ "));
  console.log("  タブ 移植 : " + (nu.tabs || []).join(" ｜ "));
  console.log("");
  console.log("  見出し 現行 : " + (live.heads || []).join(" / "));
  console.log("  見出し 移植 : " + (nu.heads || []).join(" / "));

  /* 本文にあって、相手に無い言葉 */
  function chunks(s) {
    return (s || "").split(/[。、｜|・\n]/).map(x => x.trim()).filter(x => x.length >= 6);
  }
  const inLive = new Set(chunks(live.text)), inNu = new Set(chunks(nu.text));
  const lost = [...inLive].filter(x => !inNu.has(x));
  const extra = [...inNu].filter(x => !inLive.has(x));
  console.log("");
  console.log("  現行にあって移植版に無い言葉 " + lost.length + " 件");
  lost.slice(0, 8).forEach(x => console.log("     - " + x.slice(0, 60)));
  console.log("  移植版にあって現行に無い言葉 " + extra.length + " 件");
  extra.slice(0, 8).forEach(x => console.log("     + " + x.slice(0, 60)));
  console.log("");
  console.log(diff ? "🔴 ちがう部品 " + diff + " 件" : "✅ 部品はすべて同じ数です");
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
