// cloudfunctions/getUserProfile/index.js v1.0.0
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const OPENID = wxContext.OPENID

  try {
    const userRes = await db.collection('users').where({ _openid: OPENID }).get()
    let user = userRes.data[0] || {}

    const subRes = await db.collection('subscriptions')
      .where({ _openid: OPENID })
      .orderBy('created_at', 'desc')
      .limit(1)
      .get()

    const subscription = subRes.data[0] || null

    return {
      code: 0,
      data: {
        openid: OPENID,
        nickname: user.nickname || '',
        avatar: user.avatar || '',
        unionid: wxContext.UNIONID || ''
      },
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        start_at: subscription.start_at,
        end_at: subscription.end_at
      } : null
    }
  } catch (err) {
    console.error('[getUserProfile]', err)
    return {
      code: 500,
      msg: '获取用户信息失败',
      data: null,
      subscription: null
    }
  }
}