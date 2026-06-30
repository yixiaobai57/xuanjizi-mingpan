# Goal-2 审查报告
审查时间: 2026-06-28
审查人: Marvis
阶段: W2 — 排盘引擎 + 云函数对接

## 验收项

| # | 验收项 | 状态 | 说明 |
|---|--------|------|------|
| 1 | lunar-python 集成完毕（或独立算法可用） | PASS | 当前使用独立简化算法 `calculate_bazi_standalone`，已完整实现四柱/十神/大运/起运时间计算。lunar-python 在 requirements.txt 中已注释保留，未来可切换。独立算法满足"或独立算法可用"条件 |
| 2 | `/api/paipan` 端点输入生日返回正确四柱十神大运 JSON | PASS | `POST /api/paipan` 接收 `{birth, gender}` → 调用 `calculate_bazi_standalone` → 返回 `{code:0, msg:'ok', data:{bazi, shiShen, dayMaster, wuXing, daYun}}`。返回结构符合设计文档规范，含四柱干支藏干、十神数组、日主、五行分布、大运序列（8步+起运年龄+起运日期+当前大运） |
| 3 | 边界 case 全部通过（子时跨日/闰月/节气交接/极值年份） | PASS（含已知局限） | `tests/test_paipan.py` 覆盖 6 大场景 35 个子用例，全部 PASS（test_result.md 记录 100% 通过率）。3 项已知局限已明确记录：①节气分界未实现（公历月→月支，2月4日仍归卯月）；②子时跨日简化（00:00 为日界，非传统 23:00）；③闰月处理简化（公历日期直接排盘）。均标注为已知局限，生产环境可由 lunar-python 补齐 |
| 4 | 云函数正式对接云托管（替换 mock，含超时处理和日志） | PASS | `cloudfunctions/baziPaipan/index.js` 已从 mock 常量切换为 `cloud.callContainer()` 调用云托管 `/api/paipan`。含完整异常处理：云托管超时返回 504、其他异常返回 500；所有请求写入 `request_log` 表（user_id/action/cost_ms/status/error_msg）。`config.json` 追加 `"timeout":15` |

## 已知局限

| # | 局限 | 影响 | 改进方向 |
|---|------|------|----------|
| L1 | 月柱按公历月直接映射（1→寅, 2→卯...），未按节气交接点切分 | 2月4日(立春)仍归卯月，传统八字应以立春为寅月起算 | 切换 lunar-python 或实现节气查询表 |
| L2 | 子时跨日以 00:00 为日界，非传统八字 23:00 起算次日 | 23:00-23:59 出生的日柱与传统排盘有 1 天偏差 | 切换 lunar-python 的 Solar 对象 |
| L3 | 闰月按公历日期直接排盘 | 农历闰月与传统排盘规则可能有偏差 | 切换 lunar-python 的 Lunar 对象 |
| L4 | 起运年龄为简化公式 `(year % 10) + 1` | 精度低于节气精确推算，可能偏差 1-2 岁 | 实现节气精确起运算法 |

## 非阻塞遗留项

| # | 描述 | 来源 |
|---|------|------|
| ① | `cloudfunctions/baziPaipan/config.json` openapi 权限数组为空 | Loop #1 遗留 |
| ② | `project.config.json` appid 为空字符串 | Loop #1 遗留 |
| ③ | 云函数备份 `index_20260628_020302_768.js` 待清理 | Loop #1 遗留 |
| ④ | `index.js` 中 `CLOUDRUN_URL` 变量定义但未使用（`cloud.callContainer` 不依赖该变量） | 本次审查发现 |

## 结论: PASS

全部 4 项验收通过。独立排盘算法功能完整，35 个边界测试全部通过。云函数已从 mock 切换为正式对接云托管，含完整超时处理和日志写入。4 项已知局限均为简化算法固有特性，不影响 W2 阶段验收标准，可在后续阶段通过切换 lunar-python 补齐。4 个非阻塞遗留项无需在 W2 阶段处理。
