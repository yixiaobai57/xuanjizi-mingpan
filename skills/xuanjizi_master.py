# -*- coding: utf-8 -*-
"""
玄机子命理大师 Skill v1.0
基于《渊海子平》《三命通会》《滴天髓》古籍断语，对八字排盘结果进行权威解读。
"""

import os
import re

KNOWLEDGE_PATH = os.path.join(os.path.dirname(__file__), "mingli-zhishiku.md")

# ========== 十天干性情映射 ==========
TIANGAN_XINGQING = {
    "甲": {"五行": "阳木", "性情": "有进取心，个性坚强有骨气，心地仁慈，敏感，缺乏应变能力。"},
    "乙": {"五行": "阴木", "性情": "有野心，表面谦虚内心占有欲强，反应灵敏，善于见风转舵。"},
    "丙": {"五行": "阳火", "性情": "急躁，重表现乐于服务，不计较得失，心地光明无机心。"},
    "丁": {"五行": "阴火", "性情": "温和，重情义，富有同情心，思维细腻，不与人争，有牺牲精神。"},
    "戊": {"五行": "阳土", "性情": "沉实稳重，重名誉，信实无欺，为人耿直。"},
    "己": {"五行": "阴土", "性情": "内聚，多才多艺，能伸能缩，做事精明多变。"},
    "庚": {"五行": "阳金", "性情": "刚锐强硬，豪爽侠义，个性好胜，爱出风头。"},
    "辛": {"五行": "阴金", "性情": "温润秀气，重感情爱面子，有气质却缺乏魄力。"},
    "壬": {"五行": "阳水", "性情": "乐观外向热情，善于把握机会，聪明但易纵欲任性。"},
    "癸": {"五行": "阴水", "性情": "平静柔情内向，重情调有耐心，好幻想爱钻牛角尖。"},
}

# ========== 五行旺衰断语 ==========
WUXING_WANGSHUAI = {
    "木": {
        "旺": "博爱恻隐，仁慈恺悌，济物利人，恤念孤寡，性直清高，为人慷慨。",
        "衰": "偏心性拗，嫉妒不仁。",
    },
    "火": {
        "旺": "辞让端谨，恭敬谦和，聪明有为。",
        "衰": "诡诈多疑，言语不实，有始无终。",
    },
    "土": {
        "旺": "言行相顾，忠孝至诚，度量宽厚，处世有方。",
        "衰": "不通情理，狠毒乖戾，颠倒失信。",
    },
    "金": {
        "旺": "英雄豪迈，仗义疏财，刚毅果决。",
        "衰": "悭吝贫苦，事多挫折，优柔寡断。",
    },
    "水": {
        "旺": "机深密虑，足志多谋，学识过人。",
        "衰": "作事反复，性情不定，胆小无谋。",
    },
}

# ========== 经典断语库 ==========
CLASSIC_QUOTES = {
    "财": [
        "《滴天髓》云：「何知其人富，财气通门户。」",
        "《三命通会》云：「身旺能担财，身弱财反害。」",
        "《渊海子平》云：「伤官用财者富，伤官劫财者贫。」",
        "《滴天髓》云：「财命有气，妻妾和顺，是得妻力。」",
    ],
    "官": [
        "《渊海子平》云：「官怕伤，财怕劫；印绶见财，愈多愈灾。」",
        "《滴天髓》云：「官杀混杂来问我，有可有不可。」",
        "《三命通会》云：「官杀混杂，有印者吉，无印者凶。」",
        "《渊海子平》云：「岁德扶杀，权柄在握；官星一位，多主贵气。」",
    ],
    "印": [
        "《渊海子平》云：「印绶逢官，早岁登科。」",
        "《三命通会》云：「印绶多了老无子。」",
    ],
    "食伤": [
        "《滴天髓》云：「食伤生财源，富贵自天来。」",
        "《渊海子平》云：「伤官见官，若非疾病伤躯，必当官讼囚系。」",
    ],
    "比劫": [
        "《渊海子平》云：「比劫若夺财，求财多坎坷。」",
        "《滴天髓》云：「众劫分财，虽有如无。」",
    ],
}

# ========== 赠言库 ==========
BONUS_WORDS = [
    "顺势者昌，逆势者劳。顺势而行，方为智者。",
    "时来天地皆同力，运去英雄不自由。知命者不怨天。",
    "金鳞本非池中物，一遇风云便化龙。守得云开见月明。",
    "水流千里归大海，人行百岁靠根基。固本培元，方得始终。",
    "春暖花开终有时，莫因冬寒而畏途。",
    "刚柔并济，进退有度，此乃人生大智慧。",
    "木旺春生宜借风，火烈夏长防自焚。知所不足，方能成器。",
    "金寒水冷，宜近光热；土燥木枯，当润甘霖。八字即人生，调候即修行。",
]

# ========== 十神名称映射 ==========
SHISHEN_CN = {
    "比肩": "比肩", "劫财": "劫财",
    "食神": "食神", "伤官": "伤官",
    "正财": "正财", "偏财": "偏财",
    "正官": "正官", "七杀": "七杀",
    "正印": "正印", "偏印": "偏印",
}

def get_gan_info(gan):
    """获取天干信息"""
    return TIANGAN_XINGQING.get(gan, TIANGAN_XINGQING.get("甲"))

def get_wuxing_from_gan(gan):
    """从天干获取五行"""
    g2w = {"甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水"}
    return g2w.get(gan, "土")

def pick_quote(category):
    """从经典断语库随机选取一条"""
    import random
    quotes = CLASSIC_QUOTES.get(category, CLASSIC_QUOTES["财"])
    return random.choice(quotes)

def pick_bonus():
    """随机选取赠言"""
    import random
    return random.choice(BONUS_WORDS)

