# 玄机算命

面向传统玄学用户的微信小程序，提供八字排盘 + AI 白话解读服务。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 微信小程序原生框架 |
| 网关 | 微信云函数 (Node.js) |
| 算法 | 微信云托管 (Python + lunar-python) |
| 数据库 | 微信云数据库 (MongoDB) |
| 支付 | 微信支付 (云开发原生) |
| LLM | 可配置（默认腾讯混元） |

## 目录结构

```
xuanji-miniapp/
├── miniprogram/              # 小程序前端
│   ├── app.js               # 应用入口
│   ├── app.json             # 页面路由与窗口配置
│   ├── app.wxss             # 全局样式
│   ├── project.config.json  # 项目配置
│   ├── sitemap.json         # 搜索规则
│   └── pages/
│       └── paipan/          # 八字排盘页
├── cloudfunctions/          # 云函数
│   └── baziPaipan/          # 排盘云函数
├── cloudrun/                # 云托管（后续搭建）
│   └── bazi-engine/         # Python 排盘引擎
├── CHANGELOG.md
└── README.md
```

## 版本

当前版本：v0.1.0
