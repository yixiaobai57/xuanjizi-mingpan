/**
 * 八字排盘核心算法 v1.0
 * 基于公历日期计算年柱、月柱、日柱、时柱、十神、五行分布
 * 不依赖云函数，纯本地 JavaScript 实现
 */

// ========== 天干地支基础 ==========
var TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
var DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
var GAN_WUXING = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
var ZHI_WUXING = { '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' };

// 五行取色/CSS类映射
var WUXING_COLOR = { '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water' };

// ========== 节气日期表（近似值，用于月份分界） ==========
// 每个月的中气日期（公历），用于确定月支
// 立春约 2/4 → 寅月，惊蛰约 3/6 → 卯月，清明约 4/5 → 辰月，立夏约 5/6 → 巳月
// 芒种约 6/6 → 午月，小暑约 7/7 → 未月，立秋约 8/8 → 申月，白露约 9/8 → 酉月
// 寒露约 10/8 → 戌月，立冬约 11/8 → 亥月，大雪约 12/7 → 子月，小寒约 1/6 → 丑月
var JIEQI_DAYS = [
  { month: 1,  day: 6,  zhiIndex: 1 },  // 小寒 → 丑月
  { month: 2,  day: 4,  zhiIndex: 2 },  // 立春 → 寅月
  { month: 3,  day: 6,  zhiIndex: 3 },  // 惊蛰 → 卯月
  { month: 4,  day: 5,  zhiIndex: 4 },  // 清明 → 辰月
  { month: 5,  day: 6,  zhiIndex: 5 },  // 立夏 → 巳月
  { month: 6,  day: 6,  zhiIndex: 6 },  // 芒种 → 午月
  { month: 7,  day: 7,  zhiIndex: 7 },  // 小暑 → 未月
  { month: 8,  day: 8,  zhiIndex: 8 },  // 立秋 → 申月
  { month: 9,  day: 8,  zhiIndex: 9 },  // 白露 → 酉月
  { month: 10, day: 8,  zhiIndex: 10 }, // 寒露 → 戌月
  { month: 11, day: 8,  zhiIndex: 11 }, // 立冬 → 亥月
  { month: 12, day: 7,  zhiIndex: 0 },  // 大雪 → 子月
];

// ========== 工具函数 ==========

/** 计算某年某月和该月节气的偏移（闰年微调） */
function _getJieqiDay(year, jqIndex) {
  var jq = JIEQI_DAYS[jqIndex];
  var day = jq.day;
  // 闰年2月定气前推（立春等前移）
  var isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  if (isLeap && jq.month <= 2) day = Math.max(day - 1, 3);
  return day;
}

/**
 * 根据公历日期获取月支索引（以节气为分界）
 */
function getMonthZhiIndex(year, month, day) {
  // 找到当前日期落入哪个节气区间
  for (var i = JIEQI_DAYS.length - 1; i >= 0; i--) {
    var jq = JIEQI_DAYS[i];
    var jqDay = _getJieqiDay(year, i);
    // 处理跨年情况：1月早于小寒时属于上一年的丑月
    if (month < jq.month || (month === jq.month && day < jqDay)) {
      if (i === 0) {
        // 1月1日~1月5日，属前一年的丑月(1)
        return 1; // 丑
      }
      continue;
    }
    return jq.zhiIndex;
  }
  // 兜底：1月初
  return 1;
}

/** 计算公历日期距 1900-01-01 的天数 */
function _daysFrom1900(year, month, day) {
  var total = 0;
  // 整年
  for (var y = 1900; y < year; y++) {
    total += ((y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0)) ? 366 : 365;
  }
  // 当年整月
  var mdays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  if (isLeap) mdays[1] = 29;
  for (var m = 0; m < month - 1; m++) {
    total += mdays[m];
  }
  total += day - 1;
  return total;
}

/**
 * 计算日干支
 * 基准：1900-01-01 = 甲戌（天干0=甲，地支10=戌，60甲子序号=10）
 */
