/* JPEGのSOFマーカーから縦横を読むだけの小道具。移植で「一覧にどのサイズの
   画像を出すか」を、推測ではなく実寸で決めるために使います。 */
const fs = require("fs");
const b = fs.readFileSync(process.argv[2]);
let i = 2;
while (i < b.length) {
  if (b[i] !== 0xFF) { i++; continue; }
  const m = b[i + 1];
  if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
    console.log(b.readUInt16BE(i + 7) + " x " + b.readUInt16BE(i + 5));
    process.exit(0);
  }
  i += 2 + b.readUInt16BE(i + 2);
}
console.log("読めません");
