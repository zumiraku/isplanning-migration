<{* 一覧の価格に桁区切りがありません。
     現行 39,600円（税込） / 移植版 39600円（税込）
     一覧用のタグには price_html がないので、修飾子が使えるかを見ます。 *}>
ZQplainSTART<{$item.price}>ZQplainEND
ZQhtmlSTART<{$item.price_html}>ZQhtmlEND
ZQnfSTART<{$item.price|number_format}>ZQnfEND
ZQnf0START<{$item.price|number_format:0}>ZQnf0END
ZQsfSTART<{$item.price|string_format:"%d"}>ZQsfEND
ZQexclSTART<{$item.price_excluded_tax}>ZQexclEND
ZQexclHtmlSTART<{$item.price_excluded_tax_html}>ZQexclHtmlEND
