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
  const out = shell({ name: name.label, from: from, slider: false,
                      title: name.title, body: body.trim() });
  fs.writeFileSync("templates/creator/mode/" + name.file + ".tpl", out);
  console.log("  " + name.label.padEnd(16) + String(out.split("\n").length).padStart(4) + " 行");
}

/* --- 会社概要 -------------------------------------------------------------- */
/* 🔴 見出しは $company.content が自分で持っていました
 *
 *    プレビューで実物を見て分かりました。
 *
 *      h2: 2000年8月オープン！… | 会社概要 | 会社概要 | コラム
 *
 *    こちらが `<h2>会社概要</h2>` を足していたので、同じ見出しが2つ
 *    続けて出ていました。**手元では確かめようがなかった7項目の1つ**です。
 *    足すのをやめます。 */
/* 🔴 会社概要だけ、id が二重になっていました（2026-09-09 実測）
 *
 *    `<{$company.content}>` は**自分で入れ物を持ってきます。**
 *    配信されたHTMLはこうでした。
 *
 *      <div id="O_adminPagearea" class="company">   ← こちらが足した分
 *        <pre>
 *          <div id="O_adminPagearea" class="M_mainContents">  ← 中身に付いてくる分
 *
 *    現行サイトは1つだけです（`<div id="O_adminPagearea" class="M_mainContents company">`）。
 *    同じidが2つあるHTMLは不正で、`getElementById` は外側しか返しません。
 *    こちらの入れ物から id を外して、現行と同じ「1つ」に戻します。
 *    class は残すので、見た目は変わりません。
 *
 *    他のページ種別は中身が入れ物を持ってこないので、そのままです
 *    （実測: policy 1 / guide 1 / news-list 1 / news-detail 1 / contract 0）。 */
write({ file: "company", label: "会社概要" }, "（タグのみ）", [
  '<div class="company">',
  '\t<{if $company.image_url}><p><img src="<{$company.image_url}>" alt="会社概要"></p><{/if}>',
  '\t<{$company.content}>',
  '</div>'
].join("\n"));

/* --- ご利用案内 ------------------------------------------------------------ */
/* 🔴 $guide.* は、公開中のページとは別の記録を読んでいました
 *
 *    プレビューで実物を見て分かりました。
 *
 *      買い物方法          4,129文字   ← $guide.order に全部
 *      お支払・送料について     0
 *      お届けについて        0
 *      返品交換について       0
 *      納品書・領収書について    0
 *
 *    5項目のうち4項目が空で、見出しだけが4つ並びます。しかも
 *    **現行の文言 269塊のうち 100塊が出ません。**
 *
 *    タグの割り当てを直しても解決しません。読んでいる記録そのものが
 *    違うからです。公開中のページの本文をそのまま移します。
 *    tools/port/build-static-src.js が抜き出したものです。
 *
 *    ⚠️ 管理画面から直せなくなります。その代わり、今日の見え方が
 *       1文字も変わりません。**法律と取引条件のページなので、
 *       直せることより変わらないことを採ります。**
 *
 * 🔴 アンカーの id は変えられません
 *
 *    フッターや商品ページから /view/guide#about_payment のように
 *    直接飛んでくるリンクが十数本あります。id が変わると全部ページ頭に
 *    着地します。写した本文がそのまま持っています。 */
const guideBody = fs.readFileSync("templates/creator/port-src/guide-body.tpl", "utf8");
write({ file: "guide", label: "ご利用案内" }, "（現行の文面）", [
  '<div id="O_adminPagearea" class="M_mainContents shop-guide">',
  guideBody.trim(),
  '</div>'
].join("\n"));

/* --- 特定商取引法 ---------------------------------------------------------- */
/* 🔴 タグの値は、公開中のページと違いました
 *
 *    17行・ラベル・並び順は合わせられましたが、**中身が違いました。**
 *    プレビューで実物を見て分かったことです。
 *
 *      引き渡し時期        現行「10日以内」  → タグ「7日以内」
 *      商品以外の必要代金   現行6項目        → タグ2項目
 *      サイト名称          現行にある行      → タグに項目が無い（18行目）
 *
 *    $contract.* が読んでいるのは、公開中のページとは別の記録です。
 *    ラベルを直しても中身は合いません。
 *
 *    **法律で表示が要るページです。** 今日出ているものが1文字も
 *    変わらないことを優先して、公開ページの表をそのまま移します。
 *    tools/port/build-static-src.js が抜き出したものです。
 *
 *    ⚠️ 管理画面から直せなくなります。管理画面の値を現行に合わせて
 *       入れ直せば、いつでもタグに戻せます。 */
const contractBody = fs.readFileSync("templates/creator/port-src/contract-body.tpl", "utf8");
write({ file: "contract", label: "特定商取引法" }, "（現行の文面）", [
  '<div class="company transaction">',
  contractBody.trim(),
  '</div>'
].join("\n"));

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
/* 🔴 個人情報保護ポリシーだけ、タイトルが店名のままでした（実測・2026-09-10）
 *
 *      現行    個人情報保護ポリシー
 *      移植版  粗品と景品の発見マーケット　ISPLANNING
 *
 *    現行は footer の JavaScript:bottom_privercy() で開く**別窓**で、
 *    ヘッダーもCSSも無い素のページです（画像1枚・CSS0本）。移植版では
 *    ページ種別14として普通のページにしています。中身は同じですが、
 *    タイトルは $page.title に任せると店名しか返りません。お知らせ一覧と
 *    同じく、こちらで入れます。 */
write({ file: "policy", label: "プライバシー", title: "個人情報保護ポリシー" }, "（現行の文面）", [
  '<div id="O_adminPagearea" class="company">',
  '\t<h2>個人情報保護ポリシー</h2>',
  '\t<{* 🔴 このページ種別だけリファレンスにタグがありません。',
  '\t     現行サイトの文面をそのまま使っています。 *}>',
  privacy.trim(),
  '</div>'
].join("\n"));

/* --- お知らせ（一覧・詳細） ------------------------------------------------
   マークアップは tools/port/_news-blocks.js に出してあります。
   現行の骨格（#r_news / #newsList / #newsHead / #newsListBtn）に合わせた
   理由は、そのファイルの見出しに書いてあります。 */
const { newsList, newsDetail } = require("./_news-blocks.js");

/* 🔴 現行のタイトルは「お知らせ一覧ページ」です。$page.title は店名しか返しません */
write({ file: "news-list", label: "お知らせ一覧", title: "お知らせ一覧ページ" }, "（タグのみ）", newsList);

write({ file: "news-detail", label: "お知らせ詳細" }, "（タグのみ）", newsDetail);

console.log("");
console.log("会社概要・お知らせはタグから、ご利用案内・特商法・プライバシーは現行の文面から。");
console.log("🔴 ご利用案内と特商法は 2026-09-09 にタグから文面に戻しました。");
console.log("   プレビューで、タグが公開中のページとは別の記録を読んでいると分かったためです。");
console.log("   管理画面の値を現行に合わせて入れ直せば、いつでもタグに戻せます。");
