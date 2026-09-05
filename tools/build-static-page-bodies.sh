#!/bin/sh
# build-static-page-bodies.sh — 会社概要 / 利用案内 / 特定商取引法 / プライバシー
#
# These four are not 独自ページ. Each has its own page type in the Creator Mode
# editor, and each already has converted content in templates/creator/freepages/
# - company, info, ordercontract, privacy.
#
# So the body is the converted HTML, wrapped in a heading. No platform tags are
# involved: these pages are prose, and prose is what we already have, verified
# character-for-character against the source.
#
# ordercontract carries the client's decision on 引渡し時期 - 7日以内, recorded
# in inventory/approved-content-changes.csv. It is the one place in this whole
# corpus where the text was deliberately changed, and it is a legal disclosure,
# so it is worth knowing that this file is where it lands.
#
# Output: templates/creator/mode/<page>-body.tpl
# Needs Git Bash. Run from the repository root.

src="templates/creator/freepages"
out="templates/creator/mode"

# slug | page type | h1
set -- \
  "company|会社概要|会社概要" \
  "info|利用案内|ご利用ガイド" \
  "ordercontract|特定商取引法|特定商取引法に基づく表示" \
  "privacy|プライバシーポリシー|プライバシーポリシー"

for spec in "$@"; do
  slug=$(echo  "$spec" | cut -d'|' -f1)
  page=$(echo  "$spec" | cut -d'|' -f2)
  head=$(echo  "$spec" | cut -d'|' -f3)
  f="$src/$slug.html"
  [ -f "$f" ] || { echo "  skip $slug (no $f)"; continue; }

  {
    printf '<{* ==========================================================================\n'
    printf '     %s — Creator Mode（本文部分）\n' "$page"
    printf '\n'
    printf '     独自ページではなく専用のページ種別です。中身は変換済みの\n'
    printf '     templates/creator/freepages/%s.html と同一で、次を通っています。\n' "$slug"
    printf '       タグ整合 0件 / 本文無傷 / レスポンシブ 375・768・1440px 合格\n'
    if [ "$slug" = "ordercontract" ]; then
      printf '\n'
      printf '     引渡し時期は「7日以内」。PC版10日以内・スマホ版7日以内の食い違いを\n'
      printf '     山口様が確定されたものです（inventory/approved-content-changes.csv）。\n'
      printf '     本文を意図して変えた、この案件で唯一の箇所です。法定表示なので\n'
      printf '     テンプレートを触るときは必ずこの行を確認してください。\n'
    fi
    printf '   ========================================================================== *}>\n'
    printf '\n'
    printf '<h1 class="h-page">%s</h1>\n\n' "$head"
    cat "$f"
  } > "$out/$slug-body.tpl"
  printf "  %-16s -> %-24s %6s 行\n" "$slug" "$slug-body.tpl" "$(wc -l < "$out/$slug-body.tpl")"
done