function getDayGanZhi(year, month, day) {
  var days = _daysFrom1900(year, month, day);
  var cycleIndex = (10 + days) % 60; // 1900-01-01 是甲戌(序号10)
  var ganIdx = cycleIndex % 10;
  var zhiIdx = cycleIndex % 12;
  return {
    gan: TIAN_GAN[ganIdx],
    zhi: DI_ZHI[zhiIdx],
    wuxing: GAN_WUXING[TIAN_GAN[ganIdx]],
    ganIndex: ganIdx,
    zhiIndex: zhiIdx
  };
}

/**
 * 计算年干支（以立春为分界）
 * 年干 = (year-4) % 10，年支 = (year-4) % 12
 * 若日期在立春之前，使用前一年
 */
function getYearGanZhi(year, month, day) {
  var lichunDay = _getJieqiDay(year, 1); // 立春在 JIEQI_DAYS[1]，约2/4
  var effYear = year;
  if (month < 2 || (month === 2 && day < lichunDay)) {
    effYear = year - 1;
  }
  var ganIdx = (effYear - 4) % 10;
  if (ganIdx < 0) ganIdx += 10;
  var zhiIdx = (effYear - 4) % 12;
  if (zhiIdx < 0) zhiIdx += 12;
  return {
    gan: TIAN_GAN[ganIdx],
    zhi: DI_ZHI[zhiIdx],
    wuxing: GAN_WUXING[TIAN_GAN[ganIdx]],
    ganIndex: ganIdx,
    zhiIndex: zhiIdx
  };
}

/**
 * 计算月干支（以节气为分界）
 * 月支 = 节气月支索引
 * 月干 = 五虎遁：年干 x → 正月(寅月)干 = (x*2+2) % 10 ... 简化公式
 * 五虎遁口诀：甲己之年丙作首，乙庚之年戊为头，丙辛之年寻庚起，丁壬壬寅顺水流，戊癸之年甲寅求
 */
function getMonthGanZhi(year, month, day, yearGanIndex) {
  var zhiIndex = getMonthZhiIndex(year, month, day);
  // 五虎遁：寅月(2)起始天干映射
  // 年干: 甲己(0,5)→丙(2), 乙庚(1,6)→戊(4), 丙辛(2,7)→庚(6), 丁壬(3,8)→壬(8), 戊癸(4,9)→甲(0)
  var huyinStart = [2, 4, 6, 8, 0]; // 对应的寅月天干起始（甲己→2=丙）
  var yearGroup = yearGanIndex % 5;
  var yinGan = huyinStart[yearGroup];
  // 寅月为地支索引2，当前月地支索引为 zhiIndex
  var offset = (zhiIndex - 2 + 12) % 12;
  var ganIdx = (yinGan + offset) % 10;
  return {
    gan: TIAN_GAN[ganIdx],
    zhi: DI_ZHI[zhiIndex],
    wuxing: GAN_WUXING[TIAN_GAN[ganIdx]],
    ganIndex: ganIdx,
    zhiIndex: zhiIndex
  };
}

/**
 * 计算时干支
 * 时支 = (hour+1)/2 → 子(0)丑(1)...亥(11)
 * 时干 = 五鼠遁：日干 x → 子时干 = (x*2) % 10
 * 五鼠遁：甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
 */
function getHourGanZhi(hour, dayGanIndex) {
  // 时支索引
  var zhiIndex = Math.floor((hour + 1) / 2) % 12;
  // 五鼠遁：子时起始天干
  // 日干: 甲己(0,5)→甲(0), 乙庚(1,6)→丙(2), 丙辛(2,7)→戊(4), 丁壬(3,8)→庚(6), 戊癸(4,9)→壬(8)
  var ratStart = [0, 2, 4, 6, 8];
  var dayGroup = dayGanIndex % 5;
  var ziGan = ratStart[dayGroup];
  var ganIdx = (ziGan + zhiIndex) % 10;
  return {
    gan: TIAN_GAN[ganIdx],
    zhi: DI_ZHI[zhiIndex],
    wuxing: GAN_WUXING[TIAN_GAN[ganIdx]],
    ganIndex: ganIdx,
    zhiIndex: zhiIndex
  };
}

