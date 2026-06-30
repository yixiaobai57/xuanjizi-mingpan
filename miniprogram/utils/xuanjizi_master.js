/**
 * 玄机子命理大师 Skill v1.0 (JavaScript ES5 兼容版，小程序可用)
 * 基于《渊海子平》《三命通会》《滴天髓》古籍断语，对八字排盘结果进行权威解读。
 */

// ========== 十天干性情映射 ==========
var TIANGAN_XINGQING = {
  "甲": { "五行": "阳木", "性情": "有进取心，个性坚强有骨气，心地仁慈，敏感，缺乏应变能力。" },
  "乙": { "五行": "阴木", "性情": "有野心，表面谦虚内心占有欲强，反应灵敏，善于见风转舵。" },
  "丙": { "五行": "阳火", "性情": "急躁，重表现乐于服务，不计较得失，心地光明无机心。" },
  "丁": { "五行": "阴火", "性情": "温和，重情义，富有同情心，思维细腻，不与人争，有牺牲精神。" },
  "戊": { "五行": "阳土", "性情": "沉实稳重，重名誉，信实无欺，为人耿直。" },
  "己": { "五行": "阴土", "性情": "内聚，多才多艺，能伸能缩，做事精明多变。" },
  "庚": { "五行": "阳金", "性情": "刚锐强硬，豪爽侠义，个性好胜，爱出风头。" },
  "辛": { "五行": "阴金", "性情": "温润秀气，重感情爱面子，有气质却缺乏魄力。" },
  "壬": { "五行": "阳水", "性情": "乐观外向热情，善于把握机会，聪明但易纵欲任性。" },
  "癸": { "五行": "阴水", "性情": "平静柔情内向，重情调有耐心，好幻想爱钻牛角尖。" }
};

// ========== 天干→五行 ==========
var GAN_WUXING = { "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水" };

// ========== 地支藏干简表 ==========
var ZHI_CANG = {
  "子": ["癸"],
  "丑": ["己","癸","辛"],
  "寅": ["甲","丙","戊"],
  "卯": ["乙"],
  "辰": ["戊","乙","癸"],
  "巳": ["丙","戊","庚"],
  "午": ["丁","己"],
  "未": ["己","丁","乙"],
  "申": ["庚","壬","戊"],
  "酉": ["辛"],
  "戌": ["戊","辛","丁"],
  "亥": ["壬","甲"]
};

// ========== 五行旺衰断语 ==========
var WUXING_WANGSHUAI = {
  "木": { "旺": "博爱恻隐，仁慈恺悌，济物利人，恤念孤寡，性直清高，为人慷慨。", "衰": "偏心性拗，嫉妒不仁。" },
  "火": { "旺": "辞让端谨，恭敬谦和，聪明有为。", "衰": "诡诈多疑，言语不实，有始无终。" },
  "土": { "旺": "言行相顾，忠孝至诚，度量宽厚，处世有方。", "衰": "不通情理，狠毒乖戾，颠倒失信。" },
  "金": { "旺": "英雄豪迈，仗义疏财，刚毅果决。", "衰": "悭吝贫苦，事多挫折，优柔寡断。" },
  "水": { "旺": "机深密虑，足志多谋，学识过人。", "衰": "作事反复，性情不定，胆小无谋。" }
};

// ========== 经典断语库 ==========
var CLASSIC_QUOTES = {
  "财": [
    "《滴天髓》云：「何知其人富，财气通门户。」",
    "《三命通会》云：「身旺能担财，身弱财反害。」",
    "《渊海子平》云：「伤官用财者富，伤官劫财者贫。」",
    "《滴天髓》云：「财命有气，妻妾和顺，是得妻力。」"
  ],
  "官": [
    "《渊海子平》云：「官怕伤，财怕劫；印绶见财，愈多愈灾。」",
    "《滴天髓》云：「官杀混杂来问我，有可有不可。」",
    "《三命通会》云：「官杀混杂，有印者吉，无印者凶。」",
    "《渊海子平》云：「岁德扶杀，权柄在握；官星一位，多主贵气。」"
  ],
  "印": [
    "《渊海子平》云：「印绶逢官，早岁登科。」",
    "《三命通会》云：「印绶多了老无子。」"
  ],
  "食伤": [
    "《滴天髓》云：「食伤生财源，富贵自天来。」",
    "《渊海子平》云：「伤官见官，若非疾病伤躯，必当官讼囚系。」"
  ],
  "比劫": [
    "《渊海子平》云：「比劫若夺财，求财多坎坷。」",
    "《滴天髓》云：「众劫分财，虽有如无。」"
  ]
};

