/* ---------------------------------------------------------------------------
   pages.js — 現行と移植版の「同じページ」の対応。実測で確かめたものだけ。

   🔴 現行のURLを取り違えると、比べる相手がトップページになります

      `/shopbrand/ct5/` は**存在しません**。301でトップに飛びます。それを
      現行のカテゴリだと思って比べていました。トップ同士を比べているような
      ものなので、ヘッダーもフッターも当然一致します。**気づけません。**

      同じ間違いを3つしていました。

        /shopbrand/ct5/        → / （ct番号のURLは新しい形。旧は /shopbrand/003/001/X/）
        /cart/                 → / （旧のカゴは /shop/basket.html）
        /html/tokusho.html     → / （旧の取引条件は /html/ordercontract.html）

      旧URLは package/url-bulk/categories-url.csv の「追加URL」列と
      inventory/redirect-map.csv から取り、1本ずつブラウザで開いて
      **飛ばされずにそのURLのまま出ること**を確かめてあります。

      landed() を必ず通してください。飛ばされたら測らずに 🔴 を出します。
--------------------------------------------------------------------------- */

/* [名前, 現行のパス, 移植版のパス] */
const PAGES = [
  ["トップ", "/", "/"],
  ["カテゴリ", "/shopbrand/003/001/X/", "/view/category/ct5"],
  ["商品詳細", "/shopdetail/003001000005/", "/view/item/003001000005"],
  ["カゴ", "/shop/basket.html", "/view/cart"],
  ["お知らせ一覧", "/new/index.html", "/view/news/list"],
  ["ご利用ガイド", "/html/info.html", "/view/guide"],
  ["会社概要", "/html/company.html", "/view/company"],
  ["取引条件", "/html/ordercontract.html", "/view/contract"],
  ["個人情報", "/html/privacy.html", "/view/policy"]
];

/* 開いた先が、頼んだパスと同じかどうか。
   末尾のスラッシュと問合せは無視します。 */
function landed(asked, got) {
  const a = String(asked).split("?")[0].replace(/\/+$/, "");
  const g = String(got || "").replace(/^https?:\/\/[^/]+/, "").split("?")[0].replace(/\/+$/, "");
  return a === g;
}

module.exports = { PAGES, landed };
