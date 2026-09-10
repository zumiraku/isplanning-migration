/* recent-cap.js — 「最近チェックした商品」が何件まで出るかを確かめます */
const { page } = require("./cdp.js");
const { openAt, sleep } = require("./bind.js");

const ITEMS = [
  "003001000005", "000000020559", "000000014246", "000000020086",
  "003003000870", "003002000091", "003002000179", "003001000055",
  "051000000001", "051000000008", "000000018061", "000000020565"
];

const COUNT = `(function () {
  var r = document.querySelector("#r_recent, #M_recent, #middle_recent");
  if (!r) { return { 枠: false, 件数: 0 }; }
  var seen = {}, n = 0;
  Array.prototype.forEach.call(r.querySelectorAll('a[href*="/shopdetail/"], a[href*="/view/item/"]'), function (a) {
    var u = a.getAttribute("href");
    if (!seen[u]) { seen[u] = 1; n++; }
  });
  return { 枠: true, 件数: n };
})()`;

(async () => {
  const p = await page();
  console.log("履歴を作ります（" + ITEMS.length + " 商品）");
  for (const code of ITEMS) {
    await p.navigate("https://www.isp-sp.com/shopdetail/" + code + "/");
    await sleep(1800);
  }

  await p.navigate("https://www.isp-sp.com/"); await sleep(5000);
  const live = await p.evaluate(COUNT);
  console.log("現行トップ      : " + JSON.stringify(live));

  const bound = await openAt(p, 2, "/", 5000);
  if (!bound.ok) { console.error("※ " + bound.why); p.close(); process.exit(1); }
  const nu = await p.evaluate(COUNT);
  console.log("移植版トップ    : " + JSON.stringify(nu));
  p.close();

  console.log("");
  console.log(live.件数 === nu.件数
    ? "OK 同じ件数です（上限は同じか、どちらも履歴の件数どおり）"
    : "※ 件数が違います。現行に合わせて max を入れてください");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

