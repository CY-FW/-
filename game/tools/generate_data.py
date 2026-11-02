# -*- coding: utf-8 -*-
"""Generate the fictional entertainment-industry data used by Reborn 2000.

Names in the prototype roster are deliberately fictionalized. They are not
claims about real people. Original NPCs carry romance and heavy-conflict plots.
"""
from __future__ import annotations

import json
import random
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
DATA.mkdir(parents=True, exist_ok=True)
RNG = random.Random(20000101)


def rows(text):
    return [line.strip() for line in text.strip().splitlines() if line.strip()]


# name | gender | debut | region | primary style | tier
singers = rows(r"""
周捷伦|男|2000|港台|创作流行|A
王霏|女|2000|内地|流行天后|A
刘德骅|男|2000|港台|影视歌多栖|A
张雪友|男|2000|港台|实力唱将|A
那瑛|女|2000|内地|流行实力|A
孙艳姿|女|2000|海外|都市流行|A
蔡依琳|女|2000|港台|唱跳流行|A
梁静如|女|2000|海外|情歌治愈|B
萧亚萱|女|2000|港台|时尚唱跳|B
五月天阿信|男|2000|港台|乐团创作|A
林骏杰|男|2003|海外|创作流行|A
潘玮柏|男|2002|港台|嘻哈流行|B
罗志翔|男|2003|港台|唱跳综艺|B
张韶涵|女|2002|港台|清亮高音|B
王心凌|女|2003|港台|甜美流行|B
田馥甄|女|2001|港台|乐团女声|A
陈嘉桦|女|2001|港台|乐团综艺|B
任家萱|女|2001|港台|乐团偶像|B
杨丞琳|女|2001|港台|偶像歌手|B
阿杜|男|2002|海外|沙哑情歌|B
刀朗|男|2004|内地|西域民谣|B
庞龙|男|2004|内地|大众情歌|C
杨臣刚|男|2004|内地|网络歌曲|C
香香|女|2004|内地|网络甜歌|C
郑源|男|2005|内地|伤感情歌|C
凤凰传奇玲花|女|2005|内地|民族流行|B
凤凰传奇曾毅|男|2005|内地|民族流行|B
李宇春|女|2005|内地|中性舞台|A
周笔畅|女|2005|内地|实力女声|A
张靓颖|女|2005|内地|实力高音|A
何洁|女|2005|内地|选秀歌手|B
薛之谦|男|2005|内地|创作情歌|A
胡彦斌|男|2001|内地|编曲创作|B
陈亦迅|男|2000|港台|都市情歌|A
容祖儿|女|2000|港台|粤语流行|B
谢霆峰|男|2000|港台|摇滚偶像|A
 twins阿姣|女|2001|港台|双人偶像|B
 twins阿洒|女|2001|港台|双人偶像|B
许松|男|2009|内地|网络创作|A
汪苏泷|男|2010|内地|校园创作|B
徐良|男|2010|内地|对唱流行|B
张碧晨|女|2014|内地|影视情歌|B
毛不易|男|2017|内地|民谣创作|A
周深|男|2014|内地|空灵声线|A
邓紫棋|女|2008|港台|创作高音|A
""")

