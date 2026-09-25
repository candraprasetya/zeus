<div align="center">

<img src="docs/image/readme/logo.png" alt="Zeus AI" width="108" />

# Zeus AI

### 面向 AI 编码智能体的模块化桌面工作区

**将项目、自主智能体、模型、插件与自定义工作流汇聚于同一个持久化的本地桌面环境。**

本地优先 · 模型无关 · 插件驱动 · 多智能体协同 · macOS / Windows / Linux

<br />

[![Release](https://img.shields.io/github/v/release/candraprasetya/zeus?label=release)](https://github.com/candraprasetya/zeus/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/candraprasetya/zeus/total?label=downloads)](https://github.com/candraprasetya/zeus/releases)
[![Stars](https://img.shields.io/github/stars/candraprasetya/zeus?style=flat&label=stars)](https://github.com/candraprasetya/zeus/stargazers)
[![CI](https://github.com/candraprasetya/zeus/actions/workflows/ci.yml/badge.svg)](https://github.com/candraprasetya/zeus/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/candraprasetya/zeus)](LICENSE)

<br />

**[立即下载](https://github.com/candraprasetya/zeus/releases/latest)** ·
[开发插件](docs/zh-CN/plugin-development.md) ·
[界面截图](docs/zh-CN/guide/screenshots.md) ·
[English](README.md)

<br />

<img src="docs/image/readme/home.webp" alt="Zeus AI 桌面客户端" width="94%" />

<br />

**项目留在本地 · 模型随时替换 · 工作区完全由你掌控**

</div>

> **当前版本线：0.15.x（预览版）。**

---

## 为什么选择 Zeus AI？

终端里的 Agent 擅长执行；IDE 插件生活在编辑器内部。

Zeus AI 更进一步：

> **为 AI 编码智能体提供一个持久、独立且深度可扩展的专属桌面操作系统环境。**

<table>
<tr>

<td width="25%" valign="top">

### ⚡ 独立工作区

摆脱特定 IDE 或终端模拟器的束缚。

项目、会话、差异审查、实时预览与智能体集群统一管理。

</td>

<td width="25%" valign="top">

### 🧩 强大插件生态

插件远不止是几个工具调用。

扩展面板、悬浮窗、MCP 服务、自定义主题与后台守护进程。

</td>

<td width="25%" valign="top">

### 🤖 多智能体集群

复杂工程单打独斗往往不够。

委派给 Subagents 或并行协调多个 Worker 会话，带完备的执行监督与状态回滚。

</td>

<td width="25%" valign="top">

### 🌐 自由切换模型

支持云端模型（Claude、OpenAI、Gemini）、本地引擎（Ollama、LM Studio）或自定义网关。

随意切换模型，无需推倒工作流重来。

</td>

</tr>
</table>

---

## 快速上手

### 下载安装包

<div align="center">

### [下载 Zeus AI 最新版本 →](https://github.com/candraprasetya/zeus/releases/latest)

**macOS (Apple Silicon & Intel) · Windows · Linux**

</div>

---

## 开发者源码构建

Zeus AI 采用现代化 Monorepo 架构：Electron + TypeScript + React 前端，搭配 Rust `host-core` 原生持久化守护进程。

### 环境要求

- **Node.js** `>=22.19.0`
- **pnpm** `>=10`
- **Rust & Cargo** (Stable)

### 编译与运行

```bash
# 1. 克隆仓库
git clone https://github.com/candraprasetya/zeus.git
cd zeus

# 2. 安装依赖
pnpm install

# 3. 编译 Rust 原生核心与 JS 依赖
cargo build -p host-core
pnpm build:js

# 4. 启动开发模式
pnpm dev
```

---

## 开源协议

Zeus AI 基于 **GNU Lesser General Public License v3.0 (LGPL-3.0-or-later)** 授权。
详见 [LICENSE](LICENSE) 文件。
