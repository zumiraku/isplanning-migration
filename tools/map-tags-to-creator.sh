#!/bin/sh
# map-tags-to-creator.sh — Basic Mode tag -> Creator Mode tag
#
# design-backup.md put it plainly: "This list is the migration." Each of the 210
# Basic Mode tags the shop's templates use either has a Creator Mode counterpart
# or it is a functional gap, and a gap found by a customer is the failure this
# whole project exists to avoid.
#
# Until 2026-09-04 we were inferring those counterparts from the archive. We were
# not: the destination platform publishes a tag reference, per page type, at
#
#   http://reference.makeshop.jp/taglist/creator-mode/<page>.html
#
# The mappings below are the ones read off it so far, keyed by Basic Mode tag.
# Everything else is emitted as 要確認 with the reference page to look at, so the
# remaining work is mechanical rather than a research problem.
#
# Note the shape change this table hides. Basic Mode tags are standalone
# substitutions - [BRANDNAME] means "the product name here". Creator Mode is a
# loop with a subject: $category.item.list[i].name. So a one-to-one row is a
# convenience for tracking coverage, not a search-and-replace instruction.
#
# Output: inventory/tag-mapping.csv
# Needs Git Bash. Run from the repository root.

src="inventory/basic-mode-tags.csv"
out="${1:-inventory/tag-mapping.csv}"

[ -f "$src" ] || { echo "no $src - run inventory-basic-tags.sh first"; exit 1; }

# Basic tag | Creator equivalent | note
map_for() {
  case "$1" in
    '[SYSTEM_CODE]')     echo '$item.system_code|商品詳細。u-komiの設置タグで使用' ;;
    '[BRANDNAME]')       echo '$item.name / $category.item.list[i].name|文脈で主語が変わる。詳細ページか一覧ループか' ;;
    '[BRAND_URL]')       echo '$category.item.list[i].url|一覧から商品ページへのリンク' ;;
    '[DETAIL]')          echo '$category.item.list[i].url|同上。BasicではURLとリンクが別タグだった' ;;
    '[WISHLIST]')        echo '$category.item.list[i].favorite_entry_url|お気に入り追加' ;;
    '[BASKET]')          echo '$category.item.list[i].cart_entry_url|かごに入れる' ;;
    '[IMAGE_URL]')       echo '$category.item.list[i].image_M|S/M/L の3種がある' ;;
    '[ICON]')            echo '$category.item.list[i].icon.list[j].image_url|アイコンはループの中のループ' ;;
    '[TAXPRICE]')        echo '$category.item.list[i].price|税抜は price_excluded_tax' ;;
    '[TOTAL]')           echo '$category.total_count|表示件数は display_count' ;;
    '[PAGER]')           echo '$category.pager' ;;
    '[SORTRECOMMEND]')   echo '$category.sort_recommend_url' ;;
    '[NEWSORT]')         echo '$category.sort_new_url' ;;
    '[SORTPRICE]')       echo '$category.sort_high_price_url / sort_low_price_url|Basicは1タグ、Creatorは高い順と安い順で別' ;;
    '[SORTBRANDNAME]')   echo '$category.sort_name_url' ;;
    '[SORTPRODUCT]')     echo '要確認|単価順。Creator側に対応するsort URLが見当たらない' ;;
    '[ZAIKO]')           echo '$category.item.list[i].stock_quantity|表示可否は is_stock_display' ;;
    '[NAMECURRENT]')     echo '$category.name|カテゴリ名' ;;
    *)                   echo '' ;;
  esac
}

ref_for() {
  case "$1" in
    *brandpage*|*searchpage*) echo 'category.html / search.html' ;;
    *detailpage*)             echo 'detail.html' ;;
    *) echo 'common.html' ;;
  esac
}

echo '"tag","uses","kind","where","creator_equivalent","status","note"' > "$out"

sed 's/^"//; s/"$//' "$src" | tail -n +2 | while IFS= read -r line; do
  tag=$(echo "$line"   | awk -F'","' '{print $1}')
  uses=$(echo "$line"  | awk -F'","' '{print $2}')
  kind=$(echo "$line"  | awk -F'","' '{print $4}')
  where=$(echo "$line" | awk -F'","' '{print $5}')

  if [ "$kind" = "control" ]; then
    printf '"%s","%s","%s","%s","%s","%s","%s"\n' \
      "$tag" "$uses" "$kind" "$where" "#if / #foreach" "要確認" \
      "制御構文。Creatorはテンプレート言語の構文を持つので1対1ではない" >> "$out"
    continue
  fi

  # The Basic Mode listing-layout family does not map to anything - it dissolves.
  # [PRODUCTION_START] opens the product loop, [PRODUCTION_ITEM4_START] opens a
  # row of four, [GROUP4_0] lays out sub-categories four across, [SUISEN4_2] is
  # two rows of four recommendations, [ADDCLASS] injects a class per cell.
  # Creator Mode has one loop and the columns are CSS, so there is no counterpart
  # to find. Counting these as unresolved overstates the remaining work.
  case "$tag" in
    '[PRODUCTION_'*|'[GROUP'*|'[SUISEN'*|'[ADDCLASS]'|'[ADDCODE]')
      printf '"%s","%s","%s","%s","%s","%s","%s"\n' \
        "$tag" "$uses" "$kind" "$where" '$category.item.list[i] のループに吸収' '不要' \
        'ベーシックの一覧レイアウト用タグ。Creatorはループとcssで組むため移植先は無い' >> "$out"
      continue ;;
  esac

  hit=$(map_for "$tag")
  if [ -n "$hit" ]; then
    eq=$(echo "$hit"   | awk -F'|' '{print $1}')
    note=$(echo "$hit" | awk -F'|' '{print $2}')
    st="判明"
    [ "$eq" = "要確認" ] && st="要確認"
  else
    eq=""
    note="リファレンス $(ref_for "$where") を確認"
    st="要確認"
  fi
  printf '"%s","%s","%s","%s","%s","%s","%s"\n' \
    "$tag" "$uses" "$kind" "$where" "$eq" "$st" "$note" >> "$out"
done

total=$(( $(wc -l < "$out") - 1 ))
done_n=$(sed 's/"//g' "$out" | awk -F, 'NR>1 && $6=="判明"' | wc -l)
none_n=$(sed 's/"//g' "$out" | awk -F, 'NR>1 && $6=="不要"' | wc -l)
echo ""
echo "tags              : $total"
echo "  resolved        : $done_n"
echo "  not needed      : $none_n"
echo "  still to check  : $(( total - done_n - none_n ))"
echo "report            : $out"
echo ""
echo "highest-use tags still unresolved:"
sed 's/"//g' "$out" | awk -F, 'NR>1 && $6=="要確認" && $3=="output"{printf "%6d  %s\n", $2, $1}' | sort -rn | head -10
