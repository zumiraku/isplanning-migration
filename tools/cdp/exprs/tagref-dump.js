(function(){var t=document.body.innerText||"";var i=t.indexOf("$item.");return {len:t.length, part: i<0? "(item タグが見当たりません)" : t.slice(Math.max(0,i-200), i+2500)};})()
