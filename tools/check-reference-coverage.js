const fs = require("fs");

const EXPECTED = [
  [/^\$item\.subscription|^\$cart\.list\.subscription|subscription_/, "定期購入。この店舗は扱っていません"],
  [/^\$item\.option_sku|is_option_sku|is_option_image/,               "SKU別表示はオプション契約が別途必要"],
  [/^\$amazonpay\./,                                                  "Amazon Pay 未導入"],
  [/^\$paid\./,                                                       "Paid 未導入"],
  [/review\.(list|star_html|average|total_count|is_enabled|has_item|post_url|list_url|url)/, "旧レビューは2026年11月終了。u-komi に移行済み（C30）"],
  [/^\$review_item\./,                                                "同上"],
  [/^\$bulk\.|^\$bulk_menu\.|is_bulk|bulk_name|bulk_url|^\$cart\.bulk\./, "まとめ買い割引は未設定"],
  [/^\$item\.sell_(start|end)\.|is_sell_(start|end)|is_within_sell_period/, "販売期間指定は未使用"],
  [/release_date|has_release_date|is_released|is_reservation_sale|reservation_sale_note/, "予約販売・発売日は未使用"],
  [/^\$item\.sale_(start|end)\.|has_sale_period/,                     "セール期間の日時内訳は表示しない"],
  [/^\$shop\.is_mail_magazine_enabled|^\$url\.mail_magazine/,         "メルマガ未使用"],
  [/^\$member\.(id|group_id|group_name|point)/,                       "会員別表示は現行サイトにありません"],
  [/^\$shop\.is_point_enabled|point_html|^\$item\.point$|^\$url\.point/, "ポイント制度は未使用"],
];

const norm = s => s.replace(/\[[^\]]*\]/g, "");

const used = new Set();
const dir = "templates/creator/mode";
for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".tpl"))) {
  const s = fs.readFileSync(dir + "/" + f, "utf8");
  for (const m of s.matchAll(/\$[a-zA-Z_][a-zA-Z0-9_.\[\]]*/g)) used.add(norm(m[0]));
}
for (const f of fs.readdirSync("package/modules").filter(x => x.endsWith(".tpl"))) {
  const s = fs.readFileSync("package/modules/" + f, "utf8");
  for (const m of s.matchAll(/\$[a-zA-Z_][a-zA-Z0-9_.\[\]]*/g)) used.add(norm(m[0]));
}

const rows = fs.readFileSync("inventory/creator-tags-reference.tsv", "utf8")
  .split("\n").slice(1).filter(Boolean).map(l => l.split("\t")).filter(c => c.length >= 2);

const bySec = {};
for (const [tag, sec] of rows) (bySec[sec] = bySec[sec] || new Set()).add(norm(tag));

let unexplained = 0, explained = 0;
const out = [];
for (const sec of Object.keys(bySec).sort()) {
  const miss = [...bySec[sec]].filter(t => !used.has(t)).sort();
  const keep = [];
  for (const t of miss) {
    const hit = EXPECTED.find(([re]) => re.test(t));
    if (hit) { explained++; continue; }
    keep.push(t);
  }
  if (keep.length) { unexplained += keep.length; out.push([sec, keep]); }
}

console.log("公式リファレンス : " + new Set(rows.map(r => norm(r[0]))).size + " 種");
console.log("使っているタグ   : " + used.size + " 種");
console.log("使わない理由あり : " + explained + " 種");
console.log("※ 説明がつかない : " + unexplained + " 種\n");

for (const [sec, keep] of out) {
  console.log("=== " + sec + "  " + keep.length + " 件 ===");
  console.log("  " + keep.join("\n  "));
}

fs.writeFileSync("inventory/creator-tags-unused.tsv",
  "tag\tsection\n" + out.flatMap(([s, k]) => k.map(t => t + "\t" + s)).join("\n") + "\n");
console.log("\ninventory/creator-tags-unused.tsv に書き出しました");

