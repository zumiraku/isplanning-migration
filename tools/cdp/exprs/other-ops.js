(function(){var b=Array.from(document.querySelectorAll("button")).filter(function(x){return (x.innerText||"").indexOf("その他の操作")>=0;})[0];if(!b)return "(無し)";b.click();return "clicked";})()
