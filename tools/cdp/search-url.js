const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const WORD = process.argv[2] || "ティッシュ";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=5");
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    if (await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { break; }
  }
  await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
  let url = "";
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    url = await p.evaluate("location.href");
    if (url.indexOf("isp-sp.com") >= 0) { break; }
  }
  await sleep(2500);

  const ptk = (url.match(/ptk=([0-9a-f]+)/) || [])[1] || "";
  console.log("プレビューの鍵: " + (ptk ? ptk.slice(0, 12) + "…" : "(取れません)"));
  console.log("");

  const tries = [
    "/view/search?search_keyword=" + encodeURIComponent(WORD),
    "/view/search?keyword=" + encodeURIComponent(WORD),
    "/view/search?search_keyword=" + encodeURIComponent(WORD) + "&sort=recommend"
  ];

  for (const t of tries) {
    const full = "https://www.isp-sp.com" + t + (ptk ? "&ptk=" + ptk : "");
    await p.navigate(full);
    await sleep(4000);
    const r = await p.evaluate(`(function(){
      var b = document.body ? document.body.innerText : "";
      var m = b.match(/全\\s*([0-9,]+)\\s*件/);
      var box = document.querySelector("#MakeShopTopSearchInput, #r_searchInput, input[data-id=makeshop-search-keyword]");
      return { url: location.href, hits: m ? m[1] : "(件数が読めません)",
               items: document.querySelectorAll(".categorylist, .lims, .M_cl_img").length,
               box: box ? (box.value || "(空)") : "(検索窓なし)",
               title: document.title.slice(0, 40) };
    })()`);
    console.log(t);
    console.log("   件数 " + r.hits + " / 商品要素 " + r.items + " / 検索窓の中身 " + r.box);
  }
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