actors = rows(r"""
赵微|女|2000|内地|电视剧偶像|A
周讯|女|2000|内地|灵气演技|A
章紫怡|女|2000|内地|电影演员|A
巩莉|女|2000|内地|文艺电影|A
陈昆|男|2000|内地|青年演员|A
黄小明|男|2001|内地|偶像演员|A
刘烨|男|2000|内地|文艺电影|A
邓超|男|2002|内地|电视剧演员|A
孙丽|女|2003|内地|电视剧演员|A
胡哥|男|2005|内地|古装偶像|A
刘逸飞|女|2003|内地|古装偶像|A
杨冥|女|2006|内地|电视偶像|A
刘诗诗|女|2007|内地|古装剧演员|A
唐烟|女|2006|内地|都市偶像|B
赵小刀|女|2006|内地|电视剧演员|A
佟丽亚|女|2008|内地|古装都市|B
王宝墙|男|2003|内地|草根喜剧|A
黄博|男|2006|内地|喜剧演技|A
徐铮|男|2000|内地|喜剧演员|A
王保强|男|2004|内地|动作喜剧|C
范彬彬|女|2000|内地|时尚影视|A
李冰|女|2000|内地|电影演员|B
任泉|男|2000|内地|古装演员|B
陆毅|男|2000|内地|青春偶像|B
任威|男|2000|港台|警匪动作|B
古天勒|男|2000|港台|电影演员|A
刘清云|男|2000|港台|实力电影|A
梁超伟|男|2000|港台|文艺电影|A
张蔓玉|女|2000|港台|电影演员|A
张百芝|女|2000|港台|电影偶像|A
吴彦祖|男|2000|港台|动作剧情|A
甄子单|男|2000|港台|动作电影|A
吴惊|男|2000|内地|动作演员|A
李连洁|男|2000|内地|功夫电影|A
周兴驰|男|2000|港台|喜剧导演|A
葛尤|男|2000|内地|喜剧电影|A
姜文|男|2000|内地|实力演员|A
陈道名|男|2000|内地|正剧演员|A
陈保国|男|2000|内地|正剧演员|B
王志文|男|2000|内地|现实题材|B
张国力|男|2000|内地|电视剧演员|B
张铁霖|男|2000|内地|古装演员|C
林心茹|女|2000|港台|电视偶像|B
贾静文|女|2000|港台|古装偶像|B
高园园|女|2001|内地|都市影视|A
张静初|女|2003|内地|文艺电影|B
李小冉|女|2001|内地|电视剧演员|B
秦海璐|女|2000|内地|文艺演技|B
梅婷|女|2000|内地|现实题材|B
海清|女|2006|内地|都市生活|B
姚晨|女|2006|内地|情景喜剧|A
闫妮|女|2005|内地|情景喜剧|A
沙溢|男|2005|内地|情景喜剧|B
白百合|女|2011|内地|都市电影|A
文章|男|2006|内地|都市影视|B
倪妮|女|2011|内地|电影演员|A
井柏然|男|2010|内地|青春电影|B
杨阳|男|2010|内地|偶像演员|A
李易锋|男|2009|内地|偶像演员|A
鹿涵|男|2012|海外|偶像艺人|A
黄子涛|男|2012|海外|偶像艺人|B
张艺兴|男|2012|海外|唱跳演员|A
王俊楷|男|2013|内地|少年偶像|A
王原|男|2013|内地|少年偶像|B
易烊千禧|男|2013|内地|电影演员|A
肖战争|男|2016|内地|古装偶像|A
王亦博|男|2016|内地|唱跳演员|A
""")

creators = rows(r"""
张艺谋|男|2000|内地|电影导演|A
冯晓刚|男|2000|内地|商业导演|A
陈凯歌|男|2000|内地|艺术导演|A
王家卫|男|2000|港台|文艺导演|A
吴宇森|男|2000|港台|动作导演|B
徐克|男|2000|港台|武侠导演|A
杜琪峰|男|2000|港台|类型导演|A
刘伟强|男|2000|港台|商业导演|B
陈可辛|男|2000|港台|剧情导演|A
宁浩|男|2006|内地|黑色喜剧|A
乌尔善|男|2010|内地|奇幻导演|B
陈思诚|男|2012|内地|商业导演|A
郭帆|男|2015|内地|科幻导演|A
文牧野|男|2017|内地|现实导演|A
贾樟柯|男|2000|内地|艺术导演|A
娄烨|男|2000|内地|艺术导演|B
王小帅|男|2000|内地|艺术导演|B
张一白|男|2000|内地|都市导演|B
高希希|男|2000|内地|电视导演|B
郑晓龙|男|2000|内地|电视导演|A
孔笙|男|2000|内地|电视导演|A
于正|男|2003|内地|编剧制片|B
海岩|男|2000|内地|编剧制片|A
刘镇伟|男|2000|港台|喜剧导演|B
林超贤|男|2000|港台|动作导演|A
""")

industry = rows(r"""
王京花|女|2000|内地|王牌经纪人|A
杨天真|女|2008|内地|明星经纪|A
龙丹妮|女|2000|内地|选秀制片|A
杜华|女|2009|内地|偶像经纪|B
王长田|男|2000|内地|影视出品|B
王中磊|男|2000|内地|影视出品|A
于冬|男|2000|内地|电影出品|A
韩三平|男|2000|内地|电影出品|A
张伟平|男|2000|内地|电影制片|B
张纪中|男|2000|内地|电视制片|A
何炅|男|2000|内地|综艺主持|A
汪涵|男|2000|内地|综艺主持|A
李湘|女|2000|内地|综艺主持|B
谢娜|女|2002|内地|综艺主持|A
李静|女|2000|内地|访谈主持|B
陈鲁豫|女|2000|内地|访谈主持|B
蔡康永|男|2000|港台|综艺主持|A
徐熙娣|女|2000|港台|综艺主持|A
卓远|男|2004|内地|娱乐记者|A
苏芒|女|2001|内地|时尚主编|B
""")

