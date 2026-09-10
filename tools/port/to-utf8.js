/* ---------------------------------------------------------------------------
   to-utf8.js — ベーシックの書き出しを、扱える形に揃える

   templates/basic-export/design/*.txt を templates/basic-utf8/*.html に
   写します。やることは2つだけで、中身は1文字も変えません。

   ※ 1. 文字コード

      書き出しは**すでにUTF-8**です。最初これをEUC-JPだと思い込んで二重に
      デコードし、上段メニューが「膕����������ｃ��ャ」になりました。
      壊れ文字（U+FFFD）が出るかどうかで判定します。

   ※ 2. 改行

      CRLF です。**そのまま置換の照合に使うと、\n を含む文字列が一つも
      当たりません。** build-detail.js が「メイン画像の並びが一致しません」で
      止まって気づきました。エラーで止まったのは幸運で、黙って素通りする
      置換だったら移植漏れに気づけませんでした。
--------------------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");

const SRC = "templates/basic-export/design";
const OUT = "templates/basic-utf8";

fs.mkdirSync(OUT, { recursive: true });

let n = 0, euc = 0, tilde = 0;
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith(".txt")) continue;
  const b = fs.readFileSync(path.join(SRC, f));
  let s = b.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(b); euc++; }
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  /* ※ 3. 波ダッシュ 〜(U+301C) を 全角チルダ ～(U+FF5E) に
   *
   *    EUC-JP と Unicode のあいだで写像が2通りある、有名な文字です。
   *    書き出しファイルは U+301C 側、**公開中のサイトは U+FF5E 側**でした。
   *
   *      公開中のトップ    〜 = 0件 / ～ = 31件
   *      移植版（変換前）  〜 = 19件（表示される場所）
   *
   *    「100円〜199円」と「100円～199円」。見た目はほぼ同じですが、
   *    フォントによって字形も幅も変わりますし、カテゴリ名のほうは
   *    データベースから U+FF5E で来るので、**左メニューだけ別の記号**に
   *    なります。並べて置いてある場所なので目立ちます。
   *
   *    現行サイトが出しているほうに揃えます。 */
  const before = (s.split("〜").length - 1);
  s = s.split("〜").join("～");
  tilde += before;

  fs.writeFileSync(path.join(OUT, f.replace(/\.txt$/, ".html")), s);
  n++;
}
console.log("変換 " + n + " ファイル（EUC-JPだったもの " + euc + " 件 / 波ダッシュを全角チルダに " + tilde + " 件）");
