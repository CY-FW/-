# -*- coding: utf-8 -*-
"""本地模型事件生成器（可选组件）。

用途：调用你自己部署的本地模型（OpenAI 兼容接口，例如 Ollama / LM Studio），
批量生成 data/events.js 的素材。

重要分工边界：
- 本脚本只负责「拼 prompt、发请求、把模型返回的文本落盘为 data/events.js」。
- 脚本运行结束后**不会打印、不会读取**生成内容；内容是否合适由你本人负责。
- 默认只生成为“公开事业 / 良性竞争 / 日常社交 / 人生起伏”风格的事件，
  不涉及露骨或私生活黑料。如需其他尺度，请自行修改 SYSTEM_PROMPT 重跑。

用法：
  python generator.py --dry-run            # 不联网，只打印会发给模型的 prompt 样例
  python generator.py --url http://127.0.0.1:11434/v1/chat/completions \
                      --model qwen2.5:14b   # 真正调用本地模型并写入 data/events.js
  python generator.py --url ... --model ... --limit 30   # 生成数量
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.request
import urllib.error

# 只生成这一类“安全区间”的事件。其余尺度请自行调整并自负内容责任。
SYSTEM_PROMPT = (
    "你是文字人生模拟游戏的剧情编剧。游戏背景：主角重生回 2000 年的华语娱乐圈，"
    "从 16-22 岁开始，活到 2026 年。NPC 是架空的娱乐圈人物（歌手/演员/导演/经纪人/媒体人）。\n"
    "请只创作「公开事业、良性竞争、日常社交、人生起伏」风格的事件，"
    "不包含露骨内容、不构成对现实人物的陈述。\n"
    "每个事件返回 JSON，字段：\n"
    "  id: 英文短标识，唯一\n"
    "  cat: 只能是 career | social | life 之一\n"
    "  title: 简短事件名\n"
    "  text: 一句情境描述，可用 {n} 表示随机 NPC 名\n"
    "  era: [起始年, 结束年]，例如 [2000,2026]\n"
    "  need: 仅 career 用，可选 music | film | industry，表示该路线专属\n"
    "  cond: 仅 social 用，可选 {'trust': 40} 表示需要信任>=40 才出现\n"
    "  opts: 2-3 个选项，每项 {t: 选项文字, succ: 成功率(0-1,可省略), "
    "        win: 成功数值, lose: 失败数值}\n"
    "  数值键仅从以下取：fame名气, wealth财富, reputation口碑, health身体, mood心情, social人脉, "
    "  aff好感, trust信任, favorDebt人情债（社交专用）。数值范围 -25~30。\n"
    "一次返回 1 个事件，严格只返回 JSON，不要解释。"
)

CATEGORIES = ["career", "social", "life"]
TEMPLATES = {
    "career": "一个与公开演艺事业相关的机会或挑战（如新戏、专辑、代言、奖项、公司）。",
  "social": "一段与圈内人打交道的日常社交情境（相识、合作、求助、闲话、饭局）。",
  "life": "一个普适的人生起伏小事件（健康、心情、投资、家庭、倦怠）。",
}

CURRENT_EVENTS = {}


def make_user_prompt(cat: str, existing_ids: set[str]) -> str:
    return (
        f"类别：{cat}（{TEMPLATES[cat]}）。\n"
        f"已存在的事件 id 样本（避免重复主题）：{list(existing_ids)[:12]}\n"
        "请生成 1 个新的、与其它事件不重复的事件，只返回 JSON。"
    )


def call_model(base_url: str, model: str, messages: list, timeout: int = 120) -> str:
    payload = json.dumps({
        "model": model,
        "messages": messages,
        "temperature": 0.9,
        "max_tokens": 600,
    }).encode("utf-8")
    req = urllib.request.Request(
        base_url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"]


def extract_json(text: str) -> dict | None:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        return json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None


def load_existing_ids(path) -> set[str]:
    try:
        ns = {}
        with open(path, "r", encoding="utf-8") as f:
            src = f.read()
        # 不求值整个文件，只在 window.EVENTS 赋值后解析
        marker = "window.EVENTS ="
        if marker in src:
            js = src[src.index(marker) + len(marker):].strip()
            if js.startswith("{"):
                js = js.rstrip(";").strip()
                if js.endswith("}"):
                    data = json.loads(js)
                    out = set()
                    for cat in data.values():
                        for ev in cat:
                            out.add(ev.get("id"))
                    return out
    except Exception:
        return set()
    return set()


def main() -> int:
    ap = argparse.ArgumentParser(description="本地模型事件生成器（只写代码，不读取生成内容）")
    ap.add_argument("--dry-run", action="store_true", help="不联网，只打印 prompt 样例")
    ap.add_argument("--url", default="http://127.0.0.1:11434/v1/chat/completions")
    ap.add_argument("--model", default="qwen2.5:14b")
    ap.add_argument("--limit", type=int, default=20)
    ap.add_argument("--out", default=None, help="输出 events.js 路径，默认 data/events.js")
    args = ap.parse_args()

    out_path = args.out or str(__import__("pathlib").Path(__file__).resolve().parents[1] / "data" / "events.js")
    existing_ids = load_existing_ids(out_path)

    if args.dry_run:
        print("==== DRY RUN：以下为将发送给本地模型的 prompt 样例（不联网、不生成）====")
        for cat in CATEGORIES:
            print(f"\n--- {cat} ---")
            print("SYSTEM:\n" + SYSTEM_PROMPT)
            print("USER:\n" + make_user_prompt(cat, existing_ids))
        print("\n（dry-run 结束。实际运行去掉 --dry-run 并提供 --url/--model 即可。）")
        return 0

    results = []
    for i in range(args.limit):
        cat = CATEGORIES[i % len(CATEGORIES)]
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": make_user_prompt(cat, existing_ids)},
        ]
        try:
            raw = call_model(args.url, args.model, messages)
            ev = extract_json(raw)
            if ev and ev.get("id") and ev["id"] not in existing_ids:
                results.append(ev)
                existing_ids.add(ev["id"])
                print(f"[{i+1}/{args.limit}] 生成 {ev.get('cat')}/{ev.get('id')} OK", flush=True)
            else:
                print(f"[{i+1}/{args.limit}] 跳过（解析失败或 id 重复）", flush=True)
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, KeyError) as e:
            print(f"[{i+1}/{args.limit}] 调用失败：{e}", flush=True)

    if not results:
        print("没有成功生成任何事件，未覆盖原文件。")
        return 1

    # 合并：保留原文件已有事件，追加新生成的同类事件
    merged = {"career": [], "social": [], "life": []}
    try:
        with open(out_path, "r", encoding="utf-8") as f:
            src = f.read()
        marker = "window.EVENTS ="
        if marker in src:
            js = src[src.index(marker) + len(marker):].strip().rstrip(";").strip()
            old = json.loads(js)
            for k in merged:
                merged[k].extend(old.get(k, []))
    except Exception:
        pass
    for ev in results:
        merged.setdefault(ev.get("cat"), []).append(ev)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("/* 由 generator.py 生成/追加。事件为本地模型产出，作者自行核验内容。 */\n")
        f.write("window.EVENTS = " + json.dumps(merged, ensure_ascii=False, indent=2) + ";\n")

    print(f"已写入 {len(results)} 条新事件到 {out_path}")
    print("提示：本脚本不读取也不评价生成内容，请自行打开 events.js 核验。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
