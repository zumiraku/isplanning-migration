#!/bin/sh
# =============================================================================
#  identify-preview.sh — そのプレビュー、本当にそのページ種別ですか
#
#  🔴 プレビューは「押した画面のページ種別」に固定されます。
#
#     URLがどこを指していても、その1種類を描画します。以前これで
#     **10ページ種別を一度に検証したつもりが、10回とも商品詳細を見ていた**
#     ことがありました。
#
#     2026-09-07 にも同じことをしました。/view/search と
#     /view/item/003001000005 を取得して、どちらにも並び替えバーがあり
#     `href=""` が6件出ていたので「検索テンプレートの不具合」と読みかけました。
#     実際には**両方とも category.tpl**で、カテゴリの文脈が無いから空だった
#     だけです。URLを信じたのが誤りでした。
#
#  ここでは、返ってきたHTMLの中身から**どのテンプレートか**を当てます。
#  目印は、そのテンプレートにしか出てこない文字列です。
#
#  使い方: sh tools/identify-preview.sh <取得したHTML>
# =============================================================================
set -e
cd "$(dirname "$0")/.."

f="$1"
[ -n "$f" ] && [ -f "$f" ] || { echo "usage: identify-preview.sh <file.html>" >&2; exit 2; }

hit() { grep -q "$1" "$f" 2>/dev/null; }

# 目印は「そのテンプレートにしか無い」ものを選びます。クラス名は使い回される
# ので、本文の文言やデータ属性のほうが確実です。
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
  *)              mode="🔴 ベーシックモード（$charset）── プレビューが効いていません" ;;
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
    echo "🔴 中身が空です。**その種別のプレビューではない可能性が高いです。**"
    echo "   見たい画面で「プレビュー」を押し直してから、開いたタブのURLを"
    echo "   使ってください。"
    ;;
esac
