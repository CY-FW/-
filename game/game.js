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

  const CAREER_EVENTS = [
    { id: "c_audition", title: "试镜机会", text: "一个剧组开放试镜，需要 {need} 支撑。",
      need: true,
      opts: [
        { t: "全力争取", succ: 0.6, win: { fame: 8, reputation: 4, mood: 6 }, lose: { mood: -6, reputation: -2 } },
        { t: "稳妥放弃", mood: 2 },
      ] },
    { id: "c_album", title: "发片机会", text: "唱片公司愿意给你一张专辑排期。", need: "music",
      opts: [
        { t: "倾力制作", succ: 0.55, win: { fame: 14, wealth: 20, reputation: 6 }, lose: { wealth: -10, mood: -8 } },
        { t: "保守交差", succ: 0.8, win: { fame: 6, wealth: 6 } },
      ] },
    { id: "c_film", title: "电影角色", text: "一位导演想找你演一个重要角色。", need: "film",
      opts: [
        { t: "接下挑战", succ: 0.5, win: { fame: 12, reputation: 10, mood: 8 }, lose: { reputation: -4, mood: -6 } },
        { t: "先接配角", succ: 0.85, win: { fame: 5, reputation: 4 } },
      ] },
    { id: "c_variety", title: "综艺邀约", text: "一档热门综艺找你做常驻。", need: "film",
      opts: [
        { t: "参加", succ: 0.7, win: { fame: 16, wealth: 14, mood: 4 }, lose: { mood: -4 } },
        { t: "推掉", mood: -2 },
      ] },
    { id: "c_company", title: "开公司", text: "你可以注册工作室或公司，承接项目。", need: "industry",
      opts: [
        { t: "大胆创业", succ: 0.45, win: { wealth: 40, fame: 10, reputation: 6 }, lose: { wealth: -25, mood: -10 } },
        { t: "合伙试水", succ: 0.75, win: { wealth: 18, social: 6 } },
      ] },
    { id: "c_plagiarism", title: "撞车风波", text: "有人指控你的作品“撞创意”，媒体开始关注。",
      opts: [
        { t: "正面回应", succ: 0.6, win: { reputation: 6, mood: 4 }, lose: { reputation: -10, mood: -8 } },
        { t: "冷处理", reputation: -4, mood: -4 },
      ] },
  ];

  const SOCIAL_EVENTS = [
    { id: "s_help", text: "{n} 最近遇到点麻烦，向你开口求助。",
      opts: [
        { t: "出手相助", aff: 16, trust: 14, favorDebt: -10, wealth: -6 },
        { t: "婉拒", aff: -10, trust: -6 },
      ] },
    { id: "s_rival", text: "你和 {n} 竞争同一个资源，气氛紧张。",
      opts: [
        { t: "正面争夺", succ: 0.5, win: { fame: 6, social: 4 }, lose: { aff: -12, reputation: -2 } },
        { t: "让一步", aff: 6, trust: 4, mood: 2 },
      ] },
    { id: "s_gossip", text: "圈内传出关于 {n} 的闲话，问你怎么看。",
      opts: [
        { t: "替他说话", aff: 18, trust: 10 },
        { t: "不站队", aff: 0 },
        { t: "跟着传", aff: -20, trust: -12, reputation: -4 },
      ] },
    { id: "s_offer", text: "{n} 想拉你进一个合作项目。",
      cond: (r) => r.trust >= 40,
      opts: [
        { t: "答应结盟", aff: 12, trust: 12, social: 8, wealth: 10 },
        { t: "再观察", aff: -2 },
      ] },
  ];

  const LIFE_EVENTS = [
    { id: "l_health", text: "连轴转的工作让你身体亮了红灯。",
      opts: [
        { t: "休息调养", health: 12, mood: 4, wealth: -4 },
        { t: "硬扛", health: -12, mood: -6 },
      ] },
    { id: "l_mood", text: "舆论的一场小风波影响了你的心情。",
      opts: [
        { t: "运动解压", mood: 12, health: 4 },
        { t: "借酒消愁", mood: 4, health: -6, wealth: -3 },
      ] },
    { id: "l_windfall", text: "早年一笔小投资意外有了回报。",
      opts: [ { t: "收下", wealth: 16, mood: 6 } ] },
    { id: "l_scandal", text: "一篇爆料贴把你的旧事翻了出来。",
      opts: [
        { t: "诚恳道歉", succ: 0.55, win: { reputation: 4, mood: 2 }, lose: { reputation: -12, mood: -8 } },
        { t: "律师函", reputation: -2, wealth: -8, mood: -4 },
      ] },
  ];

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
      player: { name: "", gender: "男", age: 18, origin: "amateur", attrs: {}, fame: 0, wealth: 10, reputation: 0, health: 80, mood: 60 },
      year: 2000, quarter: 1, route: "actor",
      talents: [], memoriesUsed: 0, divergence: 0, memoryChance: 1,
      relations: {}, log: [], achievements: [], generation: 1,
      works: [], partner: null, ended: false,
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
    S.memoryChance = 1 + (S.talents.includes("t_memory") ? 1 : 0);
    pushLog(`【第 ${S.generation} 世 · ${S.year}】你以 ${S.player.age} 岁之龄重生在 ${S.player.gender === "男" ? "男" : "女"}主角的身体里，起点：${ORIGINS.find((o) => o.id === S.player.origin).name}。目标路线：${ROUTES.find((r) => r.id === S.route).name}。`);
    renderMain();
  }

  function pushLog(t) {
    S.log.unshift("[" + S.year + " Q" + S.quarter + "] " + t);
    if (S.log.length > 200) S.log.pop();
  }

  // ---------- 行动 ----------
  function doWork() {
    const route = ROUTES.find((r) => r.id === S.route);
    const evs = CAREER_EVENTS.filter((e) => !e.need || e.need === route.kind);
    const ev = pick(evs);
    let text = ev.text;
    const needVal = S.player.attrs[route.need] || 0;
    if (ev.need === true) text = "一个剧组开放试镜，需要你的" + ATTRS.find((a) => a.key === route.need).name + "（当前 " + needVal + "）支撑。";
    runChoice({
      title: ev.title, text, opts: ev.opts, kind: "work", route, attr: route.need,
    });
  }

  function doSocial() {
    const pool = activeNpcs(S.year).filter((n) => n.id !== "player" && (!S.partner || n.id !== S.partner));
    const n = pick(pool);
    const r = relOf(n.id);
    const ev = pick(SOCIAL_EVENTS.filter((e) => !e.cond || e.cond(r)));
    resolveSocialEvent(ev, n, r);
  }

  function doRomance() {
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
    const a = pick(ATTRS);
    const g = 3 + rnd(4);
    S.player.attrs[a.key] = clamp(S.player.attrs[a.key] + g, 0, 100);
    S.player.mood = clamp(S.player.mood - 4, 0, 100);
    pushLog(`你花了一个季度磨练${a.name}，提升 ${g} 点。`);
    afterAction();
  }

  function doRest() {
    S.player.mood = clamp(S.player.mood + 14, 0, 100);
    S.player.health = clamp(S.player.health + 8, 0, 100);
    pushLog("你给自己放了个假，身心恢复了一些。");
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
    renderChoice(lastOutcome);
  }

  function resolveRomanceEvent(ev, n, r) {
    lastOutcome = { title: "感情：" + n.name, text: ev.text.replace("{n}", n.name), opts: ev.opts, kind: "romance", npc: n, rel: r };
    renderChoice(lastOutcome);
  }

  function resolveChoiceFromOutcome(opt) {
    const cfg = lastOutcome;
    const res = Object.assign({}, opt);
    if (opt.succ !== undefined) {
      const attrVal = cfg.attr ? (S.player.attrs[cfg.attr] || 0) : (S.player.social || 0);
      const p = clamp(opt.succ + attrVal / 250 + (S.player.social || 0) / 400, 0.05, 0.95);
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
      if (res.title && cfg.kind === "romance") { S.partner = cfg.npc.id; S.achievements.push(res.title.replace("{n}", cfg.npc.name)); }
    }
    let msg = (cfg.text || "") + " 你选择：「" + opt.t + "」。";
    if (res._roll !== undefined) msg += res.won ? " 顺利。" : " 不如意。";
    pushLog(msg);
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
    renderMain();
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
    pushLog(`【结局】${S.year} 年，你的人生篇章落幕：${title}。`);
    renderEnding();
  }

  function reincarnate() {
    const carry = {
      generation: S.generation + 1,
      achievements: S.achievements.slice(),
      talentBonus: Math.min(2, Math.floor(S.player.fame / 40)),
    };
    S = {
      player: { name: "", gender: S.player.gender, age: 16 + rnd(7), origin: "amateur", attrs: {}, fame: 0, wealth: 10, reputation: 0, health: 80, mood: 60 },
      year: 2000, quarter: 1, route: S.route,
      talents: S.talents.slice(0, carry.talentBonus), memoriesUsed: 0, divergence: 0, memoryChance: 1 + (S.talents.includes("t_memory") ? 1 : 0),
      relations: {}, log: [], achievements: carry.achievements, generation: carry.generation,
      works: [], partner: null, ended: false,
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
    const secHtml = bar("名气", p.fame, 100) + bar("财富", p.wealth + 100, 200) + bar("口碑", p.reputation + 100, 200) + bar("身体", p.health, 100) + bar("心情", p.mood, 100);
    const era = window.TIMELINE.find((y) => y.year === S.year) || { era: "", opportunity: {} };
    const worksHtml = S.works.slice(-6).map((w) => `<li>${w.year} ${w.title}</li>`).join("") || "<li>暂无代表作</li>";
    const partHtml = S.partner ? "伴侣：" + (window.NPCS.find((n) => n.id === S.partner) || {}).name : "单身";
    app.innerHTML = `
      <div class="topbar">
        <span class="tag">第 ${S.generation} 世</span>
        <span class="tag">${p.name} · ${p.gender} · ${p.age}岁</span>
        <span class="tag">${S.year} 年 Q${S.quarter}</span>
        <span class="tag">${ROUTES.find((r)=>r.id===S.route).name}</span>
        <span class="tag">偏离度 ${Math.round(S.divergence)}</span>
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
          <p class="era">时代：${era.era}　|　本年度风向：${era.opportunity.title || "—"}</p>
          <h4>近况代表作</h4><ul class="works">${worksHtml}</ul>
        </div>
      </div>
      <div class="card log"><h3>人生日志</h3><div id="loglist">${S.log.map((t)=>`<div>${t}</div>`).join("")}</div></div>
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
      };
    });
    const ll = $("loglist");
    if (ll) ll.scrollTop = 0;
  }

  function renderChoice(cfg) {
    const app = $("app");
    app.innerHTML = `
      <div class="card choice">
        <h2>${cfg.title}</h2>
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
        <p>你活到了 ${S.year} 年，名气 ${Math.round(S.player.fame)}，财富 ${Math.round(S.player.wealth)}，口碑 ${Math.round(S.player.reputation)}。</p>
        <p>累计成就：${S.achievements.length ? S.achievements.join("、") : "无"}</p>
        <p>走过 ${S.generation} 世轮回。</p>
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
    act(a) {
      if (a === "work") doWork();
      else if (a === "social") doSocial();
      else if (a === "romance") doRomance();
      else if (a === "memory") doMemory();
      else if (a === "train") doTrain();
      else if (a === "rest") doRest();
    },
    choose(i) { if (lastOutcome) resolveChoiceFromOutcome(lastOutcome.opts[i]); },
    pendingChoice() { return !!lastOutcome; },
    ending() { return S.lastEnding; },
  };
})();