// ========== 赠言库 ==========
var BONUS_WORDS = [
  "顺势者昌，逆势者劳。顺势而行，方为智者。",
  "时来天地皆同力，运去英雄不自由。知命者不怨天。",
  "金鳞本非池中物，一遇风云便化龙。守得云开见月明。",
  "水流千里归大海，人行百岁靠根基。固本培元，方得始终。",
  "春暖花开终有时，莫因冬寒而畏途。",
  "刚柔并济，进退有度，此乃人生大智慧。",
  "木旺春生宜借风，火烈夏长防自焚。知所不足，方能成器。",
  "金寒水冷，宜近光热；土燥木枯，当润甘霖。八字即人生，调候即修行。"
];

// ========== 工具函数 ==========

/** 从天干获取五行 */
function _getWuxing(gan) {
  return GAN_WUXING[gan] || "土";
}

/** 随机选取 */
function _pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 简易旺衰判断：通过地支藏干看日主是否得根。
 * @returns {{level: string, detail: string}}
 */
function analyzeWangshuai(riGan, zhis) {
  var wuxing = _getWuxing(riGan);
  var score = 0;
  var details = [];
  for (var i = 0; i < zhis.length; i++) {
    var zhi = zhis[i];
    var cang = ZHI_CANG[zhi];
    if (cang) {
      for (var j = 0; j < cang.length; j++) {
        if (_getWuxing(cang[j]) === wuxing) {
          score++;
          details.push("支" + zhi + "藏" + cang[j]);
        }
      }
    }
  }

  if (score >= 3) {
    return { level: "旺", detail: "日主得地（" + details.join(";") + "），根气深固，身旺能胜财官。" };
  } else if (score >= 1) {
    return { level: "平", detail: "日主有根但非强旺（" + details.join(";") + "），需大运扶助方可发力。" };
  } else {
    return { level: "衰", detail: "日主无根，身弱不胜财官，喜印比帮扶。" };
  }
}

/**
 * 从排盘数据中提取八字信息
 */
function extractBazi(payload) {
  var result = { riGan: "甲", zhis: [], shishenList: [] };

  // 从 bazi 字段提取（云函数新格式）
  if (payload.bazi) {
    var bz = payload.bazi;
    var keys = ["year", "month", "day", "hour"];
    result.riGan = (bz.day && bz.day.gan) || "甲";
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (bz[k] && bz[k].zhi) result.zhis.push(bz[k].zhi);
    }
    // 十神
    if (payload.shiShen) {
      var shiKeys = ["year", "month", "day", "hour"];
      for (var j = 0; j < shiKeys.length; j++) {
        var sk = shiKeys[j];
        if (payload.shiShen[sk]) {
          var shenArr = [].concat(payload.shiShen[sk]);
          for (var m = 0; m < shenArr.length; m++) {
            result.shishenList.push({ gan: (bz[sk] && bz[sk].gan) || "—", shen: shenArr[m] });
          }
        }
      }
    }
  }

  // 从 pillars 字段提取（兼容旧格式）
  if (payload.pillars && Array.isArray(payload.pillars) && result.zhis.length === 0) {
    for (var p = 0; p < payload.pillars.length; p++) {
      var pill = payload.pillars[p];
      if (pill.zhi) result.zhis.push(pill.zhi);
      if (pill.shen) result.shishenList.push({ gan: pill.gan || "—", shen: pill.shen });
    }
    if (result.riGan === "甲" && payload.pillars[2] && payload.pillars[2].gan) {
      result.riGan = payload.pillars[2].gan;
    }
  }

  return result;
}

