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
body = body.replace("[NEW1NN]", grid("$new_item", "nw2"));
body = body.replace("[SUISEN1NN]", grid("$recommend_item", "rc"));
/* 「新着商品一覧はこちら」もベーシックのURLです */
body = body.replace('href="/shop/shopbrand.html?search="', 'href="<{$url.top}>"');

/* --- 商品レビュー --------------------------------------------------------- */
/* 🔴 旧レビューは2026年11月で終了し、この店舗は u-komi に移っています（C30）。
      ただし $review_item.* はリファレンスに載っていて、いまも動きます。
      **終わるまでは出す**のが、いまの見た目に近い状態です。 */
body = body.replace("[IF_REVIEW]", "<{if $review_item.is_enabled and $review_item.has_item}>")
           .replace("[ENDIF_REVIEW]", "<{/if}>");
body = body.replace("[REVIEW_VIEW_ALL_2]", `<{section name=rv loop=$review_item.list}>
<div class="M_reviewBox">
  <div class="M_reviewImg"><a href="<{$review_item.list[rv].url}>"><img src="<{$review_item.list[rv].image_S}>" alt="<{$review_item.list[rv].name}>" border="0"></a></div>
  <div class="M_reviewInfo">
    <p class="M_reviewName"><a href="<{$review_item.list[rv].url}>"><{$review_item.list[rv].name}></a></p>
    <p class="M_reviewRate"><{$review_item.list[rv].star_html}></p>
    <p class="M_reviewRead"><{$review_item.list[rv].content}></p>
    <p class="M_reviewDate"><{$review_item.list[rv].reviewer_name}>　<{$review_item.list[rv].date.year}>/<{$review_item.list[rv].date.month}>/<{$review_item.list[rv].date.day}></p>
  </div>
</div>
<{/section}>`);

/* --- 最近チェックした商品 ------------------------------------------------- */
body = body.replace("[IF_RECENT]", "<{if $recently_item.has_item}>")
           .replace("[ENDIF_RECENT]", "<{/if}>");
body = body.replace("[RECENT2]", grid("$recently_item", "rcn"));

/* 🔴 末尾の <!--.mainContents--></div> は外します。
     .M_mainContents は shell が開いて閉じます。残すと1つ閉じすぎになり、
     フッターが本文の外に飛び出します。 */
body = body.split("<!--.mainContents--></div>").join("");

/* --- URL --------------------------------------------------------------- */
const r = rewrite(body);
body = r.html;

const out = shell({ name: "トップ", from: "mainpage", slider: true, body: body.trim() });
fs.writeFileSync("templates/creator/mode/top-body.tpl", out);

console.log("トップ: " + out.split("\n").length + " 行");
console.log("  URL書換 " + r.rewritten + " 本 / 未対応 " + r.missing.length + (r.missing.length ? " " + r.missing.join(" ") : ""));
const leftover = out.match(/\[[A-Z_0-9]{3,}\]/g);
console.log("  未変換のベーシックタグ: " + (leftover ? [...new Set(leftover)].join(" ") : "なし"));
