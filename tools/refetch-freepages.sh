#!/bin/sh
# =============================================================================
#  refetch-freepages.sh — 山口様が直されたフリーページを取り直す
#
#  山口様のご返信（2026-09-07）:
#
#    > page3・page72・page79　商品は完売でページ自体削除となっていますね・・。
#    > 独自ページ内の商品も変更となりますので、自身で変更いたします。
#
#  🔴 これは「こちらの手元が古くなる」という話です。
#
#     山口様が直されるのはベーシックモードの独自ページです。こちらが配信用に
#     持っている package/freepages/page3.html などは 9/6 時点の内容から作った
#     ものなので、編集後にそのまま貼れば**山口様の修正をこちらが上書きします。**
#
#     「クライアントが直す」と聞いて安心して終わると、直した内容が消えます。
#
#  🔴 取得したものを snapshot/desktop/ に置くまでが仕事です。
#
#     最初は snapshot/manual/ に保存して終わりにしていました。**変換の入口は
#     そこではありません。** extract-freepages.ps1 が読むのは
#     snapshot/desktop/<file> で、その <file> は
#     inventory/pages-freepages-desktop.csv の file 列が決めています
#     （page3 なら html_page3.html.7139C90A.html）。置き場所を間違えると、
#     取り直したつもりで**一度も反映されません。**
#
#     ただし snapshot/desktop/ はクロールの**測定結果**です。黙って上書きすると
#     「いつ何を測ったか」が消えます。上書きする前に snapshot/desktop-archive/
#     へ退避し、既定では取得して比べるだけにしてあります。
#
#  --- 使い方 -------------------------------------------------------------------
#
#    sh tools/refetch-freepages.sh                  取得して比べるだけ
#    sh tools/refetch-freepages.sh --install        差分があれば取り込む
#    sh tools/refetch-freepages.sh --install page19 ページを指定
#
#  取り込んだあとは変換に流します:
#
#    .\tools\extract-freepages.ps1
#    .\tools\convert-freepages.ps1
#    sh tools/build-freepage-package.sh
#    sh tools/check-all.sh
# =============================================================================
set -e
cd "$(dirname "$0")/.."

INSTALL=0
PAGES=""
for a in "$@"; do
  case "$a" in
    --install) INSTALL=1 ;;
    -*) echo "unknown option: $a" >&2; exit 2 ;;
    *)  PAGES="$PAGES $a" ;;
  esac
done
[ -z "$PAGES" ] && PAGES="page3 page72 page79"

MAP=inventory/pages-freepages-desktop.csv
DESK=snapshot/desktop
ARCH=snapshot/desktop-archive
STAGE=snapshot/refetch
[ -f "$MAP" ] || { echo "missing $MAP" >&2; exit 1; }
mkdir -p "$STAGE"

UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

# 移行前から切れている4件。山口様が直されたかは、これが消えたかで分かります。
# inventory/known-dead-links.csv と同じ商品コードです。
DEAD="000000017197 000000017578 000000018584 000000018710"

differs=0
echo ""

for p in $PAGES; do
  # このページのスナップショット名を対応表から引きます。
  file=$(sed 's/^"//; s/"$//' "$MAP" | tail -n +2 | awk -F'","' -v u="https://www.isp-sp.com/html/$p.html" '$1==u {print $19}')
  if [ -z "$file" ]; then
    printf "  🔴 %-10s %s に載っていません\n" "$p" "$MAP"
    differs=1
    continue
  fi

  url="https://www.isp-sp.com/html/$p.html"
  new="$STAGE/$file"
  code=$(curl -s -A "$UA" --max-time 30 -o "$new" -w '%{http_code}' "$url" || echo 000)

  if [ "$code" != "200" ]; then
    printf "  🔴 %-10s HTTP %s\n" "$p" "$code"
    rm -f "$new"
    differs=1
    continue
  fi

  size=$(wc -c < "$new")
  cur="$DESK/$file"

  # 🔴 バイト比較では毎回「変わった」と出ます。
  #
  #    実際に比べたところ、差分の中身は2つとも**ページの中身ではありません**
  #    でした。
  #
  #      1. u-komi のローダー
  #         //api.u-komi.com/<64桁>/widget.js のトークンが取得ごとに変わる
  #      2. 左カラムの発送カレンダー
  #         8月 → 9月。月をまたいだだけ
  #
  #    どちらも変換の段階で落ちる共通部分です。これを「変更あり」と報告して
  #    いると、**本当の変更が同じ色で埋もれます。**
  #
  #    見るべきは商品リンクです。山口様が直されるのは販売終了商品への
  #    リンクなので、/shopdetail/コード/ の集合が変わったかで判定します。
  codes_new=$(grep -o '/shopdetail/[0-9]\{12\}' "$new" | sort -u)
  codes_cur=$(grep -o '/shopdetail/[0-9]\{12\}' "$cur" 2>/dev/null | sort -u)

  if [ "$codes_new" = "$codes_cur" ]; then
    n=$(printf '%s' "$codes_cur" | grep -c . || true)
    printf "  %-10s 商品リンクに変化なし（%s件・%s バイト）\n" "$p" "$n" "$size"
    rm -f "$new"
    continue
  fi

  oldsize=$(wc -c < "$cur" 2>/dev/null || echo 0)
  printf "  %-10s **商品リンクが変わりました**（%s → %s バイト）\n" "$p" "$oldsize" "$size"
  differs=1

  printf '%s\n' "$codes_cur" | grep -v '^$' > "$STAGE/.a" || true
  printf '%s\n' "$codes_new" | grep -v '^$' > "$STAGE/.b" || true
  comm -23 "$STAGE/.a" "$STAGE/.b" | sed 's|/shopdetail/|             − 消えた |'
  comm -13 "$STAGE/.a" "$STAGE/.b" | sed 's|/shopdetail/|             ＋ 増えた |'
  rm -f "$STAGE/.a" "$STAGE/.b"

  left=""
  for d in $DEAD; do
    grep -q "$d" "$new" && left="$left $d"
  done
  if [ -n "$left" ]; then
    printf "             販売終了リンクはまだ残っています:%s\n" "$left"
  else
    printf "             ✅ 販売終了リンクは消えました\n"
  fi

  if [ "$INSTALL" -eq 1 ]; then
    mkdir -p "$ARCH"
    [ -f "$cur" ] && [ ! -f "$ARCH/$file" ] && cp "$cur" "$ARCH/$file"
    cp "$new" "$cur"
    printf "             取り込みました（元は %s/%s）\n" "$ARCH" "$file"
  fi
done

echo ""
if [ "$differs" -eq 0 ]; then
  echo "どのページも取得時点から変わっていません。作業はありません。"
  exit 0
fi

if [ "$INSTALL" -eq 1 ]; then
  echo "🔴 変換に流し直してください。流さないと package/freepages/ は古いままです。"
  echo ""
  echo "    .\tools\extract-freepages.ps1"
  echo "    .\tools\convert-freepages.ps1"
  echo "    sh tools/build-freepage-package.sh"
  echo "    sh tools/check-all.sh"
else
  echo "取り込むには --install を付けて、もう一度実行してください。"
  echo "    sh tools/refetch-freepages.sh --install"
fi