/**
 * 生成玄机子大师风格的八字解读文本
 * @param {Object} payload - 排盘结果数据（paipanData）
 * @returns {string} 完整解读文本
 */
function generateMasterInterpretation(payload) {
  var bazi = extractBazi(payload);
  var riGan = bazi.riGan;
  var zhis = bazi.zhis;
  var shishenList = bazi.shishenList;

  var ganInfo = TIANGAN_XINGQING[riGan] || TIANGAN_XINGQING["甲"];
  var wuxing = _getWuxing(riGan);
  var ws = analyzeWangshuai(riGan, zhis);

  // 性格描述
  var xinggeExtra = "";
  if (ws.level === "旺") {
    xinggeExtra = (WUXING_WANGSHUAI[wuxing] && WUXING_WANGSHUAI[wuxing].旺) || "";
  } else if (ws.level === "衰") {
    xinggeExtra = (WUXING_WANGSHUAI[wuxing] && WUXING_WANGSHUAI[wuxing].衰) || "";
  } else {
    xinggeExtra = "性情中和，刚柔并济。";
  }

  // 十神统计
  var caiCount = 0, guanCount = 0, yinCount = 0, shiCount = 0;
  for (var i = 0; i < shishenList.length; i++) {
    var s = shishenList[i].shen;
    if (s === "正财" || s === "偏财") caiCount++;
    if (s === "正官" || s === "七杀") guanCount++;
    if (s === "正印" || s === "偏印") yinCount++;
    if (s === "食神" || s === "伤官") shiCount++;
  }

  // ====== 构造解读 ======
  var parts = [];

  // 1. 命局总览
  parts.push("【命局总览】");
  parts.push("日主" + riGan + "（" + wuxing + "），" + ws.detail);
  if (caiCount >= 2) parts.push("财星透干，求财有机缘；");
  if (guanCount >= 2) parts.push("官杀有力，事业有担当；");
  if (yinCount >= 2) parts.push("印绶护身，学识深厚；");
  if (shiCount >= 2) parts.push("食伤吐秀，才华横溢。");

  // 2. 日主性格
  parts.push("");
  parts.push("【日主性格】");
  parts.push(riGan + "为" + wuxing + "之精，" + ganInfo.性情 + " " + xinggeExtra);

  // 3. 事业格局
  parts.push("");
  parts.push("【事业格局】");
  if (guanCount >= 2) {
    parts.push(_pick(CLASSIC_QUOTES["官"]));
    parts.push("官星有力，事业心强，宜在体制或管理岗位发展，借官威以正当时。");
  } else if (caiCount >= 2) {
    parts.push(_pick(CLASSIC_QUOTES["财"]));
    parts.push("财星通门户，经商求财皆有路，但须身旺方能担之。");
  } else if (shiCount >= 2) {
    parts.push(_pick(CLASSIC_QUOTES["食伤"]));
    parts.push("食伤泄秀，以才华技艺立身，适合创意、艺术、技术领域。");
  } else {
    parts.push("命局平和，宜稳扎稳打，以时间换空间。");
  }

  // 4. 趋吉避凶
  parts.push("");
  parts.push("【趋吉避凶】");
  if (ws.level === "旺") {
    parts.push("身旺之命，喜" + wuxing + "之泄秀，忌再见比劫争锋。");
  } else if (ws.level === "衰") {
    var yongShen = { "木":"水木", "火":"木火", "土":"火土", "金":"土金", "水":"金水" }[wuxing] || "印比";
    parts.push("身弱之命，喜" + yongShen + "扶助，忌财官克耗。");
    parts.push("行运至印比之乡，方可大展拳脚。");
  } else {
    parts.push("中和之命，顺势即可，不必强求。");
  }

  // 5. 赠言
  parts.push("");
  parts.push("【玄机子赠言】");
  parts.push(_pick(BONUS_WORDS));

  return parts.join("\n");
}

module.exports = {
  generateMasterInterpretation: generateMasterInterpretation
};
