// cloudfunctions/baziPaipan v0.1.0
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// Mock 排盘数据
const MOCK_RESULT = {
  bazi: {
    year:  { gan: '甲', zhi: '子' },
    month: { gan: '丙', zhi: '寅' },
    day:   { gan: '戊', zhi: '午' },
    hour:  { gan: '庚', zhi: '申' }
  },
  shiShen: ['比肩', '食神', '偏财', '食神'],
  dayMaster: '戊土',
  daYun: {
    startAge: 5,
    current: '乙丑'
  }
}

exports.main = async (event, context) => {
  const { birth, gender } = event

  // 记录请求日志（mock阶段写入日志便于后续联调）
  console.log(`[baziPaipan] 排盘请求 - birth: ${birth}, gender: ${gender}`)

  return {
    code: 0,
    data: MOCK_RESULT,
    msg: 'ok'
  }
}
