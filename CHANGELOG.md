# CHANGELOG

## [v0.6.0] - 2026-06-28
### Added
- 微信支付订阅云函数 (cloudfunctions/subscribe): 支持月度/年度订阅创建，对接云开发微信支付 API
- 个人中心页 (pages/profile): 用户信息展示、订阅状态查询、购买入口、历史记录入口
- app.json 追加 profile 页面路由

## [v1.0.0] - 2026-06-28
### Added
- 历史记录页 (pages/history): readings 表查询，分页加载，日主+预览前50字展示，点击进入详情
- 用户信息云函数 (cloudfunctions/getUserProfile): 获取 OPENID/昵称/头像，联查 subscriptions 表返回订阅状态
- app.json 追加 history 页面路由
- Goal-4 审查通过: 4 条标准全部通过（微信支付/历史记录/完整闭环/MVP可提交审核）
- Loop #4 审查通过
- project-files.md: 完整文件清单（61 个文件）

### Changed
- project.config.json 版本号 bump 0.5.0 → 1.0.0（MVP 发布）

## [v0.5.1-fix] - 2026-06-28
### Fixed
- Fixed 3个阻塞bug:
  1. 排盘成功后无页面导航：paipan/index.js 在 cloud.callFunction 成功回调中增加 wx.navigateTo 跳转结果页，通过 eventChannel 传递 paipanData
  2. 数据格式不匹配：云函数统一返回 {code:0, data:{bazi,shiShen,dayMaster,wuXing,daYun}}，result/index.js renderResult 新增 bazi→pillars 映射和 shiShen 解析
  3. 解读路由缺失：云函数新增 action 参数支持，action='interpret' 时路由到云托管 /api/interpret，默认走 /api/paipan；解读超时提升到 15s

## [v0.5.0] - 2026-06-28
### Completed
- W3 阶段完成：LLM解读接入 + 结果页渲染 + 免费试用逻辑
- Goal-3 审查通过
- Loop #3 代码审查完成

## [v0.5.3] - 2026-06-28
### Added
- Added 免费试用逻辑+付费引导: 云函数baziPaipan新增免费试用判断(新用户免费用一次/老用户查订阅)，前端paipan页新增402返回码付费引导弹窗

## [v0.5.2] - 2026-06-28
### Added
- Added 结果页UI: 命盘卡片(四柱展示)、日主标签、五行分布条、大运信息、AI解读正文区(scroll-view)、底部按钮栏(再测一次/分享/保存)

## [v0.5.1] - 2026-06-28
### Added
- /api/interpret 解读接口: 接收 {birth, gender, paipan_result}，支持前端传排盘结果或后端自行排盘，调用 LLM 生成白话解读，LLM 不可用时返回降级结果 (fallback=true, interpretation=null)

## [v0.5.0] - 2026-06-28
### Added
- LLM客户端 (llm_client.py): 封装混元API调用，支持prompt模板注入、重试/降级、多云厂商切换
- Prompt模板 (prompt_templates/basic.yaml): MVP基础解读模板，八字排盘→白话解读

## [v0.4.0] - 2026-06-28
### Completed
- W2 阶段完成：排盘核心引擎 + 边界测试 + 云函数对接云托管
- Goal-2 审查通过
- Loop #2 代码审查完成

### Changed
- 云函数 baziPaipan 从 mock/cloud.fetch 模式切换为正式对接云托管 (cloud.callContainer)
- 新增超时处理：云托管超时返回 504，其他异常返回 500
- 新增 request_log 写入：每次调用写入云数据库 request_log 表
- config.json 追加 `"timeout":15` 超时配置

## [v0.1.0] - 2026-06-28

### Added
- 小程序项目初始化（app.js / app.json / app.wxss / project.config.json / sitemap.json）
- 云函数 baziPaipan 空壳（index.js / package.json / config.json）
- 全局样式采用玄学主题配色（深色背景 #1a1a2e，金色主色调 #c9a96e，白色文字）

## [v0.1.1] - 2026-06-28
### Changed
- baziPaipan 云函数从空壳替换为 mock 数据返回，包含四柱/十神/日主/大运

## [v0.1.2] - 2026-06-28
### Added
- 云托管排盘引擎空壳（Flask + Docker）
- /health 健康检查端点
- /api/paipan 排盘接口（空壳）

## [v0.2.0] - 2026-06-28
### Completed
- W1 阶段完成：项目骨架 + 八字输入页 + 云函数mock + 云托管空壳
- Goal-1 审查通过
- Loop #1 代码审查完成

## [v0.3.1] - 2026-06-28
### Added
- 边界测试 (tests/test_paipan.py): 6大场景35个子用例，覆盖子时跨日/闰月/节气/极值/正常/格式错误
- 测试结果报告 (tests/test_result.md)

### Known Limitations
- 简化算法未实现节气分界(2月→卯)、子时跨日(00:00为日界)、农历闰月处理

## [v0.3.0] - 2026-06-28
### Added
- 八字排盘核心引擎 (paipan.py: calculate_bazi_standalone)
- 工具函数库 (utils.py: 天干地支/藏干/十神/五行)
- Flask /api/paipan 正式对接排盘引擎，含完整错误处理
