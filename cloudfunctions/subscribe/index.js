const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { plan } = event
  const OPENID = cloud.getWXContext().OPENID
  const PLANS = { monthly: { price: 980, name: '月度订阅', days: 30 }, yearly: { price: 9800, name: '年度订阅', days: 365 } }
  const selected = PLANS[plan]
  if (!selected) return { code: 400, msg: '无效的订阅方案' }
  try {
    const res = await cloud.cloudPay.unifiedOrder({
      body: `玄机算命-${selected.name}`,
      outTradeNo: `xuanji_sub_${OPENID}_${Date.now()}`,
      totalFee: selected.price,
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'subscribe',
      tradeType: 'JSAPI'
    })
    return { code: 0, data: res.payment, plan: plan, days: selected.days }
  } catch (err) {
    console.error('[订阅创建失败]', err)
    return { code: 500, msg: '支付创建失败' }
  }
}
