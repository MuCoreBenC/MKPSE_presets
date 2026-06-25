# Build Directory

This directory contains installer packages for download.

## Structure

```
build/
├── 0.0.5/
│   ├── windows/
│   │   └── mkp-supporte-0.0.5.exe
│   └── macos/
│       └── mkp-supporte-0.0.5.app
├── 0.0.6/
│   ├── windows/
│   └── macos/
└── latest/  → symlink or copy of latest version
```

## Rules

- Each version gets its own subdirectory
- Inside each version: windows/ and macos/ subdirectories
- Do NOT dump installers directly in build/ root
- `latest/` always mirrors the most recent released version
