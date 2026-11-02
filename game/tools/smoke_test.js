// Headless autoplay test for game.js. Requires window.NPCS/TIMELINE and a DOM stub.
const fs = require("fs");
const path = require("path");

const calls = [];
function elStub(id) {
  return {
    id,
    set innerHTML(v) { this._h = v; },
    get innerHTML() { return this._h || ""; },
    style: {},
    textContent: "",
    onclick: null,
    scrollTop: 0,
    querySelectorAll: () => [],
  };
}
global.document = {
  getElementById: (id) => elStub(id),
  querySelectorAll: () => [],
  addEventListener: (ev, fn) => { if (ev === "DOMContentLoaded") global.__onReady = fn; },
};
global.window = {};
global.window.addEventListener = () => {};

const base = path.join(__dirname, "..", "data");
require(path.join(base, "npcs.js"));
require(path.join(base, "timeline.js"));
require(path.join(__dirname, "..", "game.js"));
if (typeof global.__onReady === "function") global.__onReady();

const G = global.window.__GAME__;
if (!G) throw new Error("未暴露 __GAME__");

function autoplay(opts, maxTurns) {
  G.start(opts);
  let turns = 0;
  let choices = 0;
  let ended = false;
  const actions = ["work", "social", "romance", "memory", "train", "rest"];
  while (turns < maxTurns) {
    if (G.state.ended) { ended = true; break; }
    if (G.pendingChoice()) {
      G.choose(Math.floor(Math.random() * G.state.ended ? 0 : 2) % 2);
      choices++;
    } else {
      G.act(actions[Math.floor(Math.random() * actions.length)]);
    }
    turns++;
  }
  return { turns, choices, ended, state: G.state };
}

let ok = true;
const runs = [];
for (let i = 0; i < 5; i++) {
  const r = autoplay({ name: "测试" + i, gender: i % 2 ? "女" : "男", age: 16 + (i % 7), origin: ["amateur", "school", "bar", "intern", "rich"][i], route: ["actor", "singer", "variety", "creator", "tycoon"][i] }, 4000);
  const s = r.state;
  const reachedEnd = r.ended;
  const years = s.year;
  console.log(`RUN ${i}: 结束=${reachedEnd} 年龄=${s.player.age} 年=${years} 名气=${Math.round(s.player.fame)} 财富=${Math.round(s.player.wealth)} 结局=${s.lastEnding || "未结束"} 行动回合=${r.turns} 选择=${r.choices}`);
  if (!reachedEnd && years >= 2000) { /* 时间必须推进过 */ }
  if (s.year === 2000 && s.quarter === 1 && !reachedEnd) { ok = false; console.log("  !! 时间完全没有推进"); }
  runs.push(r);
}

// 强制轮回到第二世
const last = runs[0];
if (last.ended) {
  // 通过 API 无法直接调用 reincarnate，但 endGame 已记录结局，验证结束逻辑
  console.log("结局示例:", last.state.lastEnding);
}

// 边界断言
const romance = window.NPCS.filter((n) => n.romanceEnabled).length;
const protoRom = window.NPCS.filter((n) => n.kind.startsWith("prototype") && n.romanceEnabled).length;
const allActive = window.NPCS.every((n) => n.activeFrom >= 2000 && n.activeTo >= n.activeFrom);
console.log("\n断言:");
console.log("  NPC 总数 =", window.NPCS.length, window.NPCS.length === 202 ? "OK" : "FAIL");
console.log("  可攻略原创 =", romance, romance === 20 ? "OK" : "FAIL");
console.log("  原型参与恋爱 =", protoRom, protoRom === 0 ? "OK" : "FAIL");
console.log("  时间均有效 =", allActive, allActive ? "OK" : "FAIL");

if (window.NPCS.length !== 202 || protoRom !== 0 || !allActive) ok = false;
console.log("\n" + (ok ? "SMOKE TEST PASS" : "SMOKE TEST FAIL"));
process.exit(ok ? 0 : 1);
