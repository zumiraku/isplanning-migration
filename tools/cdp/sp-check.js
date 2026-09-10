/* ---------------------------------------------------------------------------
   sp-check.js — 全ページ共通の中身と、スマートフォンの扱い

   ※ box-audit で、スマホ側の欄が全ページ 0 文字でした。

      クリエイターモードは PC とスマートフォンで別々のテンプレートを持てます。
      スマホ欄が空のまま適用して、**スマホで真っ白になる**ようなら、
      それが一番大きな事故です。実際にどうなるのかを確かめます。

      確かめること
        ① 全ページ共通（page_type=1）の HTML / CSS / JS の中身
        ② デザインセットに「スマートフォン」の設定があるか。
           あるなら、いまどちらに倒れているか
        ③ スマホ用プレビューが出せるか。出るなら中身があるか

     node tools/cdp/sp-check.js
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/";
const SET = 5;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitEditor(p, tries) {
  for (let i = 0; i < (tries || 40); i++) {
    await sleep(500);
    const ok = await p.evaluate("(typeof g_editor_object !== 'undefined' && Object.keys(g_editor_object).length > 0) ? 1 : 0");
    if (ok) { return true; }
  }
  return false;
}

const READ_ONE = `(function () {
  var out = {};
  ["html", "css", "javascript"].forEach(function (k) {
    ["pc", "smartphone"].forEach(function (d) {
      var ed = g_editor_object[k + "_" + d];
      var v = ed ? ed.getValue() : null;
      out[k + "_" + d] = (v === null) ? "(欄なし)" : v.length;
    });
  });
  /* ※ 全ページ共通には HTML 欄がありません。CSS と JavaScript だけです。
   *    ここを無条件に読んでいたので「開けません」と誤検知していました。 */
  out.editors = Object.keys(g_editor_object).join(" ");
  var h = g_editor_object.html_pc ? g_editor_object.html_pc.getValue() : "";
  out.head = (h.indexOf("$makeshop.head") >= 0);
  out.bodyTop = (h.indexOf("$makeshop.body_top") >= 0);
  out.bodyBottom = (h.indexOf("$makeshop.body_bottom") >= 0);
  out.viewport = (h.indexOf("viewport") >= 0);
  out.firstLine = h.slice(0, 90).replace(/[\\r\\n\\t ]+/g, " ");

  /* 画面にスマホ用の切り替えがあるか */
  out.tabs = Array.from(document.querySelectorAll("a, button, label, li, span"))
    .map(function (e) { return (e.innerText || "").replace(/[\\r\\n\\t ]+/g, " ").trim(); })
    .filter(function (t) { return t && t.length < 24 && /スマート|スマホ|PC|パソコン/.test(t); })
    .slice(0, 20);
  return out;
})()`;

(async () => {
  const p = await page();

  /* ① 全ページ共通 */
  await p.navigate(BASE + "flex_design_page_editor.html?design_set_id=" + SET + "&page_type=1");
  const ok = await waitEditor(p, 60);
  if (!ok) {
    console.log("① 全ページ共通  ※ 開けません（60秒待っても編集画面が出ません）");
  } else {
    const r = await p.evaluate(READ_ONE);
    console.log("① 全ページ共通（page_type=1）");
    console.log("   PC    HTML " + String(r.html_pc).padStart(6) +
                "  CSS " + String(r.css_pc).padStart(6) +
                "  JS " + String(r.javascript_pc).padStart(6));
    console.log("   スマホ HTML " + String(r.html_smartphone).padStart(6) +
                "  CSS " + String(r.css_smartphone).padStart(6) +
                "  JS " + String(r.javascript_smartphone).padStart(6));
    console.log("   必須タグ  head " + (r.head ? "○" : "※") +
                " / body_top " + (r.bodyTop ? "○" : "※") +
                " / body_bottom " + (r.bodyBottom ? "○" : "※") +
                " / viewport " + (r.viewport ? "○" : "※"));
    console.log("   ある欄    " + r.editors);
    console.log("   先頭      " + r.firstLine);
    console.log("   画面の切替 " + (r.tabs.length ? r.tabs.join(" | ") : "(見当たりません)"));
  }

  /* ② デザインセットの設定画面 */
  console.log("");
  console.log("② デザインセットの設定");
  await p.navigate(BASE + "flex_design_top.html");
  await sleep(6000);
  const set = await p.evaluate(`(function () {
    var out = { inputs: [], texts: [] };
    Array.from(document.querySelectorAll("input, select")).forEach(function (e) {
      var name = e.name || e.id || "";
      if (!name) { return; }
      out.inputs.push(name + "=" + (e.type === "checkbox" || e.type === "radio"
        ? (e.checked ? "on" : "off") : String(e.value).slice(0, 30)));
    });
    var b = document.body ? document.body.innerText : "";
    b.split(/[\\r\\n]+/).forEach(function (line) {
      var t = line.replace(/[\\t ]+/g, " ").trim();
      if (t && /スマート|スマホ|レスポンシブ|端末/.test(t)) { out.texts.push(t.slice(0, 100)); }
    });
    return out;
  })()`);
  console.log("   入力欄 : " + (set.inputs.length ? set.inputs.slice(0, 20).join(" , ") : "(なし)"));
  console.log("   記述   : " + (set.texts.length ? set.texts.slice(0, 10).join(" / ") : "(スマホに触れた記述なし)"));

  /* ③ 実機のスマホ表示。いまのベーシックモードで、スマホがどこへ行くか */
  console.log("");
  console.log("③ いまのスマホの入口（ベーシックモード）");
  const sp = await p.evaluate(`fetch("https://www.isp-sp.com/", { redirect: "manual" })
    .then(function (r) { return { status: r.status, type: r.type }; })
    .catch(function (e) { return { err: String(e).slice(0, 80) }; })`);
  console.log("   " + JSON.stringify(sp));

  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });
