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
/* 🔴 見出しも目次も、プラットフォームが出していました
 *
 *    最初は MakeShop のリファレンスの説明文をそのまま見出しにしました
 *    （商品のご注文方法 / お支払いについて / 配送について / 消費税について /
 *    返品について）。**現行サイトの見出しはどれも違います。**
 *
 *      買い物方法          #about_flow
 *      お支払・送料について  #about_payment
 *      お届けについて       #about_delivaly
 *      返品交換について     #about_return
 *      納品書・領収書について #about_receipt
 *
 *    さらに、上に「ショッピングガイド」の見出しと案内文、5本の目次まで
 *    出ています。**丸ごと移植しないと別のページになります。**
 *
 * 🔴 5番目の割り当てだけ確信がありません
 *
 *    リファレンスの5項目は order / payment / delivery / tax / return。
 *    現行の5節は flow / payment / delivaly / return / receipt。
 *    4つは素直に対応しますが、**「納品書・領収書」に当たる項目が
 *    リファレンスにありません**（tax は「消費税について」）。
 *    位置から tax に割り当てています。**プレビューで中身を見て確かめます。**
 *
 * 🔴 アンカーの id は変えられません
 *
 *    フッターや商品ページから /view/guide#about_payment のように
 *    直接飛んでくるリンクが十数本あります。id が変わると全部ページ頭に
 *    着地します。 */
const GUIDE_SECTIONS = [
  ["about_flow", "買い物方法", "order"],
  ["about_payment", "お支払・送料について", "payment"],
  ["about_delivaly", "お届けについて", "delivery"],
  ["about_return", "返品交換について", "return"],
  ["about_receipt", "納品書・領収書について", "tax"]
];
write({ file: "guide", label: "ご利用案内" }, "（タグのみ）", [
  '<div id="O_adminPagearea" class="M_mainContents shop-guide">',
  '\t<h3 class="heading cartHeading">ショッピングガイド</h3>',
  '\t<p>お買い物方法についてのご案内です。<br>お買い物をされる前に、一度目をお通し下さいませ。</p>',
  '\t<div id="O_guideAnchor">',
  '\t\t<ul class="txtList01 guide-list">'
].concat(GUIDE_SECTIONS.map(function (s) {
  return '\t\t\t<li><a href="#' + s[0] + '">' + s[1] + '</a></li>';
})).concat([
  '\t\t</ul>',
  '\t</div>',
  ''
]).concat(GUIDE_SECTIONS.map(function (s) {
  return [
    '\t<h3 class="heading" id="' + s[0] + '">' + s[1] + '</h3>',
    '\t<div><{$guide.' + s[2] + '}></div>',
    ''
  ].join("\n");
})).concat([
  '</div>'
]).join("\n"));

/* --- 特定商取引法 ---------------------------------------------------------- */
/* 🔴 現行の表は17行で、リファレンスの14項目では再現できません
 *
 *    最初は MakeShop の既定14項目を既定のラベルで並べました。公開中の
 *    ページと突き合わせたら、**5行足りず、ラベルが2つ違いました。**
 *
 *      足りない  適格請求書事業者登録番号 / 営業時間 / 定休日 / 販売価格
 *      ちがう    商品代金以外の必要料金 → 商品以外の必要代金
 *                申し込み有効期限       → 申し込みの有効期限
 *      使わない  お支払い期限（現行に行そのものが無い）
 *
 *    法律で要求されるページなので、行が消えるのは困ります。
 *
 *    現行のHTMLを見ると、インデントの揃った**手書きの表**でした。
 *    4行ぶんに対応するタグはリファレンスにありません。
 *
 *    折衷案にします。**タグがあるものはタグで**（管理画面で直せば反映
 *    される）、**無い4行は現行の文言のまま**。ラベルと並び順は現行どおり。
 *
 *    ⚠️ 静的にした4行は、管理画面から直せません。プレビューで実物を見て、
 *       タグから出せるものがあれば差し替えます。 */
