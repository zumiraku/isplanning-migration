#!/bin/sh
# build-freepage-package.sh — the 86 free pages, ready for フリーページ管理
#
# 🔴 2026-09-05: rebuilt. The first version produced body fragments, because
# フリーページ管理 looked like a content box. It is not - it is a whole
# document, the same as the eleven page templates. Saving page82 with one line
# of text produced exactly that on screen: one line of text, no header, no
# footer, no stylesheet.
#
# So each page is now wrapped in the same shell: the doctype, the three
# 必ず記載 tags, $module.header and $module.footer. Without $makeshop.head a
# free page would load no analytics; without $module.header it would have no
# navigation at all, and 86 pages with no way back to the shop is worse than
# not migrating them.
#
# The <title> is written in rather than taken from $page.title. It is knowable,
# it is stable, and the brief asked for the titles to be fixed - so it should
# not depend on a field being filled in correctly 86 times.
#
# Needs Git Bash. Run from the repository root.

src="templates/creator/freepages"
list="inventory/freepages-admin-list.csv"
out="package/freepages"

[ -d "$src" ]  || { echo "no $src"; exit 1; }
[ -f "$list" ] || { echo "no $list"; exit 1; }

rm -rf "$out"; mkdir -p "$out"
echo '"order","slug","page_url","title","bytes","note"' > "$out/MANIFEST.csv"

esc() { printf '%s' "$1" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g'; }

n=0
for f in "$src"/*.html; do
  slug=$(basename "$f" .html)
  title=$(sed 's/^"//; s/"$//' "$list" | awk -F'","' -v s="$slug" '$1==s{print $2}' | head -1)
  [ -z "$title" ] && title="$slug"
  et=$(esc "$title")

  case "$slug" in
    company|info|ordercontract|privacy) continue ;;   # 専用ページ種別なので対象外
  esac

  {
    printf '<!doctype html>\n<html lang="ja">\n<head>\n'
    printf '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    printf '<title>%s｜粗品・景品の発見マーケット</title>\n' "$et"
    printf '<meta name="description" content="<{$page.description}>">\n'
    printf '<link rel="canonical" href="<{$page.canonical_url}>">\n'
    printf '<meta property="og:type" content="article">\n'
    printf '<meta property="og:title" content="%s">\n' "$et"
    printf '<meta property="og:site_name" content="<{$shop.name}>">\n'
    printf '<link rel="icon" href="<{$shop.favicon_url}>">\n'
    printf '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    printf '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    printf '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&amp;family=Mochiy+Pop+One&amp;display=swap" rel="stylesheet">\n'
    printf '<link rel="stylesheet" href="<{$page.css}>">\n'
    printf '<{$makeshop.head}>\n</head>\n<body>\n<{$makeshop.body_top}>\n'
    printf '<{$module.header}>\n<main class="container">\n\n'
    printf '<nav class="breadcrumb" aria-label="現在位置">\n  <ol>\n'
    printf '    <li><a href="<{$url.top}>">ホーム</a></li>\n'
    printf '    <li><span aria-current="page">%s</span></li>\n' "$et"
    printf '  </ol>\n</nav>\n\n'
    cat "$f"
    printf '\n\n</main>\n<{$module.footer}>\n<{$makeshop.body_bottom}>\n'
    printf '<script src="<{$page.javascript}>"></script>\n</body>\n</html>\n'
  } > "$out/$slug.html"

  inbound=$(grep -l "$slug\.html" "$src"/*.html 2>/dev/null | wc -l)
  n=$((n + 1))
  printf '"%s","%s","%s","%s","%s","%s"\n' \
    "$inbound" "$slug" "$slug.html" "$title" "$(wc -c < "$out/$slug.html")" "" >> "$out/MANIFEST.csv"
done

{ head -1 "$out/MANIFEST.csv"; tail -n +2 "$out/MANIFEST.csv" | sort -t'"' -k2 -rn; } > "$out/_m.csv"
mv "$out/_m.csv" "$out/MANIFEST.csv"

echo ""
echo "pages packaged : $n   (company/info/ordercontract/privacy は専用ページ種別なので除外)"
echo "package        : $out"
echo ""
echo "被リンクの多い順:"
sed 's/"//g' "$out/MANIFEST.csv" | awk -F, 'NR>1 && NR<=6{printf "  %2s 本  %-10s %s\n", $1, $3, substr($4,1,36)}'

# --- 付属文書 -----------------------------------------------------------------
# 🔴 このスクリプトは冒頭で out ディレクトリを rm -rf します。手で置いた
#    ファイルは消えます。実際に PAGE-NAMES.md と REDO.txt を消しました。
#    以後はここで作り直します。

# ページ名の対応表。フリーページ編集の3つ目の入力欄に入れる値です。
{
  cat <<'HD'
# フリーページ 82枚 — 3つの入力欄に入れるもの

フリーページ編集の画面には入力するところが**3つ**あります。ID（ページURL）と
本文だけではありません。

| 欄 | 入れるもの |
|---|---|
| **ページURL** | `/view/page/` の右の欄に `pageNN.html`（例: `page9.html`）|
| **ページ名** | 下の表の右列。**これが3つ目です** |
| **ステータス** | 「公開」のまま |
| **大きなHTML欄** | `package/freepages/pageNN.html` の全文 |

ページ名は移行前のページ名そのままです。勝手に付けた名前ではありません。
`inventory/freepages-admin-list.csv`（管理画面から取った一覧）の値です。

**並び順は被リンクの多い順**です。上から進めると、途中で止まっても
影響の大きいページから片付いた状態になります。

| # | ページURL | ページ名 |
|---:|---|---|
HD
  perl -ne '
    next if $.==1;
    my @f = /"([^"]*)"/g;
    next unless @f >= 4;
    $n++;
    my $t = $f[3]; $t =~ s/\|/\|/g;
    printf "| %d | `%s` | %s |\n", $n, $f[2], $t;
  ' "$out/MANIFEST.csv"
} > "$out/PAGE-NAMES.md"

# 貼り直しが要るページ。内部リンクを持つものが対象です。
{
  cat <<'HD'
# 貼り直したいフリーページ ── 切替前にやる必要はありません
#
# 内部リンクを新URLに書き換えたため、すでに貼ってあるものとは中身が違います。
#
#   /html/pageNN.html   -> /view/page/pageNN.html
#   /shopbrand/…        -> /view/category/ctNNN
#   /shopdetail/コード  -> /view/item/コード
#
# ■ 切替前の必須作業ではありません（2026-09-05）
#
#   URL一括設定のCSVが旧URLを「追加URL」として登録するので、いま入っている
#   ページの中の旧リンクもそのまま到達できます。この貼り直しは「正規URLで
#   直接リンクする」ための整理です。
#
#   ※ ただしCSVを入れないまま放置すると、これらのリンクは404になります。
#
# 被リンクの多い順です。着手するときは上から進めてください。
#
HD
  perl -ne '
    next if $.==1;
    my @f = /"([^"]*)"/g;
    next unless @f >= 4;
    print "$f[2]\t$f[3]\n";
  ' "$out/MANIFEST.csv" | while IFS="$(printf '\t')" read -r file name; do
    if grep -q 'href="/view/' "$out/$file" 2>/dev/null; then
      printf '%-14s %s\n' "$file" "$name"
    fi
  done
} > "$out/REDO.txt"

echo ""
echo "付属文書:"
printf "  %-16s %s 行\n" "PAGE-NAMES.md" "$(grep -c '' "$out/PAGE-NAMES.md")"
printf "  %-16s %s 枚が対象\n" "REDO.txt" "$(grep -c '^page' "$out/REDO.txt")"
