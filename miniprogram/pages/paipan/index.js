// pages/paipan/index.js v0.3.0
// 1:1 复刻 paipan-page-preview-2-2.html

let paipanCore = null;
try { paipanCore = require('../../utils/paipan_core'); } catch(e) { console.error('[paipan] paipan_core 加载失败:', e); }

Page({
  data: {
    yearIndex: 0,
    monthIndex: 0,
    dayIndex: 0,

    yearGanZhi: '甲辰',
    yearNumber: '2024',
    monthGanZhi: '乙巳',
    monthNumber: '06',
    dayGanZhi: '己酉',
    dayNumber: '29',

    shichenList: [
      { shi: '子', range: '23–01', hour: 0 },
      { shi: '丑', range: '01–03', hour: 2 },
      { shi: '寅', range: '03–05', hour: 4 },
      { shi: '卯', range: '05–07', hour: 6 },
      { shi: '辰', range: '07–09', hour: 8 },
      { shi: '巳', range: '09–11', hour: 10 },
      { shi: '午', range: '11–13', hour: 12 },
      { shi: '未', range: '13–15', hour: 14 },
      { shi: '申', range: '15–17', hour: 16 },
      { shi: '酉', range: '17–19', hour: 18 },
      { shi: '戌', range: '19–21', hour: 20 },
      { shi: '亥', range: '21–23', hour: 22 }
    ],
    hourIndex: 5,  // 默认巳时 (index 5)
    gender: 'male',
    submitting: false,

    yearData: [],
    monthData: [],
    dayData: []
  },

  onLoad() {
    console.log('[paipan] onLoad 开始');
    this.initData();
    console.log('[paipan] onLoad 完成');
  },

  initData() {
    // 年：1900–2040，干支按公式 (year-4)%10 天干 (year-4)%12 地支
    const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const diZhi   = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const yearData = [];
    for (let y = 1900; y <= 2040; y++) {
      const gz = tianGan[(y - 4) % 10] + diZhi[(y - 4) % 12];
      yearData.push({ ganzhi: gz, number: String(y), label: gz + ' ' + y });
    }

    // 月：固定 12 个月
    const monthGanZhiList = ['丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉', '甲戌', '乙亥', '丙子', '丁丑'];
    const monthData = monthGanZhiList.map((gz, i) => ({
      ganzhi: gz,
      number: String(i + 1).padStart(2, '0'),
      label: gz + ' ' + String(i + 1).padStart(2, '0') + '月'
    }));

    const today = new Date();
    const curMonth = today.getMonth();
    const curDay = today.getDate();
    const curYear = today.getFullYear();

    // 初始化年份索引：当前年
    let yearIdx = curYear - 1900;
    if (yearIdx < 0) yearIdx = 0;
    if (yearIdx >= yearData.length) yearIdx = yearData.length - 1;

    // 初始化月份
    const defaultMonthIdx = curMonth;

    // 生成日数据
    const dayData = this._buildDayData(curYear, defaultMonthIdx);

    // 初始化日
    let dayIdx = curDay - 1;
    if (dayIdx >= dayData.length) dayIdx = 0;
    if (dayIdx < 0) dayIdx = 0;

    // 初始化时辰为巳时(index 5)
    const hourIdx = 5;

    this.setData({
      yearData,
      monthData,
      dayData,
      yearIndex: yearIdx,
      monthIndex: defaultMonthIdx,
      dayIndex: dayIdx,
      hourIndex: hourIdx,
      yearGanZhi: yearData[yearIdx].ganzhi,
      yearNumber: yearData[yearIdx].number,
      monthGanZhi: monthData[defaultMonthIdx].ganzhi,
      monthNumber: monthData[defaultMonthIdx].number,
      dayGanZhi: dayData[dayIdx].ganzhi,
      dayNumber: dayData[dayIdx].number
    });
  },

  // 根据年月生成日数据（含闰年二月判断）
  _buildDayData(year, monthIdx) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    if (isLeap) daysInMonth[1] = 29;

    const dayGanZhiList = [
      '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
      '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
      '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
      '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
      '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
      '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
    ];

    const maxDays = daysInMonth[monthIdx];
    const dayData = [];
    for (let d = 0; d < maxDays; d++) {
      const gz = dayGanZhiList[d % 60];
      const num = String(d + 1).padStart(2, '0');
      dayData.push({ ganzhi: gz, number: num, label: gz + ' ' + num + '日' });
    }
    return dayData;
  },

  // 年选择器
  onYearChange(e) {
    const idx = parseInt(e.detail.value);
    const item = this.data.yearData[idx];
    const year = parseInt(item.number);
    // 年变更时重算日（二月天数可能变）
    const dayData = this._buildDayData(year, this.data.monthIndex);
    const dayIdx = Math.min(this.data.dayIndex, dayData.length - 1);
    this.setData({
      yearIndex: idx,
      yearGanZhi: item.ganzhi,
      yearNumber: item.number,
      dayData,
      dayIndex: dayIdx,
      dayGanZhi: dayData[dayIdx].ganzhi,
      dayNumber: dayData[dayIdx].number
    });
  },

  // 月选择器（切换月份时重置日为1号，天数随月份+闰年变化）
  onMonthChange(e) {
    const idx = parseInt(e.detail.value);
    const item = this.data.monthData[idx];
    const year = parseInt(this.data.yearNumber);
    const dayData = this._buildDayData(year, idx);

    this.setData({
      monthIndex: idx,
      monthGanZhi: item.ganzhi,
      monthNumber: item.number,
      dayIndex: 0,
      dayGanZhi: dayData[0].ganzhi,
      dayNumber: dayData[0].number,
      dayData
    });
  },

  // 日选择器
  onDayChange(e) {
    const idx = parseInt(e.detail.value);
    const item = this.data.dayData[idx];
    this.setData({
      dayIndex: idx,
      dayGanZhi: item.ganzhi,
      dayNumber: item.number
    });
  },

  // 时辰选择
  onShiTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ hourIndex: index });
  },

  // 性别切换
  onGenderTap(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({ gender });
  },

  // 排盘
  onSubmit() {
    if (this.data.submitting) return;

    const { yearNumber, monthNumber, dayNumber, hourIndex, shichenList, gender, yearData, monthData, yearIndex, monthIndex, dayIndex } = this.data;
    const hour = shichenList[hourIndex].hour;

    // 解析为数字
    const year = parseInt(yearNumber);
    const month = parseInt(monthNumber);
    const day = parseInt(dayNumber);

    // 注释掉 setData，完全隔离超时来源
    // this.setData({ submitting: true });

    // 调用本地排盘引擎
    try {
      console.log('[paipan] onLoad 完成，开始计算', year, month, day, hour, gender);
      const result = paipanCore.paipan(year, month, day, hour, gender);
      console.log('[paipan] 计算完成', result ? JSON.stringify(Object.keys(result)) : 'null');

      const bazi = result.bazi;
      const shiShen = result.shiShen;

      // 通过全局 app 传递数据，避免 storage 和长 URL
      const app = getApp();
      app._paipanResult = {
        wuxingData: result.wuxing || {},
        dayunList: (result.daYun && result.daYun.list) || [],
        shishen: shiShen,
        yearGan: bazi.year.gan,
        yearZhi: bazi.year.zhi,
        monthGan: bazi.month.gan,
        monthZhi: bazi.month.zhi,
        dayGan: bazi.day.gan,
        dayZhi: bazi.day.zhi,
        hourGan: bazi.hour.gan,
        hourZhi: bazi.hour.zhi
      };

      const birthStr = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + ' ' + String(hour).padStart(2, '0') + ':00';
      // 开关：true 跳过结果页只验证计算，false 正常跳转
      var DEBUG_ONLY_COMPUTE = false;
      if (DEBUG_ONLY_COMPUTE) {
        console.log('[paipan] DEBUG: 计算成功，不跳转');
        console.log('[paipan] 八字:', JSON.stringify(bazi));
        return;
      }
      console.log('[paipan] 开始导航到结果页');
      wx.navigateTo({
        url: '/pages/result/index?gender=' + gender + '&birth=' + encodeURIComponent(birthStr),
        success: () => {
          this.setData({ submitting: false });
        },
        fail: () => {
          this.setData({ submitting: false });
          wx.showToast({ title: '跳转失败', icon: 'none' });
        }
      });
    } catch (err) {
      console.error('排盘失败:', err);
      this.setData({ submitting: false });
      wx.showToast({ title: '排盘失败，请重试', icon: 'none' });
    }
  }
});
