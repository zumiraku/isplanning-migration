/* ---------------------------------------------------------------------------
   build-static.js — 残り6ページ種別を移植する

     お知らせ一覧 / お知らせ詳細 / 会社概要 / ご利用案内 / 特定商取引法 /
     プライバシーポリシー

   🔴 この6枚には design_*.txt がありません

      ベーシックではプラットフォームが中身を描いていて、店舗のテンプレートは
      存在しません。だから「移植元が無い」のですが、**中身は管理画面に
      入っている**ので、クリエイターでは専用タグで取り出せます。

        $company.content     会社概要テキスト
        $guide.order / payment / delivery / tax / return
        $contract.dealer / manager / address / tel / mail / …（14項目）
        $news.*              お知らせ

      これまでのこちらの版は、**この6枚を手書きしていました。** タグは
      1つも使っていません（$guide. が0件、$contract. が0件、$company. が0件）。
      山口様が気づかれていない欠落で、check-reference-coverage.js が
      21件として拾ったものです。手書きだと、管理画面で直しても
      サイトに反映されません。

   🔴 プライバシーポリシーだけはタグがありません

      リファレンスに policy のページがありません（9セクションのうち
      company / guide / contract はあるのに）。現行サイトの文面をそのまま
      使います。build-privacy-body.sh が書き出した本文を読み込みます。

   🔴 お知らせ一覧は、ベーシックでは枠の外にありました

      /new/index.html?mode=list は m_sys_common.css だけを読む素のページで、
      ヘッダーも左メニューもフッターも付いていません。クリエイターでは
      ページ種別なので、枠の中に入ります。**ここは移植というより改善**です。
--------------------------------------------------------------------------- */
const fs = require("fs");
const { shell } = require("./shell.js");

function write(name, from, body) {
  const out = shell({ name: name.label, from: from, slider: false, body: body.trim() });
  fs.writeFileSync("templates/creator/mode/" + name.file + ".tpl", out);
  console.log("  " + name.label.padEnd(16) + String(out.split("\n").length).padStart(4) + " 行");
}

/* --- 会社概要 -------------------------------------------------------------- */
write({ file: "company", label: "会社概要" }, "（タグのみ）", [
  '<div id="O_adminPagearea" class="company">',
  '\t<h2>会社概要</h2>',
  '\t<{if $company.image_url}><p><img src="<{$company.image_url}>" alt="会社概要"></p><{/if}>',
  '\t<{$company.content}>',
  '</div>'
].join("\n"));

/* --- ご利用案内 ------------------------------------------------------------ */
write({ file: "guide", label: "ご利用案内" }, "（タグのみ）", [
  '<div id="O_adminPagearea" class="company guide">',
  '\t<h2>ご利用案内</h2>',
  '',
  '\t<h3 id="about_order">商品のご注文方法</h3>',
  '\t<div class="article"><{$guide.order}></div>',
  '',
  '\t<h3 id="about_payment">お支払いについて</h3>',
  '\t<div class="article"><{$guide.payment}></div>',
  '',
  '\t<h3 id="about_delivaly">配送について</h3>',
  '\t<div class="article"><{$guide.delivery}></div>',
  '',
  '\t<h3 id="about_tax">消費税について</h3>',
  '\t<div class="article"><{$guide.tax}></div>',
  '',
  '\t<h3 id="about_return">返品について</h3>',
  '\t<div class="article"><{$guide.return}></div>',
  '',
  '\t<{* 🔴 id は現行サイトのアンカーに合わせてあります。',
  '\t     フッターや商品ページから /view/guide#about_payment のように',
  '\t     直接飛んでくるリンクが十数本あり、id が変わると全部',
  '\t     ページ頭に着地します。 *}>',
  '</div>'
].join("\n"));

/* --- 特定商取引法 ---------------------------------------------------------- */
const CONTRACT_ROWS = [
  ["販売業者", "dealer"],
  ["運営統括責任者", "manager"],
  ["所在地", "address"],
  ["電話番号", "tel"],
  ["メールアドレス", "mail"],
  ["商品代金以外の必要料金", "other_charge"],
  ["申し込み有効期限", "expire_app"],
  ["不良品", "defective"],
  ["販売数量", "amount"],
  ["引き渡し時期", "receive_date"],
  ["お支払い方法", "pay_method"],
  ["お支払い期限", "expire_pay"],
  ["返品期限", "expire_return"],
  ["返品送料", "return_charge"]
];
write({ file: "contract", label: "特定商取引法" }, "（タグのみ）", [
  '<div class="company transaction">',
  '\t<h2>特定商取引に関する法律に基づく表示</h2>',
  '\t<table class="tbl01">'
].concat(CONTRACT_ROWS.map(function (r) {
  return '\t\t<tr><th width="150">' + r[0] + '</th><td><{$contract.' + r[1] + '}></td></tr>';
})).concat([
  '\t</table>',
  '\t<{* 🔴 現行サイトの表には「サイト名称」「適格請求書事業者登録番号」の',
  '\t     行もあります。リファレンスの14項目には無いので、管理画面の',
  '\t     どれかの欄に手で書き足されている可能性が高いです。',
  '\t     **プレビューで実物を見て、足りなければ追記します。** *}>',
  '</div>'
]).join("\n"));

