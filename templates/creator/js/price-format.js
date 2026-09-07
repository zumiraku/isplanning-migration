/*
 * price-format.js - 一覧の価格に桁区切りを入れる。
 *
 * 🔴 なぜテンプレートでやらないのか
 *
 *    一覧の価格タグは生の整数を返します。実測:
 *
 *      一覧   $..item.list[i].price   -> 55000
 *      詳細   $item.price_html        -> <span …>55,000</span>
 *
 *    整形済みなのは詳細だけです。ベーシックモードの [TAXPRICE] は一覧でも
 *    39,600 とカンマ付きで返していたので、これは現行サイトからの後退です。
 *
 *    Smarty 標準の修飾子に number_format はありません（string_format は
 *    sprintf なので桁区切りを作れません）。MakeShop が独自に登録していれば
 *    `|number_format` で入りますが、**未対応ならテンプレートが
 *    コンパイルできず、606カテゴリと検索が同時に落ちます。** 確かめる方法が
 *    プレビューへの貼り付けしかなく、外れたときの被害が大きすぎます。
 *
 *    ここでやれば、動かなかったときに残るのは 55000円（税込）── 読みにくい
 *    だけで、間違ってはいません。ギャラリーやタブと同じ考え方です。
 *
 * 🔴 触ってよいのは一覧の価格だけです。
 *
 *    商品詳細の .pricebox__main には触りません。中身は
 *    <span data-id="makeshop-item-price:1">55,000</span> で、**オプションを
 *    選ぶとプラットフォームが書き換えます。** こちらが整形したそばから
 *    上書きされますし、書き換えの邪魔をする可能性もあります。
 *    すでにカンマ付きなので、そもそも用がありません。
 *
 * 数字以外は一切触りません。「55000円（税込）」の 55000 だけを見て、
 * 4桁以上なら 55,000 にします。すでにカンマがあるものは対象外です。
 */
(function () {
  'use strict';

  function comma(n) {
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function format(el) {
    // 先頭の数字だけを見ます。「円（税込）」やアイコンには触りません。
    var node = el.firstChild;
    while (node && node.nodeType !== 3) { node = node.nextSibling; }
    if (!node) { return; }

    var t = node.nodeValue;

    /* 🔴 最初 /^\s*(\d{4,})\s*$/ と書いて、当たりませんでした。

       テンプレートが出すのは

         <span class="card__price">55000円<small>（税込）</small></span>

       なので、最初のテキストノードは "55000" ではなく **"55000円"** です。
       「数字だけのはず」という思い込みでした。**実際に配信されたHTMLに
       読み込ませて分かりました。** 手元の想像で書いた正規表現を、手元の
       想像で試していたら通っていたはずです。

       先頭の数字の並びだけを見ます。そのあとに何が続いていても構いません。 */
    var m = /^(\s*)(\d{4,})(?!\d)/.exec(t);
    if (!m) { return; }          // 空・カンマ済み・3桁以下は対象外

    node.nodeValue = m[1] + comma(m[2]) + t.slice(m[0].length);
  }

  function init() {
    var list = document.querySelectorAll('.card__price');
    for (var i = 0; i < list.length; i++) { format(list[i]); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