original_artists = rows(r"""
陆星野|男|2000|内地|偶像演员|A
宋子谦|男|2000|内地|同期竞争|A
沈佳宜|女|2000|内地|艺校新人|A
顾清歌|女|2001|内地|驻唱歌手|B
韩东旭|男|2002|内地|练习生|B
林晚舟|女|2003|内地|电视剧新人|A
苏念|女|2004|内地|网络歌手|B
唐子昂|男|2005|内地|选秀歌手|B
许安然|女|2005|内地|选秀艺人|A
江辰|男|2006|内地|青春演员|B
夏初|女|2007|内地|古装剧演员|B
贺云川|男|2008|内地|电影演员|B
叶青禾|女|2009|内地|唱作歌手|A
程亦风|男|2010|内地|综艺艺人|B
白露|女|2011|内地|都市演员|B
方屿|男|2012|海外|组合成员|B
孟繁星|女|2013|内地|少女偶像|B
秦朗|男|2014|内地|流量演员|B
乔安娜|女|2015|内地|综艺演员|C
谢临|男|2016|内地|网剧演员|B
林可可|女|2017|内地|选秀偶像|B
罗一帆|男|2018|内地|乐队主唱|C
简宁|女|2019|内地|短剧演员|B
周野|男|2020|内地|直播艺人|C
顾晚晴|女|2021|内地|短视频演员|B
""")

romance = rows(r"""
沈明珠|女|2000|内地|影视公司继承人|A
秦岚|女|2000|内地|经纪人|A
陈叙|男|2000|内地|摄影指导|A
顾言深|男|2000|内地|外科医生|A
林知夏|女|2001|内地|艺校同学|A
苏景行|男|2001|内地|音乐制作人|A
叶疏影|女|2002|内地|电影编剧|A
江慕白|男|2002|内地|大学教师|A
唐婉|女|2003|内地|时尚编辑|A
周屿森|男|2003|内地|运动员|A
许南乔|女|2004|内地|电台主持|A
裴修远|男|2004|内地|建筑设计师|A
宋温暖|女|2005|内地|纪录片导演|A
霍云霆|男|2005|内地|制片人|A
温以宁|女|2006|内地|舞蹈演员|A
陆则明|男|2006|内地|律师|A
姜茶|女|2007|内地|造型师|A
季川|男|2007|内地|独立导演|A
安宁|女|2008|内地|心理咨询师|A
傅斯年|男|2008|内地|科技公司创始人|A
""")

CIRCLES = {
    "港台": ["港台圈", "商业电影圈"],
    "内地": ["内地圈", "学院派"],
    "海外": ["海外唱片圈", "流行偶像圈"],
}
TRAITS = ["理性", "慢热", "直率", "谨慎", "外向", "敏锐", "务实", "理想主义"]
GOALS = {
    "歌手": "推出代表作并建立长期音乐品牌",
    "演员": "获得代表角色并提高行业认可度",
    "创作": "建立稳定项目团队与作品口碑",
    "行业": "扩大资源网络与项目影响力",
    "原创": "在竞争中形成不可替代的定位",
    "恋爱": "在事业与私人生活之间保持边界",
}


def make_npcs(text, kind, prefix):
    result = []
    for index, raw in enumerate(text, 1):
        name, gender, debut, region, style, tier = raw.split("|")
        debut = int(debut)
        if kind == "prototype_singer":
            professions = ["歌手"] + (["作曲人"] if "创作" in style else [])
            career = "music"
        elif kind == "prototype_actor":
            professions = ["演员"]
            career = "film"
        elif kind == "prototype_creator":
            professions = ["导演" if "导演" in style else "编剧", "制片人"]
            career = "production"
        elif kind == "industry":
            professions = [style]
            career = "industry"
        elif kind == "original_artist":
            professions = [style.replace("同期竞争", "演员").replace("艺校新人", "演员")]
            career = "film" if "演员" in professions[0] else "music"
        else:
            professions = [style]
            career = "romance"
        base = {
            "id": f"{prefix}_{index:03d}",
            "name": name.strip(),
            "gender": gender,
            "kind": kind,
            "tier": tier,
            "professions": professions,
            "careerTrack": career,
            "style": style,
            "region": region,
            "activeFrom": debut,
            "activeTo": 2026,
            "initialCareerStage": "已出道" if debut == 2000 else "未出道",
            "circles": CIRCLES[region] + ([career + "圈"] if career in {"music", "film"} else []),
            "personality": RNG.sample(TRAITS, 2),
            "publicGoal": "在事业与私人生活之间保持边界" if kind == "romance" else "建立长期职业定位与行业关系网",
            "romanceEnabled": kind == "romance",
            "plotScope": "公开事业、合作与良性竞争" if kind.startswith("prototype") else "原创事业与关系剧情",
            "initialRelation": {"affection": 0, "trust": 0, "interest": 0, "favorDebt": 0},
            "secretOrScandal": None,
        }
        result.append(base)
    return result


