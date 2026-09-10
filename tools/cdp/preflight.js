/* preflight.js — 「ショップに適用」を押す前の、最後の確認 */
const { page } = require("./cdp.js");

const LIST = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_top.html";
const WANT_ID = 5;
const WANT_NAME = "発見マーケット_移行版";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const READ = `(function () {
  var out = { url: location.href, title: document.title, sets: [], mode: "", buttons: [] };

  var canon = document.querySelector("link[rel=canonical]");
  out.canonical = canon ? canon.href : "(なし)";

  var body = document.body ? document.body.innerText : "";
  out.loginLike = /ログイン|login|パスワード/i.test(document.title) ||
                  (out.canonical.indexOf("/login") >= 0);

  var m = body.match(/(ベーシックモード|クリエイターモード)[^\\n]{0,10}適用中/);
  out.mode = m ? m[0] : "(読み取れません)";

  /* 適用ボタンは onclick に design_set_id を持っています */
  var all = Array.from(document.querySelectorAll("a, button, input[type=button], input[type=submit]"));
  all.forEach(function (e) {
    var label = (e.innerText || e.value || "").replace(/[\\r\\n\\t ]+/g, " ").trim();
    var on = e.getAttribute("onclick") || e.getAttribute("href") || "";
    if (label.indexOf("適用") >= 0 || /apply|applyDesign/i.test(on)) {
      out.buttons.push({ label: label.slice(0, 30), on: on.slice(0, 120) });
    }
  });

  /* セット一覧は行単位で読みます */
  var seen = {};
  Array.from(document.querySelectorAll("*")).forEach(function (e) {
    var t = (e.innerText || "");
    if (t.indexOf("最終更新日") < 0) { return; }
    if (e.querySelectorAll("*").length > 30) { return; }
    var flat = t.replace(/[\\r\\n\\t ]+/g, " ").trim();
    if (seen[flat]) { return; }
    seen[flat] = 1;
    var ids = [];
    Array.from(e.querySelectorAll("a, button, input")).forEach(function (b) {
      var on = (b.getAttribute("onclick") || b.getAttribute("href") || "");
      var mm = on.match(/design_set_id[=,: ]+.?(\\d+)/) || on.match(/\\((\\d+)[,)]/);
      if (mm) { ids.push(mm[1]); }
    });
    out.sets.push({ text: flat.slice(0, 120), ids: ids.join(",") });
  });
  return out;
})()`;

(async () => {
  const p = await page();
  await p.navigate(LIST);
  await sleep(7000);
  const r = await p.evaluate(READ);

  const jst = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  }).format(new Date());

  console.log("確認時刻（JST）: " + jst);
  console.log("URL           : " + r.url);
  console.log("canonical     : " + r.canonical);
  console.log("");

  let ng = 0;

  if (r.loginLike || r.url.indexOf("login") >= 0) {
    console.log("① セッション        ※ 切れています。ここで止めます");
    ng++;
  } else if (!r.sets.length) {
    console.log("① セッション        ※ 一覧が読めません（切れている可能性）");
    ng++;
  } else {
    console.log("① セッション        OK 生きています（一覧 " + r.sets.length + " 件）");
  }

  console.log("② いまのモード      " + r.mode);

  console.log("");
  console.log("③ デザインセット一覧");
  let found = null;
  r.sets.forEach(function (s, i) {
    const hit = s.text.indexOf(WANT_NAME) >= 0;
    if (hit) { found = s; }
    console.log("   " + (hit ? "→ " : "  ") + String(i).padStart(2) + "  [id " + (s.ids || "?") + "]  " + s.text);
  });
  console.log("");
  if (found) {
    console.log("   " + WANT_NAME + " OK あります（id " + found.ids + "）");
    if (found.ids.split(",").indexOf(String(WANT_ID)) < 0) {
      console.log("   ※ 期待した design_set_id=" + WANT_ID + " が行に見当たりません");
      ng++;
    }
  } else {
    console.log("   ※ " + WANT_NAME + " が一覧にありません");
    ng++;
  }

  console.log("");
  console.log("④ 適用ボタン " + r.buttons.length + " 個");
  r.buttons.slice(0, 12).forEach(function (b) {
    console.log("   " + b.label.padEnd(12) + "  " + b.on);
  });

  p.close();
  console.log("");
  console.log(ng ? "※ 押せません。" + ng + " 件" : "OK 前提は満たしています");
  if (ng) { process.exit(1); }
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

