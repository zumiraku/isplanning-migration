#!/bin/sh
# identify-preview.sh — そのプレビュー、本当にそのページ種別ですか
set -e
cd "$(dirname "$0")/.."

f="$1"
[ -n "$f" ] && [ -f "$f" ] || { echo "usage: identify-preview.sh <file.html>" >&2; exit 2; }

hit() { grep -q "$1" "$f" 2>/dev/null; }

name=""
if   hit 'data-gallery-track';                 then name="商品詳細 (detail.tpl)"
elif hit 'に一致する商品は見つかりませんでした'; then name="商品検索結果 (search.tpl)"
elif hit 'このカテゴリーには現在商品がございません'; then name="商品カテゴリー (category.tpl)"
elif hit 'class="carttable"';                  then name="買い物カゴ (cart-body.tpl)"
elif hit '買い物かごに商品が入っていません';    then name="買い物カゴ (cart-body.tpl・空)"
elif hit 'class="newslist"';                   then name="お知らせ一覧 (news-list-body.tpl)"
elif hit 'class="newsnav"';                    then name="お知らせ詳細 (news-detail-body.tpl)"
elif hit 'class="h-lede"';                     then name="トップ (top-body.tpl)"
elif hit '/view/search?sort=';                  then name="商品検索結果 (search.tpl)"
elif hit '/view/category/' && hit 'listbar__sort';  then name="商品カテゴリー (category.tpl)"
elif hit 'class="listbar__sort"';              then name="カテゴリーか検索（材料不足で断定不可）"
fi

charset=$(grep -o 'charset="\?[A-Za-z0-9-]*' "$f" | head -1 | sed 's/.*charset="\?//')
case "$charset" in
  [Uu][Tt][Ff]-8) mode="クリエイターモード" ;;
  *)              mode="※ ベーシックモード（$charset）── プレビューが効いていません" ;;
esac

printf "ファイル      : %s（%s バイト）\n" "$f" "$(wc -c < "$f" | tr -d ' ')"
printf "モード        : %s\n" "$mode"
printf "描画テンプレート: %s\n" "${name:-判別できません}"
printf "未展開タグ    : %s\n" "$(grep -c '<{' "$f" || true)"
printf "空href / 空src: %s / %s\n" \
  "$(grep -o 'href=""' "$f" | wc -l | tr -d ' ')" \
  "$(grep -o 'src=""' "$f" | wc -l | tr -d ' ')"
printf "商品カード    : %s 件\n" "$(grep -c 'class="card"' "$f" || true)"

case "$name" in
  *断定不可*)
    echo ""
    echo "※ 中身が空です。**その種別のプレビューではない可能性が高いです。**"
    echo "   見たい画面で「プレビュー」を押し直してから、開いたタブのURLを"
    echo "   使ってください。"
    ;;
esac

