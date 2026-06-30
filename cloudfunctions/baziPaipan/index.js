// cloudfunctions/baziPaipan v0.3.0
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云托管内网地址（生产环境从环境变量读取）
const CLOUD_RUN_URL = process.env.BAZI_ENGINE_URL || 'http://bazi-engine.internal:8080'

exports.main = async (event, context) => {
  const { birth, gender, action } = event
  const OP = action === 'interpret' ? 'interpret' : 'paipan'
  const OPENID = cloud.getWXContext().OPENID
  const startTime = Date.now()

  console.log(`[baziPaipan] ${OP}请求 - birth: ${birth}, gender: ${gender}, user: ${OPENID}`)

  // 参数校验
  if (!birth) {
    await logRequest(OPENID, OP, Date.now() - startTime, 'error', '缺少birth参数')
    return { code: 400, msg: '缺少出生时间参数', data: null }
  }

  // === 免费试用逻辑（排盘和解读共用） ===
  const userRes = await db.collection('users').where({_openid: OPENID}).get()

  if (userRes.data.length === 0) {
    // 新用户：创建用户记录，允许试用
    await db.collection('users').add({
      data: {
        _openid: OPENID,
        free_used: true,
        created_at: new Date()
      }
    })
    console.log(`[baziPaipan] 新用户首次使用，已标记免费试用 - user: ${OPENID}`)
  } else {
    const user = userRes.data[0]
    if (user.free_used) {
      // 已用过免费次数，检查订阅
      const subRes = await db.collection('subscriptions')
        .where({user_id: OPENID, status: 'active'})
        .get()
      if (subRes.data.length === 0) {
        await logRequest(OPENID, OP, 0, 'error', '免费次数已用完且无有效订阅')
        return { code: 402, msg: '免费次数已用完，请订阅后继续使用', data: null }
      }
    }
  }

  // 路由：解读走 /api/interpret，排盘走 /api/paipan
  const apiPath = action === 'interpret' ? '/api/interpret' : '/api/paipan'
  const requestData = action === 'interpret'
    ? { birth, gender, paipan_result: event.paipanData || null }
    : { birth, gender }

  try {
    const result = await cloud.callContainer({
      config: { env: 'prod' },
      path: apiPath,
      method: 'POST',
      header: { 'X-WX-SERVICE': 'bazi-engine' },
      data: requestData,
      timeout: 15000
    })

    const costMs = Date.now() - startTime

    if (result.statusCode === 200 && result.data) {
      const body = typeof result.data === 'string' ? JSON.parse(result.data) : result.data
      await logRequest(OPENID, OP, costMs, 'ok')
      console.log(`[baziPaipan] ${OP}成功 - cost: ${costMs}ms`)

      // 统一返回格式：code=0 表示成功，data 承载业务数据
      return {
        code: 0,
        msg: 'ok',
        data: body
      }
    } else {
      await logRequest(OPENID, OP, costMs, 'error', `云托管返回异常: ${result.statusCode}`)
      return { code: 500, msg: '服务异常，请稍后重试', data: null }
    }
  } catch (err) {
    const costMs = Date.now() - startTime

    if (err.errCode === -1) {
      console.error(`[baziPaipan] 云托管超时 - cost: ${costMs}ms`)
      await logRequest(OPENID, OP, costMs, 'error', '云托管超时')
      return { code: 504, msg: '服务响应超时，请重试', data: null }
    }

    console.error(`[baziPaipan] 云托管调用失败:`, err)
    await logRequest(OPENID, OP, costMs, 'error', err.message || '未知错误')
    return { code: 500, msg: '服务异常，请稍后重试', data: null }
  }
}

async function logRequest(userId, action, costMs, status, errorMsg) {
  try {
    await db.collection('request_log').add({
      data: {
        user_id: userId,
        action: action,
        cost_ms: costMs,
        status: status,
        error_msg: errorMsg || '',
        created_at: new Date()
      }
    })
  } catch (e) {
    console.error('[日志写入失败]', e)
  }
}
