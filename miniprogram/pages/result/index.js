// pages/result/index.js v0.7.0
// 1:1 复刻 result-page-preview-3.html

var xuanjizi = null;
try {
  xuanjizi = require('../../utils/xuanjizi_master');
} catch (e) {
  console.warn('xuanjizi_master 加载失败:', e);
}

Page({
  data: {
    // 四柱
    pillars: [
      { pos: 'year', ganZhi: '甲辰', cangGan: '戊乙癸', shiShen: '偏财' },
      { pos: 'month', ganZhi: '丙寅', cangGan: '甲丙戊', shiShen: '伤官' },
      { pos: 'day', ganZhi: '己巳', cangGan: '丙戊庚', shiShen: '日主' },
      { pos: 'hour', ganZhi: '戊午', cangGan: '丁己', shiShen: '劫财' }
    ],

    // 大运节点
    dayunNodes: [
      { label: '乙丑', age: 4, active: false },
      { label: '甲子', age: 14, active: false },
      { label: '癸亥', age: 24, active: true },
      { label: '壬戌', age: 34, active: false },
      { label: '辛酉', age: 44, active: false },
      { label: '庚申', age: 54, active: false },
      { label: '己未', age: 64, active: false }
    ],

    // 折扇
    fanExpanded: false,

    // 姻缘
    yinyuanText: '红鸾星动，良缘可期。今岁桃花入命，月德贵人暗扶，利于结缘。然巳火为孤辰，不宜急进，静待佳音为上。',

    // 财运
    caiyunText: '正财稳固，偏财有波。今岁劫财透干，开销较大，宜守不宜攻。秋后金旺泄秀，或有意外之得，但需见好即收。',

    // 解读
    previewText: '命主日主己土，生于巳月火旺之地，印星得令…',
    fullText: '',
    unlocked: false,

    // 五行数据
    wuxingData: { 金: 65, 木: 45, 水: 30, 火: 80, 土: 55 },

    // 原始参数
    gender: '',
    birth: ''
  },

  onLoad(options) {
    // 从全局 app 读取排盘引擎计算结果
    try {
      const app = getApp();
      const data = app._paipanResult;
      if (data) {
        app._paipanResult = null;

        const shiShenMap = data.shishen || {};
        this.setData({
          pillars: [
            { pos: 'year',  ganZhi: (data.yearGan || '甲') + (data.yearZhi || '辰'),  cangGan: '戊乙癸', shiShen: (shiShenMap.year && shiShenMap.year[0]) || '' },
            { pos: 'month', ganZhi: (data.monthGan || '丙') + (data.monthZhi || '寅'), cangGan: '甲丙戊', shiShen: (shiShenMap.month && shiShenMap.month[0]) || '' },
            { pos: 'day',   ganZhi: (data.dayGan || '己') + (data.dayZhi || '巳'),    cangGan: '丙戊庚', shiShen: '日主' },
            { pos: 'hour',  ganZhi: (data.hourGan || '戊') + (data.hourZhi || '午'),   cangGan: '丁己',   shiShen: (shiShenMap.hour && shiShenMap.hour[0]) || '' }
          ],
          gender: (options && options.gender) || 'male',
          birth: (options && options.birth) || '',
          wuxingData: data.wuxingData || this.data.wuxingData
        });

        // 大运
        if (data.dayunList && Array.isArray(data.dayunList) && data.dayunList.length > 0) {
          const nodes = data.dayunList.map((item, i) => ({
            label: item.ganZhi || item.label || '',
            age: item.startAge || item.age || (i * 10 + 4),
            active: i === 0
          }));
          this.setData({ dayunNodes: nodes });
        }

        // 姻缘 / 财运（排盘引擎若提供则覆盖默认值）
        const extraData = {};
        if (data.yinyuanText) extraData.yinyuanText = data.yinyuanText;
        if (data.caiyunText) extraData.caiyunText = data.caiyunText;
        if (Object.keys(extraData).length) this.setData(extraData);
      }
    } catch (e) {
      console.warn('读取排盘结果失败:', e);
    }

    // 五行雷达在 onReady 中绘制
  },

  onReady() {
    this.drawWuxing();
  },

  drawWuxing() {
    if (this._drawing) return;
    this._drawing = true;
    try {
      const query = wx.createSelectorQuery();
      query.select('#wuxingCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          this._drawing = false;
          if (!res || !res[0] || !res[0].node) return;
          try {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const dpr = wx.getSystemInfoSync().pixelRatio;
            const width = res[0].width;
            const height = res[0].height;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            this.renderWuxing(ctx, width, height);
          } catch (e) {
            console.warn('Canvas draw failed:', e);
          }
        });
    } catch (e) {
      this._drawing = false;
      console.warn('drawWuxing failed:', e);
    }
  },

  renderWuxing(ctx, w, h) {
    const { wuxingData } = this.data;
    const names = ['金', '木', '水', '火', '土'];
    const values = names.map(n => wuxingData[n] || 0);
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(cx, cy) * 0.78;
    const levels = 5;
    const angles = names.map((_, i) => (i * 72 - 90) * Math.PI / 180);

    // 绘制网格
    for (let lv = 1; lv <= levels; lv++) {
      const r = R * lv / levels;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const x = cx + r * Math.cos(angles[i]);
        const y = cy + r * Math.sin(angles[i]);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(44,24,16,${0.10 * (lv / levels)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 绘制数据区域
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const scaledVal = 0.35 + (values[i] / 100) * 0.65;
      const r = R * scaledVal;
      const x = cx + r * Math.cos(angles[i]);
      const y = cy + r * Math.sin(angles[i]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(201,169,92,0.2)';
    ctx.fill();
    ctx.strokeStyle = '#2c1810';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制顶点
    for (let i = 0; i < 5; i++) {
      const scaledVal = 0.35 + (values[i] / 100) * 0.65;
      const r = R * scaledVal;
      const x = cx + r * Math.cos(angles[i]);
      const y = cy + r * Math.sin(angles[i]);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#2c1810';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }

    // 绘制标签
    ctx.font = 'bold 26px "KaiTi", "STKaiti", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 5; i++) {
      const lr = R * 1.18;
      const x = cx + lr * Math.cos(angles[i]);
      const y = cy + lr * Math.sin(angles[i]);
      ctx.fillStyle = '#2c1810';
      ctx.fillText(names[i], x, y);
    }
  },

  // 折扇点击
  onFanTap() {
    this.setData({ fanExpanded: !this.data.fanExpanded });
  },

  // 解锁解读
  onUnlock() {
    if (this.data.unlocked) return;

    // 调用玄机子生成完整解读
    let fullText = '';
    try {
      // 构造基础八字信息传给玄机子
      const { pillars, gender, birth } = this.data;
      const baziInfo = {
        year: pillars[0].ganZhi,
        month: pillars[1].ganZhi,
        day: pillars[2].ganZhi,
        hour: pillars[3].ganZhi,
        gender: gender === 'male' ? '男' : '女',
        birth
      };
      fullText = (xuanjizi && xuanjizi.generateMasterInterpretation(baziInfo)) || '';
    } catch (e) {
      console.error('玄机子解读失败:', e);
    }

    // 降级默认解读
    if (!fullText) {
      fullText = '命主日主己土，生于巳月火旺之地，印星得令。\n\n' +
        '年柱甲辰，正官坐库，祖业根基深厚。月柱丙寅，偏印生身，才华横溢，然枭神夺食，性格中略带孤傲。日主己巳，自坐帝旺，妻宫得力，得贤内助。时柱戊午，劫财坐禄，兄弟姐妹缘分深厚，亦主晚年名望。\n\n' +
        '五行火旺土相，缺金生水，性燥而气刚，宜以水调候，以金泄秀。大运行至癸亥（24–33岁），干支双水，正印生身，命主此十年学业有成、贵人扶持。34岁后入壬戌运，水入墓库，事业守成待变。\n\n' +
        '2025乙巳流年：七杀透干，事业有变动之机，巳火引动婚姻宫，情缘之事需谨慎。';
    }

    this.setData({
      unlocked: true,
      fullText
    });
  },

  // 存录
  onSaveRecord() {
    wx.showToast({ title: '存录已保存至玄机卷宗', icon: 'none' });
  },

  // 传示
  onShareRecord() {
    wx.showToast({ title: '分享链接已生成', icon: 'none' });
  },

  // 问师
  onAskMaster() {
    wx.showToast({ title: '玄机子已在路上…', icon: 'none' });
  }
});
