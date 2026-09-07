#!/bin/sh
# =============================================================================
#  check-tax-display.sh — 税抜価格を「税込」と書いて出していないか
#
#  山口様のご判断（2026-09-07）:
#
#    > 申し訳ないです、以前にも気づいて直した覚えがありますが
#    > まだあったのですね。お手数ですが直していただけるようお願いいたします。
#
#  現行サイトの ct28・ct31（冬の粗品）・ct66（便利な粗品）は、カテゴリごとの
#  テンプレートで `[PRICE]`（税抜）を出しながら、周りのマークアップは標準と
#  同じ「（税込）」のままでした。冬の粗品だけで1,575商品。34,320円の品を
#  31,200円（税込）と表示していたことになります。
#
#  アーカイブから確定させた根拠: 冬カテゴリと標準テンプレートのカテゴリの
#  **両方に載っている40商品すべてで表示価格が違い、比率は40件とも1.10**
#  （34件はちょうど1.10、6件は端数で1.0999）。
#
#  クリエイターモードのカテゴリテンプレートは1本なので、切り替えた時点で
#  この3カテゴリも他と同じ税込表示になります。**「1本だから安全」は、
#  こちらが税込タグを使っている場合にだけ成り立ちます。**
#
#  🔴 税抜のタグは別名で存在します。
#
#       $category.item.list[i].price                 税込   ← 使うのはこちら
#       $category.item.list[i].price_excluded_tax    税抜
#       $category.item.list[i].original_price_excluded_tax
#
#     名前が似ているので、補完や書き写しで入れ替わっても目で気づけません。
#     入れ替わったときに壊れるのは9,534商品ぶんの表示価格で、総額表示義務にも
#     かかります。ここで機械的に止めます。
#
#  商品詳細は $item.price_html（プラットフォームの整形済み）を使うので
#  対象外です。税抜を出したい正当な理由ができたときは、このチェックを
#  消すのではなく、**理由を書いて例外に足してください。**
# =============================================================================
set -e
cd "$(dirname "$0")/.."

files="templates/creator/mode/category.tpl templates/creator/mode/search.tpl
templates/creator/mode/top-body.tpl templates/creator/mode/detail.tpl
templates/creator/mode/cart-body.tpl"

hits=""
for f in $files; do
  [ -f "$f" ] || continue
  h=$(grep -n 'price_excluded_tax' "$f" | grep -v '<{\*' | grep -v '^\s*[0-9]*: *#' || true)
  [ -n "$h" ] && hits="$hits$f
$h
"
done

# モジュールと配布物も同じ扱いにします。
for f in package/templates/*.tpl package/modules/*.tpl; do
  [ -f "$f" ] || continue
  h=$(grep -n 'price_excluded_tax' "$f" | grep -v '<{\*' || true)
  [ -n "$h" ] && hits="$hits$f
$h
"
done

if [ -n "$(printf '%s' "$hits" | tr -d '[:space:]')" ]; then
  echo "🔴 税抜の価格タグが使われています"
  echo "   C36 と同じ間違いです。「（税込）」の見出しの下に税抜が出ます。"
  printf '%s\n' "$hits" | sed 's/^/   /'
  exit 1
fi

echo "OK  税抜の価格タグはどこにも使われていません"

# 価格を出している箇所が、ちゃんと税込タグであることも数えて出します。
n=$(grep -c 'card__price' templates/creator/mode/category.tpl templates/creator/mode/search.tpl \
      templates/creator/mode/top-body.tpl 2>/dev/null | awk -F: '{s+=$2} END {print s}')
echo "    一覧の価格表示 $n 箇所、すべて .price（税込）"
exit 0