/* --- プライバシーポリシー --------------------------------------------------- */
let privacy = fs.readFileSync("templates/creator/mode/privacy-body.tpl", "utf8");
/* 生成元のコメント見出しは二重エンコードで読めません。落とします。 */
privacy = privacy.replace(/^<\{\*[\s\S]*?\*\}>\s*/, "");
write({ file: "policy", label: "プライバシー" }, "（現行の文面）", [
  '<div id="O_adminPagearea" class="company">',
  '\t<h2>個人情報保護ポリシー</h2>',
  '\t<{* 🔴 このページ種別だけリファレンスにタグがありません。',
  '\t     現行サイトの文面をそのまま使っています。 *}>',
  privacy.trim(),
  '</div>'
].join("\n"));

/* --- お知らせ一覧 ---------------------------------------------------------- */
write({ file: "news-list", label: "お知らせ一覧" }, "（タグのみ）", [
  '<div id="O_adminPagearea" class="company">',
  '\t<h2>お知らせ一覧</h2>',
  '\t<{if $news.has_item}>',
  '\t<ul class="infoList">',
  '\t<{section name=n loop=$news.list}>',
  '\t\t<li>',
  '\t\t\t<span class="infodate">[<{$news.list[n].date.year}>/<{$news.list[n].date.month}>/<{$news.list[n].date.day}>]</span>',
  '\t\t\t<a class="infoa" href="<{$news.list[n].url}>"><{$news.list[n].title}></a>',
  '\t\t</li>',
  '\t<{/section}>',
  '\t</ul>',
  '',
  '\t<div class="M_pager">',
  '\t<{if $news.pager.has_item}>',
  '\t  <{if not $news.pager.is_first}><a href="<{$news.pager.first_url}>">最初へ</a> <a href="<{$news.pager.prev_url}>" rel="prev">前へ</a><{/if}>',
  '\t  <{section name=p loop=$news.pager.list}>',
  '\t    <{if $news.pager.list[p].is_current_page}><span><{$news.pager.list[p].number}></span>',
  '\t    <{else}><a href="<{$news.pager.list[p].url}>"><{$news.pager.list[p].number}></a><{/if}>',
  '\t  <{/section}>',
  '\t  <{if not $news.pager.is_last}><a href="<{$news.pager.next_url}>" rel="next">次へ</a> <a href="<{$news.pager.last_url}>">最後へ</a><{/if}>',
  '\t<{/if}>',
  '\t</div>',
  '\t<{else}>',
  '\t<p>お知らせはまだありません。</p>',
  '\t<{/if}>',
  '</div>'
].join("\n"));

/* --- お知らせ詳細 ---------------------------------------------------------- */
write({ file: "news-detail", label: "お知らせ詳細" }, "（タグのみ）", [
  '<div id="O_adminPagearea" class="company">',
  '\t<p class="M_topicPath"><a href="<{$url.top}>">ホーム</a> &nbsp;&gt; <a href="<{$url.news}>">お知らせ</a></p>',
  '\t<h2><{$news.title}></h2>',
  '\t<p class="infodate"><{$news.date.year}>年<{$news.date.month}>月<{$news.date.day}>日</p>',
  '\t<div class="article"><{$news.content}></div>',
  '\t<p class="M_pager">',
  '\t\t<{if $news.prev_url}><a href="<{$news.prev_url}>" rel="prev">前のお知らせ</a><{/if}>',
  '\t\t<a href="<{$url.news}>">お知らせ一覧</a>',
  '\t\t<{if $news.next_url}><a href="<{$news.next_url}>" rel="next">次のお知らせ</a><{/if}>',
  '\t</p>',
  '</div>'
].join("\n"));

console.log("");
console.log("🔴 このうち会社概要・ご利用案内・特商法は、これまで手書きでした。");
console.log("   管理画面で直してもサイトに出ない状態だったので、タグに置き換えています。");
