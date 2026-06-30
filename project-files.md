# 玄机算命 · 项目文件清单

> 生成时间: 2026-06-28
> 工作目录: `conv_19f0a1d303c_34c5f093843d`
> 总文件数: 61

## 项目根目录

| # | 文件路径 | 说明 |
|---|----------|------|
| 1 | `CHANGELOG.md` | 版本变更日志 |
| 2 | `README.md` | 项目说明 |
| 3 | `loop-report.md` | Loop 审查报告（最新为 Loop #3） |
| 4 | `goal-review-w1.md` | Week 1 目标审查 |
| 5 | `goal-review-w2.md` | Week 2 目标审查 |
| 6 | `goal-review-w3.md` | Week 3 目标审查 |

## miniprogram/

| # | 文件路径 | 说明 |
|---|----------|------|
| 7 | `miniprogram/app.js` | 小程序入口 |
| 8 | `miniprogram/app.json` | 小程序配置（路由/窗口） |
| 9 | `miniprogram/app.wxss` | 全局样式 |
| 10 | `miniprogram/project.config.json` | 项目编译配置 (v0.5.0) |
| 11 | `miniprogram/sitemap.json` | 站点地图 |

### 排盘页 pages/paipan/

| # | 文件路径 | 说明 |
|---|----------|------|
| 12 | `miniprogram/pages/paipan/index.js` | 排盘输入逻辑 |
| 13 | `miniprogram/pages/paipan/index.json` | 页面配置 |
| 14 | `miniprogram/pages/paipan/index.wxml` | 排盘输入模板 |
| 15 | `miniprogram/pages/paipan/index.wxss` | 排盘页样式 |

### 结果页 pages/result/

| # | 文件路径 | 说明 |
|---|----------|------|
| 16 | `miniprogram/pages/result/index.js` | 结果页逻辑 |
| 17 | `miniprogram/pages/result/index.json` | 页面配置 |
| 18 | `miniprogram/pages/result/index.wxml` | 命盘结果模板 |
| 19 | `miniprogram/pages/result/index.wxss` | 结果页样式 |

### 个人中心 pages/profile/

| # | 文件路径 | 说明 |
|---|----------|------|
| 20 | `miniprogram/pages/profile/index.js` | 个人中心逻辑 |
| 21 | `miniprogram/pages/profile/index.json` | 页面配置 |
| 22 | `miniprogram/pages/profile/index.wxml` | 个人中心模板 |
| 23 | `miniprogram/pages/profile/index.wxss` | 个人中心样式 |

### 历史记录 pages/history/

| # | 文件路径 | 说明 |
|---|----------|------|
| 24 | `miniprogram/pages/history/index.js` | 历史记录逻辑 |
| 25 | `miniprogram/pages/history/index.json` | 页面配置 |
| 26 | `miniprogram/pages/history/index.wxml` | 历史记录模板 |
| 27 | `miniprogram/pages/history/index.wxss` | 历史记录样式 |

## cloudfunctions/

### baziPaipan

| # | 文件路径 | 说明 |
|---|----------|------|
| 28 | `cloudfunctions/baziPaipan/config.json` | 云函数权限配置 |
| 29 | `cloudfunctions/baziPaipan/index.js` | 排盘+解读云函数（action路由） |
| 30 | `cloudfunctions/baziPaipan/package.json` | 云函数依赖 |
| 31 | `cloudfunctions/baziPaipan/index_20260628_020302_768.js` | 历史备份 |

### subscribe

| # | 文件路径 | 说明 |
|---|----------|------|
| 32 | `cloudfunctions/subscribe/config.json` | 支付权限配置 |
| 33 | `cloudfunctions/subscribe/index.js` | 订阅支付云函数 |
| 34 | `cloudfunctions/subscribe/package.json` | 云函数依赖 |

### getUserProfile

| # | 文件路径 | 说明 |
|---|----------|------|
| 35 | `cloudfunctions/getUserProfile/index.js` | 用户信息云函数 |
| 36 | `cloudfunctions/getUserProfile/package.json` | 云函数依赖 |

## cloudrun/bazi-engine/

| # | 文件路径 | 说明 |
|---|----------|------|
| 37 | `cloudrun/bazi-engine/__init__.py` | Python 包初始化 |
| 38 | `cloudrun/bazi-engine/Dockerfile` | Docker 构建文件 |
| 39 | `cloudrun/bazi-engine/llm_client.py` | LLM 客户端（混元API） |
| 40 | `cloudrun/bazi-engine/main.py` | Flask 主入口 (/api/paipan, /api/interpret) |
| 41 | `cloudrun/bazi-engine/paipan.py` | 八字排盘核心引擎 |
| 42 | `cloudrun/bazi-engine/requirements.txt` | Python 依赖 |
| 43 | `cloudrun/bazi-engine/utils.py` | 天干地支/十神/五行工具库 |
| 44 | `cloudrun/bazi-engine/prompt_templates/basic.yaml` | MVP解读 Prompt 模板 |

### 历史备份

| # | 文件路径 | 说明 |
|---|----------|------|
| 45 | `cloudrun/bazi-engine/main_20260628_020956_571.py` | main.py 备份 |
| 46 | `cloudrun/bazi-engine/main_20260628_024355_787.py` | main.py 备份 |
| 47 | `cloudrun/bazi-engine/paipan_20260628_024355_167.py` | paipan.py 备份 |
| 48 | `cloudrun/bazi-engine/utils_20260628_024355_576.py` | utils.py 备份 |
| 49 | `cloudrun/bazi-engine/__pycache__/paipan.cpython-311.pyc` | Python 字节码缓存 |
| 50 | `cloudrun/bazi-engine/__pycache__/utils.cpython-311.pyc` | Python 字节码缓存 |

### 测试

| # | 文件路径 | 说明 |
|---|----------|------|
| 51 | `cloudrun/bazi-engine/tests/test_paipan.py` | 排盘边界测试（35用例） |
| 52 | `cloudrun/bazi-engine/tests/test_result.md` | 测试结果报告 |

## output/（设计文档）

| # | 文件路径 | 说明 |
|---|----------|------|
| 53 | `output/xuanji-design-doc.md` | 产品设计文档 |
| 54 | `output/xuanji-implementation-plan.md` | 实施计划 |
| 55 | `output/xuanji-session-prompt.md` | 会话 Prompt 设计 |

## Loop 报告存档

| # | 文件路径 | 说明 |
|---|----------|------|
| 56 | `loop-report_20260628_023129_837.md` | Loop #2 报告 |
| 57 | `loop-report_20260628_060212_738.md` | Loop #3 初版 |
| 58 | `loop-report_20260628_063111_458.md` | Loop #3 v2 |
| 59 | `loop-report_20260628_080347_461.md` | Loop #3 v3 |
| 60 | `loop-report_20260628_090353_940.md` | Loop #3 v4 |

## 临时/系统

| # | 文件路径 | 说明 |
|---|----------|------|
| 61 | `temp/start-brainstorm-server.ps1` | Brainstorm 服务器启动脚本 |

## 统计

- 小程序页面: 4 个 (paipan, result, profile, history)
- 云函数: 3 个 (baziPaipan, subscribe, getUserProfile)
- 云托管服务: 1 个 (bazi-engine)
- Python 模块: 4 个 (main, paipan, utils, llm_client)
- 测试用例: 35 个
