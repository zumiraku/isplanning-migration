#!/bin/sh
# =============================================================================
#  build-privacy-body.sh — プライバシーポリシーの本文をテンプレートに起こす
#
#  ※ このページには本文が入っていませんでした
#
#     privacy-body.tpl の中身は、調査中のメモ1つだけでした。
#
#       「このページは独自ページではありません（調査中）。
#         管理画面の独自ページ一覧（82件）に privacy.html は含まれていません…」
#
#     コメントではなく本文です。**そのままお客様に表示されます。** 個人情報の
#     取り扱いを書くべきページに、こちらの調査メモが出ている状態でした。
#     プレビューで初めて見えました。
#
#  なぜ本文が無かったか
#
#     このページはフッターの JavaScript から開くポップアップで、通常のリンクが
#     ありません。サイトマップにもクロール結果にも現れず、82件の独自ページにも
#     含まれないため、移行の調査から丸ごと漏れていました。
#
#     実体は /html/privacy.html にあります。EUC-JP のシステムページで、
#     window.resizeTo(590,500) の付いた 590×500 のポップアップです。中身は
#     テーブル組みの中の <pre> に、2,881文字がそのまま入っています。
#
#  取得したものは templates/basic-export/privacy.html に UTF-8 で保存済みです。
#  このスクリプトはそこから本文だけを取り出し、記事用のマークアップに直します。
#  文言は一字も変えません。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

SRC=templates/basic-export/privacy.html
OUT=templates/creator/mode/privacy-body.tpl

[ -f "$SRC" ] || { echo "missing $SRC" >&2; exit 1; }

perl -CS -0777 -e '
  my ($src, $out) = @ARGV;
  open my $i, "<:encoding(UTF-8)", $src or die "$src: $!";
  local $/; my $h = <$i>; close $i;

  my ($pre) = $h =~ /<pre[^>]*>(.*?)<\/pre>/si;
  die "no <pre> in $src\n" unless defined $pre;

  $pre =~ s/<br\s*\/?>/\n/gi;
  $pre =~ s/<[^>]+>//g;
  $pre =~ s/&nbsp;/ /g;
  $pre =~ s/\r\n?/\n/g;

  # 文字参照はそのまま残す（&amp; を & に戻すと二重エスケープの逆になる）
  my @lines = map { my $l = $_; $l =~ s/^\s+|\s+$//g; $l } split /\n/, $pre;

  my @out;
  my @para;
  my $flush = sub {
    return unless @para;
    push @out, "  <p>" . join("<br>\n     ", @para) . "</p>";
    @para = ();
  };

  for my $l (@lines) {
    if ($l !~ /\S/) { $flush->(); next; }
    # 「1．」「2.」で始まる行は節の見出し。
    # 区切り文字は原文のまま出します。「1、」を「1．」に直すのは体裁の統一では
    # なく文言の改変で、最初の版はそれをやっていました。
    if ($l =~ /^(\d+\s*[．.、・]\s*)(.+)$/) {
      $flush->();
      push @out, "  <h2>$1$2</h2>";
      next;
    }
    push @para, $l;
  }
  $flush->();

  my $body = join("\n", @out);
  my $chars = length($pre);

  open my $o, ">:encoding(UTF-8)", $out or die "$out: $!";
  print $o <<"HEAD";
<{* ==========================================================================
     プライバシーポリシー — Creator Mode（本文部分）

     ※ GENERATED — 直接編集しないでください。
        tools/build-privacy-body.sh が templates/basic-export/privacy.html
        から生成します。文言は現行サイトのままで、一字も変えていません。

     ここには以前、本文の代わりに調査中のメモが入っていました。コメントでは
     なく本文だったので、**そのままお客様に表示されます。** 個人情報の
     取り扱いを書くページに、こちらのメモが出ている状態でした。

     本文が無かった理由:
       このページはフッターの JavaScript から開くポップアップで、通常の
       リンクがありません。サイトマップにもクロール結果にも現れず、独自
       ページ82件にも含まれないため、調査から丸ごと漏れていました。
       実体は /html/privacy.html、EUC-JP のシステムページです。

     元の見た目は 590×500 のポップアップでしたが、ここでは通常のページと
     して出します。スマホでポップアップは開けません。
   ========================================================================== *}>

<h1 class="h-page">プライバシーポリシー</h1>

<div class="article">
$body
</div>
HEAD
  close $o;

  printf "生成: %s\n", $out;
  printf "  元の文字数 %d / 見出し %d / 段落 %d\n",
    $chars,
    scalar(grep { /^  <h2>/ } @out),
    scalar(grep { /^  <p>/ } @out);
' "$SRC" "$OUT"
