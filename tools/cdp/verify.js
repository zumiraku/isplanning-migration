/* verify.js — 配信されたプレビューを、機械で点検する */
const fs = require("fs");

const DIR = "tools/cdp/preview-out";

const CHECKS = [
  ["*", "ヘッダー", "headerWrap", 1],
  ["*", "左メニュー", "M_leftContents", 1],
  ["*", "フッター", "footer_guideWrap", 1],
  ["*", "営業日カレンダーの枠", "sideCalender", 1],
  ["*", "カレンダーの中身", "休業日（土・日・祝は休業日です）", 1],
  ["*", "検索がプラットフォームに繋がっている", "#makeshop-common-search-url", 1],
  ["*", "検索キーワード欄", 'data-id="makeshop-search-keyword"', 1],
  ["*", "未展開のタグが無い", "<{", 0, 0],
  ["*", "空の src が無い", 'src=""', 0, 0],
  ["*", "前の版が残っていない", "utilbar", 0, 0],
  ["*", "前の版のヘッダーが残っていない", "site-header", 0, 0],
  ["*", "送信フォームの検索が無い", '<form class="searchbox"', 0, 0],

  ["top", "お知らせ", "top-news-ttl", 1],
  ["top", "スライダー", "M_slider", 1],
  ["top", "商品リンク", "/view/item/", 10],
  ["detail", "数量欄", "quantityInput", 1],
  ["detail", "カートボタン", "goCart", 1],
  ["detail", "拡大表示", "data-zoom", 1],
  ["detail", "商品別特殊表示", "個入", 1],
  ["detail", "カートの印", "makeshop-item-cart-entry-url", 1],
  ["category", "一覧セル", "categorylist", 4],
  ["category", "商品リンク", "/view/item/", 10],
  ["category", "並び替え", "sort=product", 1],
  ["search", "検索窓", "r_searchInput", 1],
  ["cart", "カゴ", "basket", 1],
  ["news-list", "一覧", "infoList", 1],
  ["news-detail", "日付", "infodate", 1],
  ["guide", "目次", "O_guideAnchor", 1],
  ["guide", "買い物方法", "about_flow", 1],
  ["guide", "納品書・領収書", "about_receipt", 1],
  ["company", "見出しは1つだけ", "<h2>会社概要</h2>", 1, 1],
  ["company", "本文の入れ物は1つだけ", "id=\"O_adminPagearea\"", 1, 1],
  ["contract", "サイト名称", "サイト名称", 1],
  ["contract", "引き渡し10日", "10日以内", 1],
  ["contract", "古い7日が消えた", "7日以内", 0, 0],
  ["policy", "本文", "個人情報", 1]
];

const files = fs.readdirSync(DIR).filter(f => f.endsWith(".html"));
const html = {};
files.forEach(f => { html[f.replace(/\.html$/, "")] = fs.readFileSync(DIR + "/" + f, "utf8"); });

let ng = 0, total = 0;
for (const [where, label, needle, min, max] of CHECKS) {
  const targets = where === "*" ? Object.keys(html).sort() : (html[where] ? [where] : []);
  for (const t of targets) {
    const n = html[t].split(needle).length - 1;
    const ok = n >= min && (max === undefined || n <= max);
    total++;
    if (!ok) {
      ng++;
      console.log("※ " + t.padEnd(13) + label.padEnd(30) + n + " 件（" +
        (max === 0 ? "0件であるべき" : max !== undefined ? min + "〜" + max + "件" : min + "件以上") + "）");
    }
  }
}

console.log("");
console.log("点検 " + total + " 件 / 通らなかったもの " + ng + " 件");
if (ng) { process.exit(1); }
console.log("OK 全部通りました");

