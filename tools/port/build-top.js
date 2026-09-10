/* ---------------------------------------------------------------------------
   build-top.js — トップページを移植する

   山口様のご指摘のうち、このページに関わるもの:
     カテゴリのバナーがない / お知らせがない / 説明文がない / コラムの欄がない
     商品画像がすべてLサイズ / 商品特殊表示がない

   どれも「元テンプレートにあったものを持ってこなかった」だけです。
   design_mainpage.txt の中身をそのまま使います。
--------------------------------------------------------------------------- */
const fs = require("fs");
const { shell } = require("./shell.js");
const { grid, ranking, news } = require("./items.js");
const { tiles } = require("./_tiles.js");
const { rewrite } = require("./url-map.js");

let body = fs.readFileSync("templates/basic-utf8/design_mainpage.html", "utf8");

/* .M_mainContents は shell 側が開きます。元テンプレートの開始タグは外します
   （元は閉じていません。ベーシックが自動で閉じていたためです）。 */
body = body.replace(/^\s*<div class="M_mainContents">\s*/, "");

/* --- お知らせ ------------------------------------------------------------- */
body = body.replace("[NEWSEVENT2N]", news());
/* 「お知らせの一覧」のリンク先はベーシックのURLのままなので直します */
body = body.replace('href="/new/index.html?mode=list"', 'href="<{$url.news}>"');

/* --- ランキング ----------------------------------------------------------- */
body = body.replace("[IF_RANKING]", "<{if $ranking_item.has_item}>")
           .replace("[ENDIF_RANKING]", "<{/if}>");
const rankStart = body.indexOf("[RANKING_1_5]");
const rankEnd = body.indexOf("[ENDRANKING]") + "[ENDRANKING]".length;
if (rankStart < 0 || rankEnd < 0) { console.error("ランキングの範囲が取れません"); process.exit(1); }
body = body.slice(0, rankStart) + ranking() + body.slice(rankEnd);

/* --- 新着・おすすめ ------------------------------------------------------- */
body = body.replace("[NEW1NN]", grid("$new_item", "nw2", 16));
body = body.replace("[SUISEN1NN]", grid("$recommend_item", "rc", 12));
/* 「新着商品一覧はこちら」もベーシックのURLです */
body = body.replace('href="/shop/shopbrand.html?search="', 'href="<{$url.top}>"');

/* --- 商品レビュー --------------------------------------------------------- */
/* ※ 旧レビューは使いません
 *
 *    最初は $review_item.* で作りました。リファレンスに載っていて動くので、
 *    「今の見た目に近い」と考えたためです。**方針と食い違っていました。**
 *
 *      - 旧レビューは 2026年11月で終了します
 *      - この店舗はすでに u-komi に移っています（C30）
 *      - 現行サイトも、旧レビューが無ければこの枠をJSで隠しています
 *        （design_head_top.txt が #r_review_wrap を display:none に）
 *
 *    終わるものを新しく作り込むと、数か月後にまた作り直しになります。
 *    枠ごと出しません。u-komi は商品詳細に出ています。 */
const revStart = body.indexOf("[IF_REVIEW]");
const revEnd = body.indexOf("[ENDIF_REVIEW]") + "[ENDIF_REVIEW]".length;
if (revStart < 0 || revEnd < 0) { console.error("レビュー枠の範囲が取れません"); process.exit(1); }
body = body.slice(0, revStart) + body.slice(revEnd);


/* --- 最近チェックした商品 ------------------------------------------------- */
body = body.replace("[IF_RECENT]", "<{if $recently_item.has_item}>")
           .replace("[ENDIF_RECENT]", "<{/if}>");
/* ※ 最近チェックした商品は、新着や定番とは別のマークアップです
 *    （公開ページ実測。td.itemBox と区切りの mk_main_p_line.gif）。
 *    grid() で出していたので、区切りとアイコンが落ちていました。 */
body = body.replace("[RECENT2]",
  tiles({ list: "$recently_item.list", name: "rcn", tableId: "recent", perRow: 4 }));

/* ※ 末尾の <!--.mainContents--></div> は外します。
     .M_mainContents は shell が開いて閉じます。残すと1つ閉じすぎになり、
     フッターが本文の外に飛び出します。 */
body = body.split("<!--.mainContents--></div>").join("");

/* --- URL --------------------------------------------------------------- */
const r = rewrite(body);
body = r.html;

const out = shell({ name: "トップ", from: "mainpage", slider: true, body: body.trim() });
fs.writeFileSync("templates/creator/mode/top.tpl", out);

console.log("トップ: " + out.split("\n").length + " 行");
console.log("  URL書換 " + r.rewritten + " 本 / 未対応 " + r.missing.length + (r.missing.length ? " " + r.missing.join(" ") : ""));
const leftover = out.match(/\[[A-Z_0-9]{3,}\]/g);
console.log("  未変換のベーシックタグ: " + (leftover ? [...new Set(leftover)].join(" ") : "なし"));
