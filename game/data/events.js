/* 重生2000：娱乐圈 — 事件库（可由 generator.py 重新生成，也可手写补充）
 * 字段说明：
 *  - cat: career | social | life  （romance 仍内置在 game.js，只走原创 NPC）
 *  - kind 约束：career 事件若带 need，则只在该路线 kind 匹配时出现
 *  - era: [起,止] 年份区间；不写表示全程可用
 *  - cond(aff|trust): 出现门槛（社交事件用，作用于当前 NPC 关系）
 *  - opts[].succ: 成功率；win/lose 为成功/失败时的数值变化
 *  - 数值键：fame 名气 / wealth 财富 / reputation 口碑 / health 身体 / mood 心情 / social 人脉
 *  - 社交专用：aff 好感 / trust 信任 / favorDebt 人情债
 * 设定边界：本文件只描述“公开事业、良性竞争、日常社交、人生起伏”，不含露骨或黑料私生活；
 *           恋爱与重冲突剧情由 game.js 内置的原创 NPC 承担。
 */
window.EVENTS = {
  "career": [
    { id: "c_audition", title: "试镜机会", text: "一个剧组开放试镜，需要你的{need}支撑。", need: true, era: [2000, 2026],
      opts: [
        { t: "全力争取", succ: 0.6, win: { fame: 8, reputation: 4, mood: 6 }, lose: { mood: -6, reputation: -2 } },
        { t: "稳妥放弃", mood: 2 } ] },
    { id: "c_album", title: "发片机会", text: "唱片公司愿意给你一张专辑排期。", need: "music", era: [2000, 2026],
      opts: [
        { t: "倾力制作", succ: 0.55, win: { fame: 14, wealth: 20, reputation: 6 }, lose: { wealth: -10, mood: -8 } },
        { t: "保守交差", succ: 0.8, win: { fame: 6, wealth: 6 } } ] },
    { id: "c_film", title: "电影角色", text: "一位导演想找你演一个重要角色。", need: "film", era: [2000, 2026],
      opts: [
        { t: "接下挑战", succ: 0.5, win: { fame: 12, reputation: 10, mood: 8 }, lose: { reputation: -4, mood: -6 } },
        { t: "先接配角", succ: 0.85, win: { fame: 5, reputation: 4 } } ] },
    { id: "c_variety", title: "综艺邀约", text: "一档热门综艺找你做常驻。", need: "film", era: [2005, 2026],
      opts: [
        { t: "参加", succ: 0.7, win: { fame: 16, wealth: 14, mood: 4 }, lose: { mood: -4 } },
        { t: "推掉", mood: -2 } ] },
    { id: "c_company", title: "开公司", text: "你可以注册工作室或公司，承接项目。", need: "industry", era: [2008, 2026],
      opts: [
        { t: "大胆创业", succ: 0.45, win: { wealth: 40, fame: 10, reputation: 6 }, lose: { wealth: -25, mood: -10 } },
        { t: "合伙试水", succ: 0.75, win: { wealth: 18, social: 6 } } ] },
    { id: "c_plagiarism", title: "撞车风波", text: "有人指控你的作品“撞创意”，媒体开始关注。", era: [2000, 2026],
      opts: [
        { t: "正面回应", succ: 0.6, win: { reputation: 6, mood: 4 }, lose: { reputation: -10, mood: -8 } },
        { t: "冷处理", reputation: -4, mood: -4 } ] },
    { id: "c_award", title: "奖项提名", text: "你凭借一部作品获得重要奖项提名。", era: [2000, 2026],
      opts: [
        { t: "精心准备", succ: 0.5, win: { fame: 18, reputation: 12, mood: 10 }, lose: { mood: -4, reputation: -2 } },
        { t: "随缘出席", succ: 0.7, win: { fame: 8, reputation: 4 } } ] },
    { id: "c_endorse", title: "品牌代言", text: "一个品牌看中你的形象，想请做代言。", era: [2002, 2026],
      opts: [
        { t: "接代言", succ: 0.85, win: { wealth: 22, fame: 6 }, lose: {} },
        { t: "挑剧本", succ: 0.6, win: { reputation: 8, mood: 4 }, lose: { mood: -2 } } ] },
    { id: "c_concert", title: "个人演唱会", text: "你攒够了人气，可以办一场个人演唱会。", need: "music", era: [2003, 2026],
      opts: [
        { t: "大场地", succ: 0.5, win: { fame: 20, wealth: 30, mood: 12 }, lose: { wealth: -20, mood: -8 } },
        { t: "中小场", succ: 0.8, win: { fame: 8, wealth: 12 } } ] },
    { id: "c_webdrama", title: "竖屏短剧", text: "短剧市场爆发，邀你出演或投资一部。", need: "film", era: [2024, 2026],
      opts: [
        { t: "押注短剧", succ: 0.55, win: { fame: 14, wealth: 24, mood: 6 }, lose: { wealth: -12, mood: -4 } },
        { t: "谨慎试水", succ: 0.8, win: { fame: 5, wealth: 8 } } ] },
    { id: "c_ai_album", title: "AI 辅助创作", text: "新技术能辅助你做音乐实验，但署名与版权要厘清。", need: "music", era: [2025, 2026],
      opts: [
        { t: "尝试实验", succ: 0.6, win: { fame: 10, talent: 8, mood: 6 }, lose: { reputation: -6, mood: -4 } },
        { t: "坚持人工", talent: 6, mood: 2 } ] }
  ],
  "social": [
    { id: "s_help", text: "{n} 最近遇到点麻烦，向你开口求助。", era: [2000, 2026],
      opts: [
        { t: "出手相助", aff: 16, trust: 14, favorDebt: -10, wealth: -6 },
        { t: "婉拒", aff: -10, trust: -6 } ] },
    { id: "s_rival", text: "你和 {n} 竞争同一个资源，气氛紧张。", era: [2000, 2026],
      opts: [
        { t: "正面争夺", succ: 0.5, win: { fame: 6, social: 4 }, lose: { aff: -12, reputation: -2 } },
        { t: "让一步", aff: 6, trust: 4, mood: 2 } ] },
    { id: "s_gossip", text: "圈内传出关于 {n} 的闲话，问你怎么看。", era: [2000, 2026],
      opts: [
        { t: "替他说话", aff: 18, trust: 10 },
        { t: "不站队", aff: 0 },
        { t: "跟着传", aff: -20, trust: -12, reputation: -4 } ] },
    { id: "s_offer", text: "{n} 想拉你进一个合作项目。", era: [2000, 2026], cond: { trust: 40 },
      opts: [
        { t: "答应结盟", aff: 12, trust: 12, social: 8, wealth: 10 },
        { t: "再观察", aff: -2 } ] },
    { id: "s_dinner", text: "一场饭局上，{n} 与你相谈甚欢。", era: [2000, 2026],
      opts: [
        { t: "敬酒热络", aff: 14, trust: 6, mood: 4 },
        { t: "保持克制", aff: 4, trust: 2 } ] },
    { id: "s_mentor", text: "{n} 是圈内前辈，愿意给你提点几句。", era: [2000, 2026], cond: { trust: 30 },
      opts: [
        { t: "虚心求教", aff: 10, trust: 10, social: 6, talent: 4 },
        { t: "自作主张", aff: -4, trust: -4 } ] },
    { id: "s_net", text: "行业活动里，{n} 把你引荐给不少人。", era: [2000, 2026],
      opts: [
        { t: "大方社交", aff: 8, social: 12 },
        { t: "低调旁观", social: 4 } ] },
    { id: "s_conflict", text: "你和 {n} 在合作里意见相左，起了争执。", era: [2000, 2026],
      opts: [
        { t: "据理力争", succ: 0.5, win: { reputation: 6, social: 4 }, lose: { aff: -14, trust: -8 } },
        { t: "暂时忍让", aff: 2, trust: 2 } ] }
  ],
  "life": [
    { id: "l_health", text: "连轴转的工作让你身体亮了红灯。", era: [2000, 2026],
      opts: [
        { t: "休息调养", health: 12, mood: 4, wealth: -4 },
        { t: "硬扛", health: -12, mood: -6 } ] },
    { id: "l_mood", text: "舆论的一场小风波影响了你的心情。", era: [2000, 2026],
      opts: [
        { t: "运动解压", mood: 12, health: 4 },
        { t: "借酒消愁", mood: 4, health: -6, wealth: -3 } ] },
    { id: "l_windfall", text: "早年一笔小投资意外有了回报。", era: [2000, 2026],
      opts: [ { t: "收下", wealth: 16, mood: 6 } ] },
    { id: "l_scandal", text: "一篇爆料贴把你的旧事翻了出来。", era: [2000, 2026],
      opts: [
        { t: "诚恳道歉", succ: 0.55, win: { reputation: 4, mood: 2 }, lose: { reputation: -12, mood: -8 } },
        { t: "律师函", reputation: -2, wealth: -8, mood: -4 } ] },
    { id: "l_family", text: "家人希望你多顾着点生活，少拼命。", era: [2000, 2026],
      opts: [
        { t: "回家看看", mood: 14, health: 6, wealth: -4 },
        { t: "寄钱尽孝", mood: 4, wealth: -10, reputation: 2 } ] },
    { id: "l_burnout", text: "长期高压让你有点倦怠，灵感也枯竭了。", era: [2008, 2026],
      opts: [
        { t: "休假充电", health: 10, mood: 10, talent: 4, wealth: -6 },
        { t: "强迫输出", talent: -6, mood: -8, health: -6 } ] }
  ]
};
