/* build-static.js — 残り6ページ種別を移植する */
const fs = require("fs");
const { shell } = require("./shell.js");

function write(name, from, body) {
  const out = shell({ name: name.label, from: from, slider: false,
                      title: name.title, body: body.trim() });
  fs.writeFileSync("templates/creator/mode/" + name.file + ".tpl", out);
  console.log("  " + name.label.padEnd(16) + String(out.split("\n").length).padStart(4) + " 行");
}

write({ file: "company", label: "会社概要" }, "（タグのみ）", [
  '<div class="company">',
  '\t<p><img src="/design/isplanning/companytitle.gif" border="0" alt="会社紹介"></p>',
  '\t<{if $company.image_url}><p><img src="<{$company.image_url}>" alt="会社概要"></p><{/if}>',
  '\t<{$company.content}>',
  '</div>'
].join("\n"));

const guideBody = fs.readFileSync("templates/creator/port-src/guide-body.tpl", "utf8");
write({ file: "guide", label: "ご利用案内" }, "（現行の文面）", [
  '<div id="O_adminPagearea" class="M_mainContents shop-guide">',
  guideBody.trim(),
  '</div>'
].join("\n"));

const contractBody = fs.readFileSync("templates/creator/port-src/contract-body.tpl", "utf8");
write({ file: "contract", label: "特定商取引法" }, "（現行の文面）", [
  '<div class="company transaction">',
  contractBody.trim(),
  '</div>'
].join("\n"));

let privacy = fs.readFileSync("templates/creator/port-src/privacy-body.tpl", "utf8");
privacy = privacy.replace(/^<\{\*[\s\S]*?\*\}>\s*/, "");
write({ file: "policy", label: "プライバシー", title: "個人情報保護ポリシー" }, "（現行の文面）", [
  '<div id="O_adminPagearea" class="company">',
  '\t<h2>個人情報保護ポリシー</h2>',
  '\t<{* ※ このページ種別だけリファレンスにタグがありません。',
  '\t     現行サイトの文面をそのまま使っています。 *}>',
  privacy.trim(),
  '</div>'
].join("\n"));

const { newsList, newsDetail } = require("./_news-blocks.js");

write({ file: "news-list", label: "お知らせ一覧", title: "お知らせ一覧ページ" }, "（タグのみ）", newsList);

write({ file: "news-detail", label: "お知らせ詳細" }, "（タグのみ）", newsDetail);

console.log("");
console.log("会社概要・お知らせはタグから、ご利用案内・特商法・プライバシーは現行の文面から。");
console.log("※ ご利用案内と特商法は 2026-09-09 にタグから文面に戻しました。");
console.log("   プレビューで、タグが公開中のページとは別の記録を読んでいると分かったためです。");
console.log("   管理画面の値を現行に合わせて入れ直せば、いつでもタグに戻せます。");