def analyze_wangshuai(ri_gan, zhis):
    """
    简易旺衰判断：通过地支藏干看日主是否得根。
    返回 (旺/平/衰, 推断)
    """
    g2w = {"甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水"}
    wuxing = g2w.get(ri_gan, "土")

    # 地支藏干简表
    zhicang = {
        "子": ["癸"], "丑": ["己", "癸", "辛"],
        "寅": ["甲", "丙", "戊"], "卯": ["乙"],
        "辰": ["戊", "乙", "癸"], "巳": ["丙", "戊", "庚"],
        "午": ["丁", "己"], "未": ["己", "丁", "乙"],
        "申": ["庚", "壬", "戊"], "酉": ["辛"],
        "戌": ["戊", "辛", "丁"], "亥": ["壬", "甲"],
    }

    score = 0
    details = []
    for zhi in zhis:
        if zhi in zhicang:
            cang = zhicang[zhi]
            for g in cang:
                if g2w.get(g) == wuxing:
                    score += 1
                    details.append(f"支{zhi}藏{g}")

    if score >= 3:
        return "旺", f"日主得地（{';'.join(details)}），根气深固，身旺能胜财官。"
    elif score >= 1:
        return "平", f"日主有根但非强旺（{';'.join(details)}），需大运扶助方可发力。"
    else:
        return "衰", f"日主无根，身弱不胜财官，喜印比帮扶。"

def generate_master_interpretation(bazi_data):
    """
    生成玄机子大师风格的八字解读文本。

    bazi_data: dict, 预期包含：
        - nian_gan, nian_zhi, yue_gan, yue_zhi, ri_gan, ri_zhi, shi_gan, shi_zhi
        - shishen_list: [(天干, 十神), ...] 十神列表
        - (可选) dayun, liunian
    """
    ri_gan = bazi_data.get("ri_gan", "甲")
    zhis = [bazi_data.get(k) for k in ["nian_zhi", "yue_zhi", "ri_zhi", "shi_zhi"] if bazi_data.get(k)]

    gan_info = get_gan_info(ri_gan)
    wuxing = get_wuxing_from_gan(ri_gan)
    wangshuai, wangshuai_detail = analyze_wangshuai(ri_gan, zhis)

    # 性格描述
    if wangshuai == "旺":
        xingge_extra = WUXING_WANGSHUAI.get(wuxing, {}).get("旺", "")
    elif wangshuai == "衰":
        xingge_extra = WUXING_WANGSHUAI.get(wuxing, {}).get("衰", "")
    else:
        xingge_extra = "性情中和，刚柔并济。"

    # 十神分析
    shishen_list = bazi_data.get("shishen_list", [])
    cai_count = sum(1 for _, s in shishen_list if s in ["正财", "偏财"])
    guan_count = sum(1 for _, s in shishen_list if s in ["正官", "七杀"])
    yin_count = sum(1 for _, s in shishen_list if s in ["正印", "偏印"])
    shi_count = sum(1 for _, s in shishen_list if s in ["食神", "伤官"])

    # 构造解读
    parts = []

    # 1. 命局总览
    parts.append(f"【命局总览】\n日主{ri_gan}（{wuxing}），{wangshuai_detail}")
    if cai_count >= 2:
        parts.append("财星透干，求财有机缘；")
    if guan_count >= 2:
        parts.append("官杀有力，事业有担当；")
    if yin_count >= 2:
        parts.append("印绶护身，学识深厚；")
    if shi_count >= 2:
        parts.append("食伤吐秀，才华横溢。")

    # 2. 日主性格
    parts.append(f"\n【日主性格】\n{ri_gan}为{wuxing}之精，{gan_info['性情']} {xingge_extra}")

    # 3. 事业格局
    parts.append("\n【事业格局】")
    if guan_count >= 2:
        parts.append(pick_quote("官"))
        parts.append("官星有力，事业心强，宜在体制或管理岗位发展，借官威以正当时。")
    elif cai_count >= 2:
        parts.append(pick_quote("财"))
        parts.append("财星通门户，经商求财皆有路，但须身旺方能担之。")
    elif shi_count >= 2:
        parts.append(pick_quote("食伤"))
        parts.append("食伤泄秀，以才华技艺立身，适合创意、艺术、技术领域。")
    else:
        parts.append("命局平和，宜稳扎稳打，以时间换空间。")

    # 4. 趋吉避凶
    parts.append("\n【趋吉避凶】")
    if wangshuai == "旺":
        parts.append(f"身旺之命，喜{get_wuxing_from_gan(ri_gan)}之泄秀，忌再见比劫争锋。")
    elif wangshuai == "衰":
        yong_shen = {"木": "水木", "火": "木火", "土": "火土", "金": "土金", "水": "金水"}.get(wuxing, "印比")
        parts.append(f"身弱之命，喜{yong_shen}扶助，忌财官克耗。")
        parts.append("行运至印比之乡，方可大展拳脚。")
    else:
        parts.append("中和之命，顺势即可，不必强求。")

    # 5. 赠言
    parts.append(f"\n【玄机子赠言】\n{pick_bonus()}")

    return "\n".join(parts)


# ========== 测试入口 ==========
if __name__ == "__main__":
    test_bazi = {
        "nian_gan": "甲", "nian_zhi": "子",
        "yue_gan": "丙", "yue_zhi": "寅",
        "ri_gan": "戊", "ri_zhi": "辰",
        "shi_gan": "壬", "shi_zhi": "戌",
        "shishen_list": [
            ("甲", "七杀"), ("丙", "偏印"), ("戊", "日主"), ("壬", "偏财"),
        ],
    }
    result = generate_master_interpretation(test_bazi)
    print(result)
