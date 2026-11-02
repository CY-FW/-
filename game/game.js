/* 重生2000：娱乐圈 — 游戏引擎
 * 纯前端，双击 index.html 即可运行。数据来自 data/npcs.js 与 data/timeline.js。
 * 设定边界：原型 NPC 只承载公开事业与良性竞争；恋爱/重冲突剧情只由原创角色承担。
 */
(function () {
  "use strict";

  const ATTRS = [
    { key: "look", name: "颜值", desc: "试镜、广告、偶像路线" },
    { key: "sing", name: "唱功", desc: "歌手路线、晚会、专辑" },
    { key: "act", name: "演技", desc: "影视路线、奖项" },
    { key: "talent", name: "才华", desc: "创作、写歌写剧本、幕后" },
    { key: "social", name: "人脉", desc: "资源、贵人、机会" },
    { key: "luck", name: "运气", desc: "随机事件、爆火概率" },
  ];

  const TALENTS = [
    { id: "t_ear", name: "绝对音感", desc: "唱功类作品成功率 +15%" },
    { id: "t_act", name: "天生演技", desc: "演技类作品成功率 +15%" },
    { id: "t_look", name: "天生丽质", desc: "颜值初始 +10，外观资源更多" },
    { id: "t_social", name: "社交天赋", desc: "社交行动额外 +5 好感/信任" },
    { id: "t_write", name: "创作天才", desc: "才华类作品成功率 +20%" },
    { id: "t_biz", name: "商业头脑", desc: "每次成功作品财富收益 +30%" },
    { id: "t_koi", name: "锦鲤体质", desc: "随机事件更偏向好运" },
    { id: "t_memory", name: "记忆清晰", desc: "每年前世记忆次数 +1" },
    { id: "t_lucky", name: "贵人运", desc: "更容易在高阶层遇到提携" },
  ];

  const ORIGINS = [
    { id: "amateur", name: "素人", mods: { look: -5, social: -8 }, note: "一穷二白，机会靠自己撞" },
    { id: "school", name: "艺校学生", mods: { act: 8, sing: 6, social: 2 }, note: "有基础训练与人脉种子" },
    { id: "extra", name: "北漂群演", mods: { act: 4, social: -2 }, note: "在片场摸爬滚打，认识底层同行" },
    { id: "bar", name: "酒吧驻唱", mods: { sing: 10, social: 0 }, note: "唱功扎实，靠现场攒人气" },
    { id: "intern", name: "电视台实习生", mods: { social: 8, talent: 4 }, note: "离资源近，容易听到风声" },
    { id: "rich", name: "富二代", mods: { social: 6, luck: 6 }, note: "能自掏腰包做宣传，但易被贴标签" },
    { id: "family", name: "影视世家子弟", mods: { act: 6, social: 10 }, note: "圈内有人叫叔叔阿姨，起点高" },
  ];

  const ROUTES = [
    { id: "singer", name: "歌手", need: "sing", kind: "music" },
    { id: "actor", name: "演员", need: "act", kind: "film" },
    { id: "variety", name: "综艺艺人", need: "look", kind: "film" },
    { id: "creator", name: "导演·幕后", need: "talent", kind: "production" },
    { id: "tycoon", name: "资本·开公司", need: "social", kind: "industry" },
  ];

  // 恋爱事件与重冲突剧情：始终由内置的原创 NPC 承担，不进入可被外部覆盖的 EVENTS。
  const ROMANCE_EVENTS = [
    {
      id: "r_meet", title: "初遇",
      text: "{n} 在一次行业聚会上注意到你，你们聊得很投缘。",
      opts: [
        { t: "主动接近", aff: 18, mood: 6, trust: 4 },
        { t: "保持距离", aff: 4, mood: -2 },
      ],
    },
    {
      id: "r_date", title: "约会",
      text: "你和 {n} 单独约了一次会，气氛微妙。",
      cond: (r) => r.affection >= 30,
      opts: [
        { t: "认真相处", aff: 20, trust: 12, mood: 10 },
        { t: "只是玩玩", aff: 6, trust: -10, mood: 2 },
      ],
    },
    {
      id: "r_public", title: "公开与否",
      text: "狗仔开始拍到你们同行，{n} 问你怎么办。",
      cond: (r) => r.affection >= 50,
      opts: [
        { t: "低调隐恋", aff: 10, reputation: 2, mood: 4 },
        { t: "大方公开", aff: 16, fame: 6, reputation: -2, mood: 8 },
        { t: "否认切割", aff: -25, trust: -15, mood: -8 },
      ],
    },
    {
      id: "r_crisis", title: "聚少离多",
      text: "你连轴转赶行程，{n} 觉得被冷落了。",
      cond: (r) => r.affection >= 50 && r.trust >= 40,
      opts: [
        { t: "抽空陪伴", aff: 12, trust: 10, mood: 6, wealth: -8 },
        { t: "解释事业", aff: -6, trust: 4 },
      ],
    },
    {
      id: "r_commit", title: "修成正果",
      text: "{n} 答应了和你认真走下去。",
      cond: (r) => r.affection >= 75 && r.trust >= 65,
      opts: [
        { t: "订婚", aff: 20, trust: 20, mood: 20, title: "与{n}订婚" },
        { t: "再想想", aff: -8, trust: -8 },
      ],
    },
  ];

  // 事业/社交/人生事件从 data/events.js（window.EVENTS）读取；缺省时回退到内置精简表。
  const CAREER_EVENTS = (window.EVENTS && window.EVENTS.career) || [];
  const SOCIAL_EVENTS = (window.EVENTS && window.EVENTS.social) || [];
  const LIFE_EVENTS = (window.EVENTS && window.EVENTS.life) || [];

  function eraOk(ev) {
    if (!ev.era) return true;
    return S.year >= ev.era[0] && S.year <= ev.era[1];
  }
  function condOk(ev, r) {
    if (!ev.cond) return true;
    if (ev.cond.trust !== undefined && (!r || r.trust < ev.cond.trust)) return false;
    if (ev.cond.aff !== undefined && (!r || r.affection < ev.cond.aff)) return false;
    return true;
  }

  // ---------- 运行时状态 ----------
  let S = null;
  let lastOutcome = null;

  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[rnd(arr.length)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function activeNpcs(year) {
    return window.NPCS.filter((n) => n.activeFrom <= year && n.activeTo >= year);
  }

  function relOf(id) {
    if (!S.relations[id]) {
      const base = (window.NPCS.find((n) => n.id === id) || {}).initialRelation || { affection: 0, trust: 0, interest: 0, favorDebt: 0 };
      S.relations[id] = Object.assign({}, base);
    }
    return S.relations[id];
  }

  function newGame() {
    S = {
      player: { name: "", gender: "男", age: 18, origin: "amateur", attrs: {}, fame: 0, wealth: 10, reputation: 0, health: 80, mood: 60, stamina: 100 },
      year: 2000, quarter: 1, route: "actor",
      talents: [], memoriesUsed: 0, divergence: 0, memoryChance: 1,
      relations: {}, log: [], achievements: [], generation: 1,
      works: [], partner: null, ended: false,
      graph: { nodes: [], edges: [] }, beatenNpc: {},
    };
    ATTRS.forEach((a) => (S.player.attrs[a.key] = 30 + rnd(20)));
    renderSetup();
  }

  function applyOrigin() {
    const o = ORIGINS.find((x) => x.id === S.player.origin);
    Object.keys(o.mods).forEach((k) => (S.player.attrs[k] = clamp((S.player.attrs[k] || 0) + o.mods[k], 0, 100)));
    if (S.talents.includes("t_look")) S.player.attrs.look = clamp(S.player.attrs.look + 10, 0, 100);
  }

  function startLife() {
    applyOrigin();
    S.graph.nodes.push({ id: "player", label: S.player.name + "(你)", kind: "self" });
    S.memoryChance = 1 + (S.talents.includes("t_memory") ? 1 : 0);
    const o = ORIGINS.find((x) => x.id === S.player.origin);
    const rt = ROUTES.find((r) => r.id === S.route);
    pushLog(`【第 ${S.generation} 世 · ${S.year}】你以 ${S.player.age} 岁之龄重生回 ${S.player.gender === "男" ? "男" : "女"}主角的身体里，起点：${o.name}。目标路线：${rt.name}。`);
    const pro = (window.NARRATIVE && window.NARRATIVE.prologue[S.player.origin]) || "";
    if (pro) pushLog(fillPrologue(pro));
    renderMain();
  }

  function fillPrologue(t) {
    return t
      .replace("{name}", S.player.name)
      .replace("{gender}", S.player.gender)
      .replace("{age}", S.player.age)
      .replace("{route}", ROUTES.find((r) => r.id === S.route).name);
  }

  function pushLog(t) {
    S.log.unshift("[" + S.year + " Q" + S.quarter + "] " + t);
    if (S.log.length > 200) S.log.pop();
  }

  function grantAch(title) {
    if (!title) return;
    if (!S.achievements.includes(title)) S.achievements.push(title);
    if (!S.graph.nodes.some((x) => x.label === title)) S.graph.nodes.push({ label: title, kind: "ach" });
  }

  function addEdge(a, b, kind) {
    if (!a || !b) return;
    if (!S.graph.nodes.some((x) => x.id === a)) S.graph.nodes.push({ id: a, label: a, kind: "npc" });
    if (!S.graph.nodes.some((x) => x.id === b)) S.graph.nodes.push({ id: b, label: b, kind: "npc" });
    if (!S.graph.edges.some((e) => e.from === a && e.to === b && e.kind === kind)) {
      S.graph.edges.push({ from: a, to: b, kind });
    }
  }

  // ---------- 行动 ----------
  function doWork() {
    if (S.player.stamina < 25 && !spendStamina(25)) { flash("体力不足，先休息或选轻松行动。"); return; }
    spendStamina(25);
    const route = ROUTES.find((r) => r.id === S.route);
    const evs = CAREER_EVENTS.filter((e) => eraOk(e) && (!e.need || e.need === route.kind));
    if (evs.length === 0) { flash("这阶段暂时没有合适的公开工作机会，换个行动吧。"); return; }
    const ev = pick(evs);
    let text = ev.text;
    const needVal = S.player.attrs[route.need] || 0;
    if (ev.need === true) text = "一个剧组开放试镜，需要你的" + ATTRS.find((a) => a.key === route.need).name + "（当前 " + needVal + "）支撑。";
    runChoice({
      title: ev.title, text, opts: ev.opts, kind: "work", route, attr: route.need, evId: ev.id,
    });
  }

  function doSocial() {
    if (S.player.stamina < 15 && !spendStamina(15)) { flash("体力不足，先休息或选轻松行动。"); return; }
    spendStamina(15);
    const pool = activeNpcs(S.year).filter((n) => n.id !== "player" && (!S.partner || n.id !== S.partner));
    const n = pick(pool);
    const r = relOf(n.id);
    const ev = pick(SOCIAL_EVENTS.filter((e) => eraOk(e) && condOk(e, r)));
    resolveSocialEvent(ev, n, r);
  }

  function doRomance() {
    if (S.player.stamina < 20 && !spendStamina(20)) { flash("体力不足，先休息或选轻松行动。"); return; }
    spendStamina(20);
    if (!S.partner) {
      const pool = activeNpcs(S.year).filter((n) => n.romanceEnabled && relOf(n.id).affection >= 10);
      if (pool.length === 0) {
        const fresh = activeNpcs(S.year).filter((n) => n.romanceEnabled);
        const n = pick(fresh);
        const r = relOf(n.id);
        resolveRomanceEvent(ROMANCE_EVENTS[0], n, r);
        return;
      }
      const n = pick(pool);
      const r = relOf(n.id);
      resolveRomanceEvent(pick(ROMANCE_EVENTS.filter((e) => !e.cond || e.cond(r))), n, r);
    } else {
      const n = window.NPCS.find((x) => x.id === S.partner);
      const r = relOf(n.id);
      resolveRomanceEvent(pick(ROMANCE_EVENTS.filter((e) => !e.cond || e.cond(r))), n, r);
    }
  }

  function doMemory() {
    if (S.memoriesUsed >= S.memoryChance) {
      flash("今年前世记忆已用完（每年 " + S.memoryChance + " 次）。");
      return;
    }
    spendStamina(10);
    const tier = S.divergence > 40 ? "low" : S.divergence > 15 ? "medium" : "high";
    const future = window.TIMELINE.filter((y) => y.year > S.year && y.year <= S.year + 6);
    if (future.length === 0) { flash("已经走到时间尽头，没有更多前世记忆可取。"); return; }
    const yr = pick(future);
    const ok = tier === "high" ? 0.9 : tier === "medium" ? 0.65 : 0.4;
    S.memoriesUsed++;
    if (Math.random() < ok) {
      const w = yr.opportunity;
      S.works.push({ year: S.year, type: w.type, title: "（记忆）《" + w.title + "》雏形", fromMemory: true });
      const gain = 6;
      S.player.talent = clamp(S.player.talent + gain, 0, 100);
      pushLog(`前世记忆清晰：你想起 ${yr.year} 年的「${w.title}」方向——${w.prompt}。才华 +${gain}。`);
      flash(`前世记忆生效（${tier} 可靠度）：想起 ${yr.year} 年的「${w.title}」。`);
    } else {
      S.divergence += 6;
      pushLog("前世记忆模糊：你记得有个机会，但细节对不上，反而扰乱了判断。偏离度 +6。");
      flash("前世记忆失真，历史偏离度上升。");
    }
    afterAction();
  }

  function doTrain() {
    spendStamina(20);
    const a = pick(ATTRS);
    const g = 3 + rnd(4);
    S.player.attrs[a.key] = clamp(S.player.attrs[a.key] + g, 0, 100);
    S.player.mood = clamp(S.player.mood - 4, 0, 100);
    pushLog(`你花了一个季度磨练${a.name}，提升 ${g} 点。`);
    afterAction();
  }

  // 自由行动：玩家自己写想做的事，按内容关键词给出轻量叙事与属性反馈。
  const FREE_KEYWORDS = [
    { k: ["歌", "唱", "专辑", "巡演", "创作曲"], attr: "sing", fame: 6, mood: 3, stamina: 18, note: "你在出租屋里反复打磨旋律，录了小样发到网上。" },
    { k: ["戏", "演", "试镜", "剧本", "电影"], attr: "act", fame: 6, mood: 3, stamina: 18, note: "你拿着剧本对镜练习，为一个眼神琢磨到深夜。" },
    { k: ["健", "跑", "健身", "锻炼", "瑜伽"], attr: null, health: 8, stamina: -6, mood: 4, note: "你逼着自己规律作息、去公园跑步，气色好了些。" },
    { k: ["书", "学", "课", "读", "进修"], attr: null, talent: 5, mood: 2, stamina: 12, note: "你报了班补课，把前世的见识一点点补回手里。" },
    { k: ["约", "会", "见", "逛", "聚"], attr: null, mood: 6, social: 4, stamina: 10, note: "你约了朋友出去走走，圈里又多了几条人脉。" },
    { k: ["投", "钱", "生意", "理财", "副业"], attr: null, wealth: 8, social: 2, stamina: 8, note: "你拿闲钱做了点小投资，账面多了一笔进账。" },
  ];
  function doFree(text) {
    text = (text || "").trim();
    if (!text) { flash("写点你想做的事吧。"); return; }
    spendStamina(12);
    const hit = FREE_KEYWORDS.find((fk) => fk.k.some((w) => text.includes(w)))
      || { attr: null, fame: 2, mood: 2, stamina: 8, note: "你按自己的想法折腾了一个季度，平淡却踏实。" };
    const p = S.player;
    if (hit.attr) p.attrs[hit.attr] = clamp(p.attrs[hit.attr] + 2 + rnd(3), 0, 100);
    if (hit.fame) p.fame = clamp(p.fame + hit.fame, 0, 100);
    if (hit.health) p.health = clamp(p.health + hit.health, 0, 100);
    if (hit.mood) p.mood = clamp(p.mood + hit.mood, 0, 100);
    if (hit.social) p.social = clamp(p.social + hit.social, 0, 100);
    if (hit.talent) p.talent = clamp(p.talent + hit.talent, 0, 100);
    if (hit.wealth) p.wealth = clamp(p.wealth + hit.wealth, -200, 100);
    if (hit.stamina && hit.stamina < 0) p.stamina = clamp(p.stamina + hit.stamina, 0, 100);
    pushLog(`自由行动「${text}」：${hit.note}（体力 -${Math.abs(hit.stamina || 12) < 0 ? 0 : 12}）`);
    flash("自由行动已记录，时间推进一个季度。");
    afterAction();
  }

  function doRest() {
    S.player.mood = clamp(S.player.mood + 14, 0, 100);
    S.player.health = clamp(S.player.health + 8, 0, 100);
    S.player.stamina = clamp(S.player.stamina + 35, 0, 100);
    pushLog("你给自己放了个假，身心与体力都恢复了一些。");
    afterAction();
  }

  // ---------- 事件结算 ----------
  function runChoice(cfg) {
    lastOutcome = cfg;
    renderChoice(cfg);
  }

  function resolveChoice(opt) {
    const cfg = lastOutcome;
    let res = opt;
    if (opt.succ !== undefined) {
      const attrBonus = (S.player.attrs[cfg.attr] || 0) / 200;
      const socialBonus = (S.player.attrs.social || 0) / 300;
      const p = clamp(opt.succ + attrBonus + socialBonus, 0.05, 0.95);
      const win = Math.random() < p;
      res = win ? Object.assign({ won: true }, opt.win) : Object.assign({ won: false }, opt.lose || {});
      res._roll = win;
    }
    applyEffects(res);
    let msg = cfg.text + " 你选择：「" + opt.t + "」。";
    if (res._roll !== undefined) msg += res.won ? " 结果顺利。" : " 结果不如意。";
    pushLog(msg);
    lastOutcome = null;
    afterAction();
  }

  function resolveSocialEvent(ev, n, r) {
    lastOutcome = { title: "社交：" + n.name, text: ev.text.replace("{n}", n.name), opts: ev.opts, kind: "social", npc: n, rel: r };
    addEdge("player", n.id, "认识");
    renderChoice(lastOutcome);
  }

  function resolveRomanceEvent(ev, n, r) {
    lastOutcome = { title: "感情：" + n.name, text: ev.text.replace("{n}", n.name), opts: ev.opts, kind: "romance", npc: n, rel: r };
    addEdge("player", n.id, "恋人");
    renderChoice(lastOutcome);
  }

  function resolveChoiceFromOutcome(opt) {
    const cfg = lastOutcome;
    const res = Object.assign({}, opt);
    if (opt.succ !== undefined) {
      const attrVal = cfg.attr ? (S.player.attrs[cfg.attr] || 0) : (S.player.social || 0);
      const stamPenalty = S.player.stamina < 20 ? -0.15 : 0;
      const p = clamp(opt.succ + attrVal / 250 + (S.player.social || 0) / 400 + stamPenalty, 0.05, 0.95);
      const win = Math.random() < p;
      const outcome = win ? opt.win : opt.lose;
      Object.assign(res, outcome || {});
      res._roll = win;
    }
    applyEffects(res);
    if (cfg.npc && cfg.rel) {
      const r = cfg.rel;
      if (res.aff) r.affection = clamp(r.affection + res.aff, -100, 100);
      if (res.trust) r.trust = clamp(r.trust + res.trust, 0, 100);
      if (res.favorDebt) r.favorDebt += res.favorDebt;
      if (res.title && cfg.kind === "romance") { S.partner = cfg.npc.id; grantAch(res.title.replace("{n}", cfg.npc.name)); }
    }
    if (cfg.kind === "work" && res._roll && cfg.evId) grantAch("作品：" + cfg.title);
    if (cfg.kind === "work" && res._roll && res.fame >= 14) grantAch("代表作：《" + cfg.title + "》");
    let msg = (cfg.text || "") + " 你选择：「" + opt.t + "」。";
    if (res._roll !== undefined) msg += res.won ? " 顺利。" : " 不如意。";
    // 叙事收束：事业行动的胜/负叙述
    if (cfg.kind === "work" && window.NARRATIVE) {
      const beat = pick(res._roll ? window.NARRATIVE.workWin : window.NARRATIVE.workLose);
      if (beat) msg += " " + beat.replace("{title}", cfg.title || "这个项目").replace("{route}", ROUTES.find((r) => r.id === S.route).name);
    }
    pushLog(msg);
    // 关系里程碑叙事（只记录，不重复刷同档）
    if (cfg.npc && cfg.rel && window.NARRATIVE) {
      const af = cfg.rel.affection;
      const tier = af >= 80 ? 80 : af >= 60 ? 60 : af >= 40 ? 40 : af >= 20 ? 20 : 0;
      const key = (cfg.kind === "romance" ? "romanceBeat" : "socialBeat");
      const table = window.NARRATIVE[key];
      if (tier && table[tier] && !S.beatenNpc[cfg.npc.id + tier]) {
        S.beatenNpc[cfg.npc.id + tier] = true;
        pushLog(table[tier].replace("{n}", cfg.npc.name));
      }
    }
    lastOutcome = null;
    afterAction();
  }

  function applyEffects(res) {
    ["fame", "wealth", "reputation", "health", "mood", "social"].forEach((k) => {
      if (res[k]) S.player[k] = clamp((S.player[k] || 0) + res[k], k === "wealth" ? -200 : -100, k === "health" ? 100 : k === "fame" ? 100 : 100);
    });
    if (res.wealth && S.talents.includes("t_biz")) S.player.wealth = clamp(S.player.wealth + Math.round(res.wealth * 0.3), -200, 100);
    if (res.favorDebt) S.player.social = clamp(S.player.social - 2, 0, 100);
  }

  // 体力：行动消耗、休息/自然恢复。耗尽则行动打折并提示。
  function spendStamina(cost) {
    cost = cost || 0;
    if (S.player.stamina <= 0) { S.player.stamina = 0; return false; }
    S.player.stamina = clamp(S.player.stamina - cost, 0, 100);
    if (S.player.stamina === 0) flash("体力见底，接下来行动效率会下降，考虑休息。");
    return true;
  }

  function maybeRandomEvent() {
    if (Math.random() < 0.55) {
      const pool = S.talents.includes("t_koi") ? [LIFE_EVENTS[0], LIFE_EVENTS[2], LIFE_EVENTS[1], LIFE_EVENTS[3]] : LIFE_EVENTS;
      const ev = pick(pool);
      const opt = pick(ev.opts);
      applyEffects(opt);
      pushLog("随机事件：「" + ev.text.replace("{n}", "") + "」你" + opt.t + "。");
    }
  }

  function afterAction() {
    maybeRandomEvent();
    advanceQuarter(); // 每次行动消耗一个季度，时间推进
  }

  function advanceQuarter() {
    S.quarter++;
    if (S.quarter > 4) {
      S.quarter = 1;
      advanceYear();
    } else {
      renderMain();
    }
  }

  function advanceYear() {
    S.year++;
    S.player.age++;
    S.memoriesUsed = 0;
    S.divergence = clamp(S.divergence + 2, 0, 100);
    if (Math.random() < (S.talents.includes("t_lucky") ? 0.25 : 0.15)) {
      const big = activeNpcs(S.year).filter((n) => n.tier === "A");
      const n = pick(big);
      if (n) { relOf(n.id).affection = clamp(relOf(n.id).affection + 8, -100, 100); pushLog(`贵人降临：${n.name} 注意到了你的表现，好感 +8。`); }
    }
    if (S.year > 2026 || S.player.health <= 0) { endGame(); return; }
    pushLog(`—— ${S.year} 年 ——`);
    const intro = yearIntro(S.year);
    if (intro) pushLog(intro);
    renderMain();
  }

  function yearIntro(y) {
    const N = window.NARRATIVE;
    if (!N) return "";
    if (N.yearIntro && N.yearIntro[String(y)]) return N.yearIntro[String(y)];
    if (N.decadePool) {
      const key = String(y).slice(0, 3);
      const pool = N.decadePool[key];
      if (pool) return pick(pool);
    }
    return "";
  }

  function endGame() {
    S.ended = true;
    const p = S.player;
    let title = "默默无闻";
    if (p.fame >= 80) title = "天王天后";
    else if (p.fame >= 60 && p.reputation >= 40) title = "德艺双馨";
    else if (p.wealth >= 80) title = "娱乐大亨";
    else if (p.fame >= 50) title = "一线明星";
    else if (p.reputation <= -30) title = "争议艺人";
    else if (p.health <= 0) title = "英年早逝";
    if (S.partner) title += "（与伴侣相伴）";
    S.lastEnding = title;
    const epi = (window.NARRATIVE && window.NARRATIVE.ending[title]) ? window.NARRATIVE.ending[title]
      .replace("{name}", S.player.name).replace("{year}", S.year).replace("{title}", title) : "";
    S.lastEpilogue = epi;
    pushLog(`【结局】${S.year} 年，你的人生篇章落幕：${title}。`);
    if (epi) pushLog(epi);
    renderEnding();
  }

  function reincarnate() {
    const carry = {
      generation: S.generation + 1,
      achievements: S.achievements.slice(),
      talentBonus: Math.min(2, Math.floor(S.player.fame / 40)),
    };
    S = {
      player: { name: "", gender: S.player.gender, age: 16 + rnd(7), origin: "amateur", attrs: {}, fame: 0, wealth: 10, reputation: 0, health: 80, mood: 60, stamina: 100 },
      year: 2000, quarter: 1, route: S.route,
      talents: S.talents.slice(0, carry.talentBonus), memoriesUsed: 0, divergence: 0, memoryChance: 1 + (S.talents.includes("t_memory") ? 1 : 0),
      relations: {}, log: [], achievements: carry.achievements, generation: carry.generation,
      works: [], partner: null, ended: false, beatenNpc: {},
    };
    ATTRS.forEach((a) => (S.player.attrs[a.key] = 34 + rnd(20)));
    renderSetup(true);
  }

  // ---------- 渲染 ----------
  const $ = (id) => document.getElementById(id);

  function flash(msg) {
    const el = $("flash");
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(flash._t);
    flash._t = setTimeout(() => (el.style.opacity = "0"), 2200);
  }

  function bar(name, val, max) {
    const pct = clamp((val / max) * 100, 0, 100);
    return `<div class="stat"><span>${name}</span><div class="bar"><i style="width:${pct}%"></i></div><b>${Math.round(val)}</b></div>`;
  }

  function portraitOf(npc) {
    if (!window.PORTRAITS) return "";
    const id = npc.id || "x";
    if (window.PORTRAITS.hasCustom(id)) return `<img class="portrait" src="data/portraits/${id}.png" alt="${npc.name}">`;
    return window.PORTRAITS.portrait({ id, name: npc.name, gender: npc.gender, tier: npc.tier, npc });
  }
  function selfPortrait() {
    if (!window.PORTRAITS) return "";
    return window.PORTRAITS.portrait({ id: "player", name: S.player.name, gender: S.player.gender, tier: "S" });
  }

  function renderSetup(reborn) {
    const app = $("app");
    const origins = ORIGINS.map((o) => `<option value="${o.id}">${o.name} — ${o.note}</option>`).join("");
    const routes = ROUTES.map((r) => `<option value="${r.id}">${r.name}</option>`).join("");
    const talents = TALENTS.map((t) => `<label class="talent"><input type="checkbox" value="${t.id}"> <b>${t.name}</b><small>${t.desc}</small></label>`).join("");
    app.innerHTML = `
      <h1>重生2000：娱乐圈</h1>
      ${reborn ? '<p class="warn">第 ' + S.generation + ' 世。前世成就已铭记，可继承少量天赋。</p>' : ""}
      <p class="disc">${window.NPCS ? "所有角色与剧情均为架空虚构，不构成对现实人物的陈述。" : "数据加载中…"}</p>
      <div class="card">
        <div class="row"><label>姓名</label><input id="f_name" value="${reborn ? "" : "林川"}"></div>
        <div class="row"><label>性别</label>
          <select id="f_gender"><option>男</option><option>女</option></select></div>
        <div class="row"><label>初始年龄</label>
          <select id="f_age">${[16,17,18,19,20,21,22].map((a)=>`<option>${a}</option>`).join("")}</select></div>
        <div class="row"><label>出身</label><select id="f_origin">${origins}</select></div>
        <div class="row"><label>路线</label><select id="f_route">${routes}</select></div>
      </div>
      <h3>选择天赋（最多 3 个${reborn ? "，已继承 " + S.talents.length + " 个" : ""}）</h3>
      <div class="talents">${talents}</div>
      <button class="primary" id="b_start">开始这一世</button>
    `;
    $("b_start").onclick = () => {
      S.player.name = $("f_name").value || "无名";
      S.player.gender = $("f_gender").value;
      S.player.age = parseInt($("f_age").value, 10);
      S.player.origin = $("f_origin").value;
      S.route = $("f_route").value;
      const checked = Array.from(document.querySelectorAll(".talent input:checked")).map((c) => c.value);
      S.talents = checked.slice(0, 3);
      startLife();
    };
  }

  function renderMain() {
    const p = S.player;
    const app = $("app");
    const attrHtml = ATTRS.map((a) => bar(a.name, p.attrs[a.key], 100)).join("");
    const secHtml = bar("名气", p.fame, 100) + bar("财富", p.wealth + 100, 200) + bar("口碑", p.reputation + 100, 200) + bar("身体", p.health, 100) + bar("心情", p.mood, 100) + bar("体力", p.stamina, 100);
    const era = window.TIMELINE.find((y) => y.year === S.year) || { era: "", opportunity: {} };
    const worksHtml = S.works.slice(-6).map((w) => `<li>${w.year} ${w.title}</li>`).join("") || "<li>暂无代表作</li>";
    const partHtml = S.partner ? "伴侣：" + (window.NPCS.find((n) => n.id === S.partner) || {}).name : "单身";
    app.innerHTML = `
      <div class="topbar">
        <div class="self-av">${selfPortrait()}</div>
        <div class="self-info">
          <span class="tag">第 ${S.generation} 世</span>
          <span class="tag">${p.name} · ${p.gender} · ${p.age}岁</span>
          <span class="tag">${S.year} 年 Q${S.quarter}</span>
          <span class="tag">${ROUTES.find((r)=>r.id===S.route).name}</span>
          <span class="tag">偏离度 ${Math.round(S.divergence)}</span>
        </div>
      </div>
      <div class="grid">
        <div class="card">
          <h3>属性</h3>${attrHtml}
          <h3>状态</h3>${secHtml}
          <p class="mini">${partHtml}　|　成就 ${S.achievements.length}</p>
        </div>
        <div class="card">
          <h3>本季度可行动（选 1 项后自动推进）</h3>
          <div class="acts">
            <button data-a="work">${ROUTES.find((r)=>r.id===S.route).name}工作</button>
            <button data-a="social">社交结交</button>
            <button data-a="romance">感情线</button>
            <button data-a="memory">前世记忆 (${S.memoriesUsed}/${S.memoryChance})</button>
            <button data-a="train">磨练属性</button>
            <button data-a="rest">休息调整</button>
          </div>
          <h4>自由行动（写你想做的事）</h4>
          <div class="free">
            <input id="f_free" placeholder="例如：写一首关于故乡的歌 / 私下约导演吃饭 / 去健身" />
            <button data-a="free" id="b_free">行动</button>
          </div>
          <p class="era">时代：${era.era}　|　本年度风向：${era.opportunity.title || "—"}</p>
          <h4>近况代表作</h4><ul class="works">${worksHtml}</ul>
        </div>
      </div>
      <div class="card log"><h3>人生日志</h3><div id="loglist">${S.log.map((t)=>`<div>${t}</div>`).join("")}</div></div>
      <div class="card">
        <h3>关系图谱（${S.graph.nodes.length} 节点 / ${S.graph.edges.length} 条联系）</h3>
        <div class="graph">
          ${(S.graph.edges.length
            ? S.graph.edges.map((e) => {
                const a = (S.graph.nodes.find((n) => n.id === e.from) || {}).label || e.from;
                const b = (S.graph.nodes.find((n) => n.id === e.to) || {}).label || e.to;
                return `<div class="gedge"><b>${a}</b> —${e.kind}→ <b>${b}</b></div>`;
              })
            : ["<div class='mini'>还没有任何社交记录，去结交或恋爱吧。</div>"]).join("")}
        </div>
      </div>
      <div class="card">
        <h3>成就墙（${S.achievements.length}）</h3>
        <div class="ach">
          ${(S.achievements.length
            ? S.achievements.map((a) => `<span class="badge">${a}</span>`).join("")
            : "<span class='mini'>尚无成就，做出作品与感情里程碑后会点亮。</span>")}
        </div>
      </div>
      <div id="flash" class="flash"></div>
    `;
    document.querySelectorAll(".acts button").forEach((b) => {
      b.onclick = () => {
        const a = b.dataset.a;
        if (a === "work") doWork();
        else if (a === "social") doSocial();
        else if (a === "romance") doRomance();
        else if (a === "memory") doMemory();
        else if (a === "train") doTrain();
        else if (a === "rest") doRest();
        else if (a === "free") doFree($("f_free") ? $("f_free").value : "");
      };
    });
    const ll = $("loglist");
    if (ll) ll.scrollTop = 0;
  }

  function renderChoice(cfg) {
    const app = $("app");
    const npc = cfg.npc;
    const av = npc ? portraitOf(npc) : "";
    const relHtml = npc ? `<p class="rel">好感 ${clamp(cfg.rel.affection,-100,100)} · 信任 ${clamp(cfg.rel.trust,0,100)}${(cfg.kind==="romance")?" · 感情线":""}</p>` : "";
    app.innerHTML = `
      <div class="card choice">
        <div class="choice-head">
          ${av ? `<div class="av">${av}</div>` : ""}
          <div class="choice-meta">
            <h2>${cfg.title}</h2>
            ${relHtml}
          </div>
        </div>
        <p class="ctext">${cfg.text}</p>
        <div class="opts">
          ${cfg.opts.map((o, i) => `<button data-i="${i}">${o.t}${o.succ !== undefined ? "（成功率 " + Math.round(o.succ * 100) + "%）" : ""}</button>`).join("")}
        </div>
        <button class="ghost" id="b_back">返回</button>
      </div>
      <div class="card log"><h3>人生日志</h3>${S.log.map((t)=>`<div>${t}</div>`).join("")}</div>
    `;
    document.querySelectorAll(".opts button").forEach((b) => {
      b.onclick = () => resolveChoiceFromOutcome(cfg.opts[parseInt(b.dataset.i, 10)]);
    });
    $("b_back").onclick = renderMain;
  }

  function renderEnding() {
    const app = $("app");
    app.innerHTML = `
      <div class="card ending">
        <h1>人生落幕</h1>
        <p class="big">${S.lastEnding}</p>
        ${S.lastEpilogue ? `<p class="epi">${S.lastEpilogue}</p>` : ""}
        <p>你活到了 ${S.year} 年，名气 ${Math.round(S.player.fame)}，财富 ${Math.round(S.player.wealth)}，口碑 ${Math.round(S.player.reputation)}。</p>
        <p>累计成就：${S.achievements.length ? S.achievements.join("、") : "无"}</p>
        <p>走过 ${S.generation} 世轮回。</p>
        <h3>这一世的篇章</h3><div class="endlog">${S.log.slice(0, 40).reverse().map((t)=>`<div>${t}</div>`).join("")}</div>
        <button class="primary" id="b_re">开启下一世（轮回）</button>
        <button class="ghost" id="b_new">重新自定义</button>
      </div>`;
    $("b_re").onclick = reincarnate;
    $("b_new").onclick = () => newGame();
  }

  // 启动
  window.addEventListener("DOMContentLoaded", () => {
    if (!window.NPCS || !window.TIMELINE) {
      $("app").innerHTML = '<p class="warn">数据文件未加载，请确认 data/npcs.js 与 data/timeline.js 与本页面同级。</p>';
      return;
    }
    newGame();
  });

  // 测试/自动化接口（无头模式下驱动游戏，不依赖 DOM 点击）
  window.__GAME__ = {
    get state() { return S; },
    start(opts) {
      newGame();
      S.player.name = (opts && opts.name) || "测试者";
      S.player.gender = (opts && opts.gender) || "男";
      S.player.age = (opts && opts.age) || 18;
      S.player.origin = (opts && opts.origin) || "amateur";
      S.route = (opts && opts.route) || "actor";
      S.talents = (opts && opts.talents) || [];
      startLife();
    },
    act(a, freeText) {
      if (a === "work") doWork();
      else if (a === "social") doSocial();
      else if (a === "romance") doRomance();
      else if (a === "memory") doMemory();
      else if (a === "train") doTrain();
      else if (a === "rest") doRest();
      else if (a === "free") doFree(freeText);
    },
    choose(i) { if (lastOutcome) resolveChoiceFromOutcome(lastOutcome.opts[i]); },
    pendingChoice() { return !!lastOutcome; },
    ending() { return S.lastEnding; },
  };
})();