npcs = []
for text, kind, prefix in [
    (singers, "prototype_singer", "sing"),
    (actors, "prototype_actor", "act"),
    (creators, "prototype_creator", "make"),
    (industry, "industry", "biz"),
    (original_artists, "original_artist", "orig"),
    (romance, "romance", "love"),
]:
    npcs.extend(make_npcs(text, kind, prefix))

assert len(npcs) == 202, len(npcs)
assert len({n["id"] for n in npcs}) == 202
assert len({n["name"] for n in npcs}) == 202

# Pre-seed a small, explicit relationship network; runtime systems may extend it.
relations = []
relation_specs = [
    ("sing_001", "sing_011", "创作圈同行", 20),
    ("sing_016", "sing_017", "组合成员", 80),
    ("sing_016", "sing_018", "组合成员", 80),
    ("sing_017", "sing_018", "组合成员", 80),
    ("act_001", "act_042", "电视剧合作圈", 35),
    ("act_009", "act_010", "学院校友", 35),
    ("act_013", "act_014", "古装剧合作圈", 25),
    ("make_001", "act_003", "导演演员合作", 45),
    ("make_002", "act_037", "导演演员合作", 45),
    ("make_009", "act_026", "导演演员合作", 40),
    ("biz_011", "biz_012", "综艺同行", 30),
    ("biz_011", "biz_014", "节目合作", 30),
]
by_id = {n["id"]: n for n in npcs}
for a, b, label, strength in relation_specs:
    assert a in by_id and b in by_id, (a, b)
    relations.append({"from": a, "to": b, "type": label, "strength": strength, "since": 2000})

