/* ---------------------------------------------------------------------------
   launch.js — ログイン済みのセッションを持ったChromeを、操作できる状態で立てる

   管理画面の「保存」がサーバーに届いていません。画面は編集画面のまま
   接続だけが切れる壊れ方をするので、**押した結果を機械で読まないと
   判断できません。** そのための土台です。

   ※ 既定のプロファイルでは、遠隔操作の口が開きません

      Chrome 136 から、`--user-data-dir` が既定の場所のままだと
      `--remote-debugging-port` は**黙って無視されます。** 終了コードは 0、
      DevToolsActivePort も作られず、「起動したのにポートが閉じている」
      という形で失敗します。ここで2回はまりました。

      別の場所に写したプロファイルで立てます。

   ※ 起動中のChromeがあると、指定は黙って捨てられます

      Chrome は同じプロファイルの2つ目を立てず、**既に動いているほうに
      URL を渡して終了します。** 終了コードは 0 です。閉じてから立てます。

   ※ 写すのはセッションに要るものだけです。パスワードの保管庫
      （Login Data）には触れません。**必要なのはログイン済みの状態**で、
      パスワードそのものは要りません。
--------------------------------------------------------------------------- */
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const http = require("http");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const REAL = "C:/Users/Administrator/AppData/Local/Google/Chrome/User Data";
const WORK = (process.env.TEMP || "C:/Windows/Temp").split("\\").join("/") + "/isp-cdp-profile";
const PORT = 9222;
const OPEN_AT = "https://console.makeshop.jp/design/editor?shopId=isplanning";

function count() {
  try {
    return execSync('tasklist /FI "IMAGENAME eq chrome.exe" /FO CSV').toString()
      .split("chrome.exe").length - 1;
  } catch (e) { return -1; }
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function version() {
  return new Promise(ok => {
    const rq = http.get({ host: "127.0.0.1", port: PORT, path: "/json/version", timeout: 1200 },
      r => { let s = ""; r.on("data", d => s += d); r.on("end", () => ok(s)); });
    rq.on("error", () => ok(null));
    rq.on("timeout", () => { rq.destroy(); ok(null); });
  });
}

(async () => {
  if (await version()) { console.log("すでに操作できる状態です"); return; }

  for (let i = 0; i < 12 && count() > 0; i++) {
    try { execSync("taskkill /IM chrome.exe /F", { stdio: "ignore" }); } catch (e) { /* いなければよい */ }
    await sleep(700);
  }
  console.log("Chromeを閉じました（プロセス数 " + count() + "）");

  /* ※ 立て直すたびにログインが飛んでいました（2026-09-09）
   *
   *    ここは毎回 WORK を**消して**、既定のプロファイルから写し直して
   *    いました。ところが管理画面にログインしたのは**この一時プロファイル
   *    の中**です。消せば、そのログインごと消えます。
   *
   *    タブを1つ閉じただけで Chrome が終了したあと、何も考えずに
   *    立て直すとセッションを失います。すでに一時プロファイルがあるなら
   *    そのまま使います。作り直したいときだけ --fresh を付けてください。 */
  const fresh = process.argv.indexOf("--fresh") >= 0;
  const have = fs.existsSync(WORK + "/Default/Network/Cookies");
  if (have && !fresh) {
    console.log("一時プロファイルをそのまま使います（ログインを保ちます）");
    console.log("  作り直すときだけ: node tools/cdp/launch.js --fresh");
  } else {
    fs.rmSync(WORK, { recursive: true, force: true });
    fs.mkdirSync(WORK + "/Default/Network", { recursive: true });
    const want = [
      "/Local State",
      "/Default/Network/Cookies",
      "/Default/Preferences"
    ];
    for (const f of want) {
      try { fs.copyFileSync(REAL + f, WORK + f); console.log("  写した: " + f); }
      catch (e) { console.log("  ※ 写せない: " + f + " — " + e.code); }
    }
  }

  const c = spawn(CHROME, [
    "--remote-debugging-port=" + PORT,
    "--remote-allow-origins=*",
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=" + WORK,
    "--profile-directory=Default",
    OPEN_AT
  ], { detached: true, stdio: "ignore" });
  c.unref();

  for (let i = 0; i < 40; i++) {
    await sleep(500);
    const v = await version();
    if (v) { console.log("開きました: " + v.replace(/\s+/g, " ").slice(0, 140)); return; }
  }
  console.log("※ ポートが開きません / プロセス数 " + count());
})();
