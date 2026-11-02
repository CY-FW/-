/* 重生2000：娱乐圈 — 程序化 SVG 立绘
 * 纯前端、离线可用，不依赖任何图片素材，也不绘制真人相貌（保持空架设定）。
 * 立绘由角色 id 的哈希决定配色/性别剪影/职业图标/姓氏尾字，稳定且唯一。
 * 若想换成真实画师或本地模型生成的图：把 PNG 放进本目录 data/portraits/<id>.png，
 *   并在 game.js 中优先读取该文件即可（下方 exports.hasCustom 预留）。
 */
window.PORTRAITS = (function () {
  let counter = 0;
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const CAREER_ICON = {
    music: "♪", film: "✶", production: "✎", industry: "$", variety: "★",
  };
  function careerOf(npc) {
    if (!npc) return "music";
    const k = (npc.kind || "") + "|" + (npc.careerTrack || "") + "|" + (npc.professions || []).join(",");
    if (/music|唱/.test(k)) return "music";
    if (/film|影|综艺|variety/.test(k)) return "film";
    if (/production|导演|创作|creator/.test(k)) return "production";
    if (/industry|资本|经纪|制片/.test(k)) return "industry";
    return "music";
  }
  function portrait(opt) {
    opt = opt || {};
    const id = opt.id || "x";
    const name = opt.name || "?";
    const gender = opt.gender === "女" ? "f" : "m";
    const h = hash(id);
    const bg1 = `hsl(${h % 360},42%,24%)`;
    const bg2 = `hsl(${(h + 45) % 360},48%,13%)`;
    const skin = gender === "f" ? "#f4ccba" : "#e9b893";
    const hair = gender === "f" ? `hsl(${(h + 170) % 360},38%,34%)` : `hsl(${(h + 200) % 360},26%,20%)`;
    const cloth = gender === "f" ? `hsl(${(h + 20) % 360},35%,40%)` : `hsl(${(h + 220) % 360},30%,38%)`;
    const ch = (name.length >= 2 ? name.slice(-2) : name); // 末两字作标识
    const tierRing = { A: "#ffd54a", B: "#9fb4ff", C: "#8a8fa8" }[opt.tier || "C"];
    const isSelf = id === "player";
    const ring = isSelf ? "#46e0a0" : tierRing;
    const car = isSelf ? "✦" : CAREER_ICON[careerOf(opt.npc || opt)] || "♪";
    const gid = "pg" + (counter++);
    // 抽象剪影：头 + 肩，避免任何写实人像
    const hairShape = gender === "f"
      ? `<path d="M30 44 Q34 22 50 22 Q66 22 70 44 Q70 36 50 34 Q30 36 30 44 Z" fill="${hair}"/>
         <path d="M28 46 Q26 70 32 78 L36 70 Q32 58 34 48 Z" fill="${hair}"/>
         <path d="M72 46 Q74 70 68 78 L64 70 Q68 58 66 48 Z" fill="${hair}"/>`
      : `<path d="M31 44 Q34 24 50 24 Q66 24 69 44 Q64 34 50 33 Q36 34 31 44 Z" fill="${hair}"/>`;
    const shoulders = gender === "f"
      ? `<path d="M22 100 Q22 68 50 68 Q78 68 78 100 Z" fill="${cloth}"/>`
      : `<path d="M16 100 Q20 64 50 64 Q80 64 84 100 Z" fill="${cloth}"/>`;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="portrait" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>
      </linearGradient></defs>
      <rect width="100" height="100" rx="14" fill="url(#${gid})"/>
      ${shoulders}
      <rect x="44" y="56" width="12" height="16" rx="4" fill="${skin}"/>
      <circle cx="50" cy="44" r="18" fill="${skin}"/>
      ${hairShape}
      <text x="50" y="49" font-size="15" text-anchor="middle" fill="#10101a" font-family="sans-serif" font-weight="700">${ch}</text>
      <circle cx="50" cy="50" r="47" fill="none" stroke="${ring}" stroke-width="3"/>
      <circle cx="83" cy="17" r="11" fill="#10101a" stroke="${ring}" stroke-width="1.5"/>
      <text x="83" y="22" font-size="13" text-anchor="middle" fill="${ring}" font-family="sans-serif">${car}</text>
    </svg>`;
  }
  function hasCustom(id) { return false; } // 预留：将来 data/portraits/<id>.png 存在时返回 true
  return { portrait, hasCustom, careerOf };
})();
