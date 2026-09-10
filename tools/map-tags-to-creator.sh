#!/bin/sh
# map-tags-to-creator.sh — Basic Mode tag -> Creator Mode tag

src="inventory/basic-mode-tags.csv"
out="${1:-inventory/tag-mapping.csv}"

[ -f "$src" ] || { echo "no $src - run inventory-basic-tags.sh first"; exit 1; }

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
    '[SORTPRODUCT]')     echo '$category.sort_manufacturer_url / $search.sort_manufacturer_url|製造元順。この店舗は製造元フィールドに単価を入れており（@62円 → 100062）、ラベルの文字だけを「単価順」に変えて使っている。2026-09-07 に山口様の説明で判明。以前ここに「欠落」と書いていたのは誤り' ;;
    '[ZAIKO]')           echo '$category.item.list[i].stock_quantity|表示可否は is_stock_display' ;;
    '[NAMECURRENT]')     echo '$category.name|カテゴリ名' ;;
    '[CATEGORY_IMAGE]')  echo '$category.image_url|カテゴリー画像URL' ;;
    '[GROUP4_0]')        echo '$category.child_category.list[i]|子カテゴリ一覧。4列/3列の別はCSSなのでタグには出ない' ;;
    '[GROUP3_7]')        echo '$category.child_category.list[i]|同上。ベーシックは列数がタグ名に埋まっていた' ;;
    '[SUISEN4_2]')       echo '$category.recommend_item.list[i]|おすすめ商品。列数と行数の指定部分だけが消える' ;;
    '[PRICE]')           echo '$category.item.list[i].price_excluded_tax|税抜。C36の3カテゴリはこれを税込と表示していた' ;;
    '[LIST]')            echo '$category.breadcrumb_list.list[i].name / .url|パンくず。検索結果側は $search.breadcrumb_list' ;;
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

  case "$tag" in
    '[PRODUCTION_'*|'[ADDCLASS]'|'[ADDCODE]')
      printf '"%s","%s","%s","%s","%s","%s","%s"\n' \
        "$tag" "$uses" "$kind" "$where" '$category.item.list[i] のループに吸収' '不要' \
        'ベーシックの一覧レイアウト用タグ。Creatorはループとcssで組むため移植先は無い' >> "$out"
      continue ;;
  esac

  case "$tag" in
    '[REVIEW_'*)
      printf '"%s","%s","%s","%s","%s","%s","%s"\n' \
        "$tag" "$uses" "$kind" "$where" 'u-komi' '不要' \
        'メイクショップが2026年11月末に旧レビューを廃止。u-komiに移行済み' >> "$out"
      continue ;;
    '[RECENT]'|'[IF_RECENT]'|'[ENDIF_RECENT]')
      printf '"%s","%s","%s","%s","%s","%s","%s"\n' \
        "$tag" "$uses" "$kind" "$where" 'rcmd.jp _displayHistory' '不要' \
        'この店舗では既にコメントアウト済み。レコメンドの閲覧履歴枠が代替している' >> "$out"
      continue ;;
  esac

  hit=$(map_for "$tag")
  if [ -n "$hit" ]; then
    eq=$(echo "$hit"   | awk -F'|' '{print $1}')
    note=$(echo "$hit" | awk -F'|' '{print $2}')
    st="判明"
    [ "$eq" = "要確認" ] && st="要確認"
    [ "$eq" = "欠落" ] && st="欠落"
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
gap_n=$(sed 's/"//g' "$out" | awk -F, 'NR>1 && $6=="欠落"' | wc -l)
echo ""
echo "tags              : $total"
echo "  resolved        : $done_n"
echo "  not needed      : $none_n"
echo "  LOST (欠落)     : $gap_n"
echo "  still to check  : $(( total - done_n - none_n - gap_n ))"
echo "report            : $out"
echo ""
echo "highest-use tags still unresolved:"
sed 's/"//g' "$out" | awk -F, 'NR>1 && $6=="要確認" && $3=="output"{printf "%6d  %s\n", $2, $1}' | sort -rn | head -10

