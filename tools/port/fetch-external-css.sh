#!/bin/sh
# =============================================================================
#  fetch-external-css.sh — 店舗が外部に置いているCSSの控えを取る
#
#  ※ 店舗のスタイルシートは2本あります
#
#     共通head管理にこう書かれています。
#
#       <link rel="stylesheet" href="https://gigaplus.makeshop.jp/isplanning/css/default.css">
#
#     m_sys_common.css（8,479行）ばかり見ていて、こちらを見落としていました。
#     22KB・393クラスのユーティリティ集で、.mb10 .mt10 .clearfix .ta_c など、
#     テンプレートのあちこちで使われています。**片方だけ移すと、余白と
#     文字寄せが全部ずれます。**
#
#  なぜ控えを持つのか
#
#     配信自体は gigaplus のままで問題ありません（店舗のファイル置き場で、
#     モード切替とは無関係です）。控えを持つのは**検査のため**です。
#     check-css-coverage.sh がこれを読まないと、実際には当たっている
#     クラスを「CSSに無い」と33件報告し、本物の欠落がその中に埋もれます。
#
#     取りに行くのを検査のたびにやると、ネットが無い場所で落ちます。
# =============================================================================
set -e
cd "$(dirname "$0")/../.."

out=templates/basic-export/external
mkdir -p "$out"

url="https://gigaplus.makeshop.jp/isplanning/css/default.css"
dst="$out/gigaplus-default.css"

code=$(curl -sS -m 30 -A "Mozilla/5.0" -o "$dst.new" -w "%{http_code}" "$url" || echo 000)
if [ "$code" != "200" ]; then
  rm -f "$dst.new"
  echo "※ 取得できません（HTTP $code）。控えはそのままにします。" >&2
  exit 1
fi

# 中身がCSSであることを確かめてから置き換えます。エラーページを控えに
# してしまうと、検査が静かに嘘をつきます。
if ! grep -q '^\.' "$dst.new"; then
  rm -f "$dst.new"
  echo "※ CSSに見えません。控えはそのままにします。" >&2
  exit 1
fi

mv "$dst.new" "$dst"
printf "取得   : %s\n" "$url"
printf "控え   : %s\n" "$dst"
printf "サイズ : %s バイト / クラス %s 個\n" "$(wc -c < "$dst" | tr -d ' ')" "$(grep -c '^\.' "$dst" | tr -d ' ')"
