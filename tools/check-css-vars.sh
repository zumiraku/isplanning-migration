#!/bin/sh
files="templates/creator/css/tokens.css templates/creator/css/components.css templates/creator/css/freepage.css"

defined=$(perl -CSD -0777 -ne 'while(/(--[a-z0-9-]+)\s*:/g){ print "$1\n" }' $files 2>/dev/null | sort -u)
echo "defined custom properties : $(echo "$defined" | grep -c .)"
echo ""

: > /tmp/_undef.txt
for f in $files; do
  [ -f "$f" ] || continue
  base=$(basename "$f")
  perl -CSD -0777 -ne 'while(/var\(\s*(--[a-z0-9-]+)/g){ print "$1\n" }' "$f" | sort -u | while IFS= read -r v; do
    [ -z "$v" ] && continue
    if ! echo "$defined" | grep -qx -- "$v"; then
      echo "  UNDEFINED  $v   in $base" >> /tmp/_undef.txt
    fi
  done
done

cat /tmp/_undef.txt
n=$(wc -l < /tmp/_undef.txt)
echo ""
echo "undefined variables used  : $n"
if [ "$n" -eq 0 ]; then
  echo "every var() resolves"
else
  exit 1
fi

