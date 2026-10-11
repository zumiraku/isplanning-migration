const PAGES = [
  ["トップ", "/", "/", 2],
  ["カテゴリ", "/shopbrand/003/001/X/", "/view/category/ct5", 4],
  ["商品詳細", "/shopdetail/003001000005/", "/view/item/003001000005", 3],
  ["カゴ", "/shop/basket.html", "/view/cart", 6],
  ["お知らせ一覧", "/new/index.html", "/view/news/list", 9],
  ["お知らせ詳細", "/new/2026-07-28-033258.html", "/view/news/20260728033258", 10],
  ["ご利用ガイド", "/html/info.html", "/view/guide", 11],
  ["会社概要", "/html/company.html", "/view/company", 12],
  ["取引条件", "/html/ordercontract.html", "/view/contract", 13],
  ["個人情報", "/html/privacy.html", "/view/policy", 14]
];

function landed(asked, got) {
  const a = String(asked).split("?")[0].replace(/\/+$/, "");
  const g = String(got || "").replace(/^https?:\/\/[^/]+/, "").split("?")[0].replace(/\/+$/, "");
  return a === g;
}

module.exports = { PAGES, landed };

