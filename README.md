# MKPSE Presets

MKP SupportE 预设数据与资源仓库，同时推送到 [GitHub](https://github.com/MuCoreBenC/MKPSE_presets) 和 [Gitee](https://gitee.com/MuCoreBenC/MKPSE_presets)。

## 目录结构

```
MKPSE_presets/
├── content/                # 热更新内容
│   ├── machine_catalog.json
│   ├── param_registry.json
│   ├── model_copy.json
│   ├── faq.json
│   ├── about.json
│   ├── changelog.json
│   └── layout_schema.json
├── manifests/              # 索引和更新入口
│   ├── index.json
│   └── update-manifest.json
├── presets/                # 预设文件
│   ├── mkp/                # MKP 原生预设（TOML）
│   ├── bbs/                # Bambu Studio 预设
│   │   ├── Process/
│   │   └── Support/
│   └── orca/               # Orca Slicer 预设
│       ├── Process/
│       └── Support/
├── assets/                 # 静态资源
│   ├── machines/
│   ├── models/
│   ├── avatars/
│   ├── FAQ/
│   └── qr/
├── models/                 # 校准 3D 模型
├── templates/              # 校准 G-code 模板
├── build/                  # 安装包下载源
│   ├── 0.0.5/
│   └── 0.0.6/
├── README.md
├── publish.js
└── .gitignore
```

## 版本体系

- **App Version**（`0.0.6`）：安装包版本，由 `release/version.json` 驱动
- **Content Version**（`0.0.6.0`）：内容热更新版本，写入 `index.json`
- **Schema Version**（`2.0.0`）：JSON 结构兼容性版本

## 支持机型

- Bambu Lab: A1, A1 Mini, P1S, P2S, X1
- Creality: SPARKX i7, K1C, K2C, S1C
- Anycubic: Kobra X
- Voron: 2.4

## 许可证

The Unlicense