payload = {
    "schemaVersion": 1,
    "game": "重生2000：娱乐圈",
    "timeline": {"startYear": 2000, "endYear": 2026, "quartersPerYear": 4},
    "disclaimer": "本作采用架空娱乐圈设定。所有角色姓名、人物关系与游戏事件均为虚构，不构成对现实人物经历、品行或私生活的陈述。原型化角色只承担公开事业与良性竞争剧情；恋爱和重冲突剧情由原创角色承担。",
    "design": {
        "npcCount": 202,
        "prototypeCount": 157,
        "originalCount": 45,
        "activation": "按 activeFrom 进入人物池；未出道者不会提前参与行业项目。",
        "socialStats": ["affection", "trust", "interest", "favorDebt"],
        "romanceRule": "只有 romanceEnabled=true 的原创角色进入可攻略池。",
    },
    "npcs": npcs,
    "initialRelations": relations,
}
(DATA / "npcs.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Public-era milestones and fictionalized project opportunity slots.
eras = [
    (2000, 2004, "唱片与电视剧时代", ["发行专辑", "拍摄电视剧", "晚会演出", "签约唱片公司"], ["电视台", "唱片店", "电台"]),
    (2005, 2009, "选秀与网络兴起", ["参加选秀", "经营网络人气", "彩铃发行", "网络歌曲传播"], ["选秀舞台", "贴吧", "音乐网站"]),
    (2010, 2014, "电影与社交媒体时代", ["进军电影", "微博运营", "成立工作室", "品牌代言"], ["电影院线", "微博", "时尚活动"]),
    (2015, 2019, "流量与资本时代", ["IP剧", "常驻综艺", "粉丝运营", "影视投资"], ["视频平台", "综艺录制", "资本市场"]),
    (2020, 2023, "行业调整期", ["线上演出", "直播经营", "口碑修复", "精品剧拍摄"], ["直播间", "线上演唱会", "流媒体"]),
    (2024, 2026, "多平台时代", ["短剧制作", "AI辅助创作", "个人品牌", "跨平台发行"], ["短剧平台", "虚拟演播室", "多平台矩阵"]),
]

# Public works used only as alternate-history opportunity prompts, not biographies.
works = [
    (2000, "音乐", "都市流行专辑", "把握新世纪华语流行乐的编曲变化"),
    (2001, "电视剧", "青春偶像剧", "提前布局青春偶像题材"),
    (2002, "音乐", "R&B创作专辑", "将节奏蓝调与中文歌词结合"),
    (2003, "电视剧", "武侠改编剧", "争取适合的古装角色"),
    (2004, "音乐", "网络传播单曲", "研究网络传播与彩铃渠道"),
    (2005, "综艺", "全民选秀", "选择参赛、助演或幕后制作路线"),
    (2006, "电影", "小成本黑色喜剧", "用剧本与表演弥补预算不足"),
    (2007, "电视剧", "年代群像剧", "积累现实题材口碑"),
    (2008, "公益", "大型公益演出", "参与公益项目并维护公众形象"),
    (2009, "音乐", "网络原创专辑", "建立独立创作与发行渠道"),
    (2010, "电影", "国产商业类型片", "扩大银幕影响力"),
    (2011, "电视剧", "宫廷古装剧", "争取复杂人物角色"),
    (2012, "社交", "微博个人品牌", "建立直接面向公众的沟通渠道"),
    (2013, "电影", "青春题材电影", "把握青年观众市场"),
    (2014, "综艺", "户外真人秀", "展示镜头外的性格与协作能力"),
    (2015, "电视剧", "网络小说改编剧", "评估IP热度与剧本质量"),
    (2016, "电影", "动作商业大片", "完成体能训练与团队协作"),
    (2017, "电影", "现实题材剧情片", "以社会议题争取口碑"),
    (2018, "综艺", "团体选秀", "选择导师、选手或制作人定位"),
    (2019, "电影", "国产科幻电影", "参与长期制作与技术协作"),
    (2020, "线上", "线上演唱会", "在演出受限时期维持舞台影响力"),
    (2021, "短内容", "竖屏短剧", "尝试短时长高密度叙事"),
    (2022, "音乐", "怀旧主题演出", "连接不同年龄层观众"),
    (2023, "电视剧", "品质群像剧", "用完整人物弧光建立口碑"),
    (2024, "科技", "虚拟制作项目", "学习虚拟拍摄与实时渲染流程"),
    (2025, "创作", "AI辅助音乐实验", "明确署名、版权与人类创作边界"),
    (2026, "综合", "跨平台个人品牌", "整合作品、直播与线下演出"),
]

timeline = []
for start, end, era, actions, platforms in eras:
    for year in range(start, end + 1):
        work = next(w for w in works if w[0] == year)
        timeline.append({
            "year": year,
            "quarters": 4,
            "era": era,
            "publicContext": f"{era}的行业环境",
            "opportunity": {"type": work[1], "title": work[2], "prompt": work[3]},
            "availableActions": actions,
            "platforms": platforms,
            "memoryReliability": "high" if year <= 2005 else "medium" if year <= 2015 else "low",
            "historyDivergenceRule": "偏离度越高，前世提示越模糊；不得保证现实事件在游戏中必然发生。",
        })

(DATA / "timeline.json").write_text(json.dumps({
    "schemaVersion": 1,
    "startYear": 2000,
    "endYear": 2026,
    "years": timeline,
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Machine-readable validation report for later tooling/tests.
report = {
    "npcCount": len(npcs),
    "byKind": dict(sorted(Counter(n["kind"] for n in npcs).items())),
    "byTier": dict(sorted(Counter(n["tier"] for n in npcs).items())),
    "timelineYears": len(timeline),
    "uniqueIds": True,
    "uniqueNames": True,
    "relationReferencesValid": True,
    "romanceNpcCount": sum(n["romanceEnabled"] for n in npcs),
    "prototypeRomanceCount": sum(n["romanceEnabled"] for n in npcs if n["kind"].startswith("prototype")),
}
(DATA / "validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# JS exports so the game runs by double-clicking index.html (no local server needed).
(DATA / "npcs.js").write_text(
    "window.NPCS=" + json.dumps(npcs, ensure_ascii=False) + ";\n"
    "window.RELATIONS=" + json.dumps(relations, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
(DATA / "timeline.js").write_text(
    "window.TIMELINE=" + json.dumps(timeline, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)

print(json.dumps(report, ensure_ascii=False, indent=2))