const CONTRACT_ROWS = [
  ["販売業者", "dealer"],
  ["運営統括責任者", "manager"],
  ["所在地", "address"],
  ["電話番号", "tel"],
  ["メールアドレス", "mail"],
  ["適格請求書事業者登録番号", null, "T6122001024522"],
  ["営業時間", null, "10時～12時・13時～17時<br>お電話受付時間は、季節により変更となる場合がございます。"],
  ["定休日", null, "土・日・祝・年末年始・夏季休業日"],
  ["販売価格", null, "各商品詳細ページに税込価格で表示（一部税別表示）"],
  ["商品以外の必要代金", "other_charge"],
  ["申し込みの有効期限", "expire_app"],
  ["不良品", "defective"],
  ["販売数量", "amount"],
  ["引き渡し時期", "receive_date"],
  ["お支払い方法", "pay_method"],
  ["返品期限", "expire_return"],
  ["返品送料", "return_charge"]
];
write({ file: "contract", label: "特定商取引法" }, "（タグのみ）", [
  '<div class="company transaction">',
  '\t<h2>特定商取引に関する法律に基づく表示</h2>',
  '\t<table class="tbl01">'
].concat(CONTRACT_ROWS.map(function (r) {
  /* r[1] があればタグから、無ければ現行の文言をそのまま置きます。 */
  const value = r[1]
    ? "<{$contract." + r[1] + "}>"
    : "<{* 🔴 対応するタグがありません。現行の文言のままです *}>" + r[2];
  return '\t\t<tr><th width="150">' + r[0] + '</th><td>' + value + '</td></tr>';
})).concat([
  '\t</table>',
  '\t<{* 🔴 現行サイトの表には「サイト名称」「適格請求書事業者登録番号」の',
  '\t     行もあります。リファレンスの14項目には無いので、管理画面の',
  '\t     どれかの欄に手で書き足されている可能性が高いです。',
  '\t     **プレビューで実物を見て、足りなければ追記します。** *}>',
  '</div>'
]).join("\n"));

/* --- プライバシーポリシー --------------------------------------------------- */
/* 🔴 置き場所は templates/creator/port-src/ です
 *
 *    mode/ に置いたままにすると、check-css-coverage.sh が「出荷する
 *    テンプレート」として読んでしまい、もう使わないクラスを毎回
 *    報告します。前に一度、退役した設計を検査が測り続けていました。
 *
 * 🔴 このファイルは一部が二重エンコードでした
 *
 *    見出しとコメントだけが壊れていて、本文は正しいUTF-8。
 *    ファイル全体を変換すると、正しい部分のほうが壊れます。
 *    tools/port/fix-mojibake.js が行単位で直しました。 */
let privacy = fs.readFileSync("templates/creator/port-src/privacy-body.tpl", "utf8");
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
  '\t<{* 🔴 $news.pager.has_item はリファレンスにありません。',
  '\t     カテゴリと検索には $…pager.has_item があるのに、news-list だけ',
  '\t     載っていません。無いタグを条件にすると Smarty は黙って偽にするので、',
  '\t     **ページ送りが一度も出なくなります。** section は空配列なら何も',
  '\t     出さないので、囲む必要がありません。 *}>',
  '\t  <{if not $news.pager.is_first}><a href="<{$news.pager.first_url}>">最初へ</a> <a href="<{$news.pager.prev_url}>" rel="prev">前へ</a><{/if}>',
  '\t  <{section name=p loop=$news.pager.list}>',
  '\t    <{if $news.pager.list[p].is_current_page}><span><{$news.pager.list[p].number}></span>',
  '\t    <{else}><a href="<{$news.pager.list[p].url}>"><{$news.pager.list[p].number}></a><{/if}>',
  '\t  <{/section}>',
  '\t  <{if not $news.pager.is_last}><a href="<{$news.pager.next_url}>" rel="next">次へ</a> <a href="<{$news.pager.last_url}>">最後へ</a><{/if}>',
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
  '\t<div><{$news.content}></div>',
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