/**
 * 计算十神（以日干为"我"）
 * 同我者比劫（阳同阳=比肩，阳同阴=劫财）
 * 我生者食伤（阳生阳=食神，阳生阴=伤官）
 * 我克者财（阳克阳=偏财，阳克阴=正财）
 * 克我者官杀（阳克阳=七杀，阳克阴=正官）
 * 生我者印（阳生阳=偏印，阳生阴=正印）
 */
var SHISHEN_TABLE = {
  // 日干甲(0)→各天干对应的十神
  0: { 0: '比肩', 1: '劫财', 2: '食神', 3: '伤官', 4: '偏财', 5: '正财', 6: '七杀', 7: '正官', 8: '偏印', 9: '正印' },
  1: { 1: '比肩', 0: '劫财', 3: '食神', 2: '伤官', 5: '偏财', 4: '正财', 7: '七杀', 6: '正官', 9: '偏印', 8: '正印' },
  2: { 2: '比肩', 3: '劫财', 4: '食神', 5: '伤官', 6: '偏财', 7: '正财', 8: '七杀', 9: '正官', 0: '偏印', 1: '正印' },
  3: { 3: '比肩', 2: '劫财', 5: '食神', 4: '伤官', 7: '偏财', 6: '正财', 9: '七杀', 8: '正官', 1: '偏印', 0: '正印' },
  4: { 4: '比肩', 5: '劫财', 6: '食神', 7: '伤官', 8: '偏财', 9: '正财', 0: '七杀', 1: '正官', 2: '偏印', 3: '正印' },
  5: { 5: '比肩', 4: '劫财', 7: '食神', 6: '伤官', 9: '偏财', 8: '正财', 1: '七杀', 0: '正官', 3: '偏印', 2: '正印' },
  6: { 6: '比肩', 7: '劫财', 8: '食神', 9: '伤官', 0: '偏财', 1: '正财', 2: '七杀', 3: '正官', 4: '偏印', 5: '正印' },
  7: { 7: '比肩', 6: '劫财', 9: '食神', 8: '伤官', 1: '偏财', 0: '正财', 3: '七杀', 2: '正官', 5: '偏印', 4: '正印' },
  8: { 8: '比肩', 9: '劫财', 0: '食神', 1: '伤官', 2: '偏财', 3: '正财', 4: '七杀', 5: '正官', 6: '偏印', 7: '正印' },
  9: { 9: '比肩', 8: '劫财', 1: '食神', 0: '伤官', 3: '偏财', 2: '正财', 5: '七杀', 4: '正官', 7: '偏印', 6: '正印' },
};

function getShiShen(dayGanIndex, otherGanIndex) {
  return SHISHEN_TABLE[dayGanIndex][otherGanIndex];
}

/**
 * 计算五行分布
 * 八字8个字每个字的五行计算百分比
 */
function calcWuxingPercent(bazi) {
  var wuxingKeys = ['木', '火', '土', '金', '水'];
  var count = {};
  wuxingKeys.forEach(function(k) { count[k] = 0; });

  var keys = ['year', 'month', 'day', 'hour'];
  keys.forEach(function(k) {
    var p = bazi[k];
    count[p.wuxing] = (count[p.wuxing] || 0) + 1;
    var zwx = ZHI_WUXING[p.zhi];
    if (zwx) count[zwx] = (count[zwx] || 0) + 1;
  });

  var result = {};
  wuxingKeys.forEach(function(k) {
    result[k] = Math.round((count[k] / 8) * 100);
  });
  return result;
}

