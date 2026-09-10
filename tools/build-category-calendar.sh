#!/bin/sh
# build-category-calendar.sh — ct646（卓上カレンダー）の営業日カレンダー
set -e
cd "$(dirname "$0")/.."

SRC=templates/creator/preview/category-calendar.html
OUT=package/modules/category_calendar.tpl

[ -f "$SRC" ] || { echo "missing $SRC" >&2; exit 1; }
mkdir -p package/modules

perl -CS -0777 -e '
  use utf8;
  my ($src, $out) = @ARGV;
  open my $i, "<:encoding(UTF-8)", $src or die "$src: $!";
  local $/; my $h = <$i>; close $i;

  my ($sec) = $h =~ /(<h2[^>]*>営業日カレンダー.*?)(?=<h2)/s;
  die "営業日カレンダーの節が見つかりません\n" unless defined $sec;
  $sec =~ s/\s+$//;

  my $closed = () = $sec =~ /is-closed/g;
  my $months = () = $sec =~ /<h3>/g;
  die "月が2つありません（$months）\n" unless $months == 2;
  die "休業日の指定がありません\n" unless $closed > 0;

  open my $o, ">:encoding(UTF-8)", $out or die "$out: $!";
  print $o <<"HEAD";
<{* =========================================================================
     営業日カレンダー — ct646（卓上カレンダー）専用

     ※ GENERATED — tools/build-category-calendar.sh が生成します。
        ただし**毎月の更新はこのファイルを直接直してください。**
        元にした再現ページは月が固定なので、作り直すと古い月に戻ります。

     このカテゴリだけ、カテゴリ設定のフリースペースに独自の内容が入って
     いました。クリエイターモードにはフリースペースを出すタグがないため、
     モジュールとして持たせています。

     商品の表は持ってきていません。元は25商品を価格ごと手で書いた表で、
     価格改定や品切れのたびに実際と食い違います。カテゴリページ本体が
     \$category.item.list で実際の商品を出すので、そちらが正確です。

     月が変わったら、下の <h3> と表を書き換えてください。休業日のセルに
     class="is-closed" を付けます。色だけで伝えないよう、休業日のセルには
     読み上げ用の文字も入れてあります。消さないでください。

     いま入っている月: 2か月分 / 休業日 $closed 日
   ========================================================================= *}>

$sec

<{* 凡例。色だけで休業日を示すと、色の見分けがつかない方に伝わりません。 *}>
<p class="calendar__key"><i></i>色の付いた日は休業日です</p>
HEAD
  close $o;
  printf "  月 %d / 休業日 %d 日\n", $months, $closed;
' "$SRC" "$OUT"

printf "  %-40s %s バイト\n" "$OUT" "$(wc -c < "$OUT")"

