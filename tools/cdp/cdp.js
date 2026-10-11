const http = require("http");
const net = require("net");
const crypto = require("crypto");

const PORT = 9222;

function getJson(path) {
  return new Promise((ok, ng) => {
    const rq = http.get({ host: "127.0.0.1", port: PORT, path, timeout: 4000 }, r => {
      let s = ""; r.on("data", d => s += d); r.on("end", () => { try { ok(JSON.parse(s)); } catch (e) { ng(e); } });
    });
    rq.on("error", ng);
    rq.on("timeout", () => { rq.destroy(); ng(new Error("timeout")); });
  });
}

class Ws {
  constructor(sock) {
    this.sock = sock;
    this.buf = Buffer.alloc(0);
    this.waiters = [];
    this.frags = [];
    sock.on("data", d => { this.buf = Buffer.concat([this.buf, d]); this.drain(); });
  }
  drain() {
    for (;;) {
      if (this.buf.length < 2) { return; }
      const b0 = this.buf[0], b1 = this.buf[1];
      const fin = (b0 & 0x80) !== 0;
      const op = b0 & 0x0f;
      let len = b1 & 0x7f;
      let off = 2;
      if (len === 126) { if (this.buf.length < 4) { return; } len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) { return; } len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      if (this.buf.length < off + len) { return; }
      const payload = this.buf.slice(off, off + len);
      this.buf = this.buf.slice(off + len);
      if (op === 0x8) { this.sock.end(); return; }
      if (op === 0x9) { this.sendFrame(payload, 0xa); continue; }
      if (op === 0x1 || op === 0x0) {
        this.frags.push(payload);
        if (fin) {
          const text = Buffer.concat(this.frags).toString("utf8");
          this.frags = [];
          let msg; try { msg = JSON.parse(text); } catch (e) { continue; }
          const w = this.waiters.findIndex(x => x.id === msg.id);
          if (w >= 0) { const it = this.waiters[w]; this.waiters.splice(w, 1); it.ok(msg); }
        }
      }
    }
  }
  sendFrame(data, op) {
    const mask = crypto.randomBytes(4);
    const len = data.length;
    let head;
    if (len < 126) { head = Buffer.alloc(2); head[1] = 0x80 | len; }
    else if (len < 65536) { head = Buffer.alloc(4); head[1] = 0x80 | 126; head.writeUInt16BE(len, 2); }
    else { head = Buffer.alloc(10); head[1] = 0x80 | 127; head.writeBigUInt64BE(BigInt(len), 2); }
    head[0] = 0x80 | op;
    const masked = Buffer.from(data);
    for (let i = 0; i < masked.length; i++) { masked[i] ^= mask[i & 3]; }
    this.sock.write(Buffer.concat([head, mask, masked]));
  }
  send(id, method, params) {
    return new Promise(ok => {
      this.waiters.push({ id, ok });
      this.sendFrame(Buffer.from(JSON.stringify({ id, method, params: params || {} })), 0x1);
    });
  }
  close() { try { this.sock.end(); } catch (e) {  } }
}

function connect(wsUrl) {
  return new Promise((ok, ng) => {
    const u = new URL(wsUrl);
    const key = crypto.randomBytes(16).toString("base64");
    const sock = net.connect(Number(u.port || PORT), u.hostname, () => {
      sock.write(
        "GET " + u.pathname + u.search + " HTTP/1.1\r\n" +
        "Host: " + u.host + "\r\n" +
        "Upgrade: websocket\r\n" +
        "Connection: Upgrade\r\n" +
        "Sec-WebSocket-Key: " + key + "\r\n" +
        "Sec-WebSocket-Version: 13\r\n" +
        "Origin: http://127.0.0.1:" + PORT + "\r\n\r\n");
    });
    let head = Buffer.alloc(0);
    const onData = d => {
      head = Buffer.concat([head, d]);
      const at = head.indexOf("\r\n\r\n");
      if (at < 0) { return; }
      const status = head.slice(0, head.indexOf("\r\n")).toString();
      if (!/101/.test(status)) { sock.destroy(); ng(new Error("接続できません: " + status)); return; }
      const rest = head.slice(at + 4);
      sock.removeListener("data", onData);
      const ws = new Ws(sock);
      if (rest.length) { ws.buf = rest; ws.drain(); }
      ok(ws);
    };
    sock.on("data", onData);
    sock.on("error", ng);
  });
}

let seq = 1;

async function page(match) {
  const list = await getJson("/json/list");
  const pages = list.filter(t => t.type === "page");
  const hit = match ? pages.find(t => (t.url || "").indexOf(match) >= 0) : pages[0];
  if (!hit) {
    throw new Error("該当のタブがありません: " + match + "\n  開いているもの:\n" +
      pages.map(t => "    " + t.url).join("\n"));
  }
  const ws = await connect(hit.webSocketDebuggerUrl);
  return {
    url: hit.url,
    async evaluate(expr) {
      const r = await ws.send(seq++, "Runtime.evaluate",
        { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.result && r.result.exceptionDetails) {
        throw new Error("評価に失敗: " + JSON.stringify(r.result.exceptionDetails.exception || {}));
      }
      return r.result && r.result.result ? r.result.result.value : undefined;
    },
    async navigate(url) {
      await ws.send(seq++, "Page.enable");
      await ws.send(seq++, "Page.navigate", { url });
    },
    send(method, params) { return ws.send(seq++, method, params); },
    close() { ws.close(); }
  };
}

async function newTab(url) {
  await getJson("/json/new?" + encodeURIComponent(url));
}

module.exports = { getJson, page, newTab };