/**
 * 计算大运（简化版）
 * 阳年男/阴年女 → 顺排大运（月柱之后顺行）
 * 阳年女/阴年男 → 逆排大运
 * 起运年龄简化：默认6岁起运
 */
function calcDaYun(yearGanIndex, gender, monthZhiIndex) {
  var isYangYear = yearGanIndex % 2 === 0; // 甲丙戊庚壬为阳年
  var isMale = gender === 'male';
  var forward = (isYangYear && isMale) || (!isYangYear && !isMale);

  var startAge = 6; // 简化：默认6岁起运
  var list = [];
  for (var i = 0; i < 8; i++) {
    var zhiIdx = forward
      ? (monthZhiIndex + 1 + i) % 12
      : (monthZhiIndex - 1 - i + 12) % 12;
    var ganIdx = (monthZhiIndex + i) % 10;
    var ageStart = startAge + i * 10;
    var ageEnd = ageStart + 9;
    list.push({
      ganZhi: TIAN_GAN[ganIdx] + DI_ZHI[zhiIdx],
      startAge: ageStart,
      endAge: ageEnd,
      label: TIAN_GAN[ganIdx] + DI_ZHI[zhiIdx] + '(' + ageStart + '-' + ageEnd + '岁)'
    });
  }

  return {
    startAge: startAge,
    current: list[0],
    list: list
  };
}

// ========== 主入口 ==========

/**
 * 根据公历出生日期和性别计算八字
 * @param {number} year - 公历年份 (1900-2100)
 * @param {number} month - 公历月份 (1-12)
 * @param {number} day - 公历日期 (1-31)
 * @param {number} hour - 小时 (0-23)
 * @param {string} gender - 'male' | 'female'
 * @returns {object} 排盘结果，格式兼容原有 mockData 结构
 */
function paipan(year, month, day, hour, gender) {
  // 计算四柱
  var dayGZ = getDayGanZhi(year, month, day);
  var yearGZ = getYearGanZhi(year, month, day);
  var monthGZ = getMonthGanZhi(year, month, day, yearGZ.ganIndex);
  var hourGZ = getHourGanZhi(hour, dayGZ.ganIndex);

  var bazi = {
    year:  { gan: yearGZ.gan,  zhi: yearGZ.zhi,  wuxing: yearGZ.wuxing },
    month: { gan: monthGZ.gan, zhi: monthGZ.zhi, wuxing: monthGZ.wuxing },
    day:   { gan: dayGZ.gan,   zhi: dayGZ.zhi,   wuxing: dayGZ.wuxing },
    hour:  { gan: hourGZ.gan,  zhi: hourGZ.zhi,  wuxing: hourGZ.wuxing }
  };

  // 十神
  var shiShen = {
    year:  [getShiShen(dayGZ.ganIndex, yearGZ.ganIndex)],
    month: [getShiShen(dayGZ.ganIndex, monthGZ.ganIndex)],
    day:   ['日主'],
    hour:  [getShiShen(dayGZ.ganIndex, hourGZ.ganIndex)]
  };

  // 日主
  var dayMaster = dayGZ.gan + dayGZ.wuxing;

  // 五行分布
  var wuxing = calcWuxingPercent(bazi);

  // 大运
  var daYun = calcDaYun(yearGZ.ganIndex, gender, monthGZ.zhiIndex);

  return {
    bazi: bazi,
    shiShen: shiShen,
    dayMaster: dayMaster,
    wuxing: wuxing,
    daYun: daYun
  };
}

module.exports = {
  paipan: paipan,
  // 导出内部函数供测试
  _daysFrom1900: _daysFrom1900,
  _getDayGanZhi: getDayGanZhi,
  _getYearGanZhi: getYearGanZhi,
  _getMonthGanZhi: getMonthGanZhi,
  _getHourGanZhi: getHourGanZhi,
  _getShiShen: getShiShen
};
