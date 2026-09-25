<div align="center">

<img src="docs/image/readme/logo.png" alt="Zeus AI" width="108" />

# Zeus AI

### The Autonomous Desktop Workspace for AI Coding Agents

**Bring projects, autonomous agents, models, plugins, and custom workflows into one persistent, local-first desktop environment.**

Local-first · Model-agnostic · Plugin-powered · Multi-Agent · macOS / Windows / Linux

<br />

[![Release](https://img.shields.io/github/v/release/candraprasetya/zeus?label=release)](https://github.com/candraprasetya/zeus/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/candraprasetya/zeus/total?label=downloads)](https://github.com/candraprasetya/zeus/releases)
[![Stars](https://img.shields.io/github/stars/candraprasetya/zeus?style=flat&label=stars)](https://github.com/candraprasetya/zeus/stargazers)
[![CI](https://github.com/candraprasetya/zeus/actions/workflows/ci.yml/badge.svg)](https://github.com/candraprasetya/zeus/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/candraprasetya/zeus)](LICENSE)

<br />

**[Download](https://github.com/candraprasetya/zeus/releases/latest)** ·
[Build a Plugin](docs/plugin-development.md) ·
[Screenshots](docs/guide/screenshots.md) ·
[简体中文](README.zh-CN.md)

<br />

<img src="docs/image/readme/home.webp" alt="Zeus AI Desktop Interface" width="94%" />

<br />

**Your projects stay local · Your models stay replaceable · Your workspace stays yours**

</div>

> **Current release line: 0.15.x (Active Preview).**

---

## Why Zeus AI?

Terminal agents excel at execution. IDE extensions live inside an editor.

Zeus AI takes the next step:

> **Providing AI coding agents with a persistent, independent, and deeply extensible desktop operating environment of their own.**

<table>
<tr>

<td width="25%" valign="top">

### ⚡ Independent Workspace

No reliance on a specific IDE or terminal emulator.

Projects, sessions, diff reviews, live previews, and agent swarms live in an optimized desktop studio.

</td>

<td width="25%" valign="top">

### 🧩 Plugin-Powered

Extensions go far beyond simple prompt tools.

Add native panels, custom widgets, tools, MCP servers, themes, and background daemons.

</td>

<td width="25%" valign="top">

### 🤖 Multi-Agent Swarms

One agent is rarely enough for complex engineering.

Delegate to Subagents or orchestrate parallel Worker Sessions with supervision and automatic rollbacks.

</td>

<td width="25%" valign="top">

### 🌐 Model Freedom

Cloud providers (Claude, OpenAI, Gemini), local engines (Ollama, LM Studio), or custom gateways.

Switch models seamlessly without rebuilding your workflows.

</td>

</tr>
</table>

<div align="center">

**Not a generic wrapper around a single API. Not another ephemeral terminal script.**

### An autonomous, extensible operating environment for agentic workflows.

</div>

---

## Deep Extensibility & Ecosystem

Zeus AI keeps its core fast, native, and secure (backed by Rust host-core and SQLite), while empowering you to assemble your ultimate workflow through extensions.

<table>
<tr>

<td width="33%" valign="top">

### Agent Capabilities

Extend what the model can execute

- **Agent Tools**: Native tools callable during reasoning
- **Skills**: Domain-specific workflows & instructions
- **MCP Servers**: Model Context Protocol integrations
- **Autonomous Subagents**: Specialized background workers

</td>

<td width="33%" valign="top">

### Desktop Experience

Extend the desktop environment

- **Command Palette**: Global action orchestration
- **Work Panels**: Sidecar code viewers & test runners
- **Floating Widgets**: Status overlays, timers, voice orbs
- **Theming**: Tailored dark and light palettes

</td>

<td width="33%" valign="top">

### System Platform

Extend the runtime backbone

- **Resident Daemons**: Scheduled background tasks
- **Plugin Message Bus**: Inter-plugin communication
- **Secure Vault**: Encrypted credential storage
- **Cross-process IPC**: Type-safe asynchronous events

</td>

</tr>
</table>

```text
Voice Engineering Agent
├── Floating Orb Widget
├── Whisper Speech Service
├── Agent Tool (Audio Input)
└── Command Registry

GitHub Release Assistant
├── Work Panel Dashboard
├── GitHub MCP Server
├── Issue & PR Review Tools
└── Background Polling Daemon
```

### Supported Plugin Capabilities

| Capability | Purpose |
| --- | --- |
| **Command** | Register actions into the universal Command Palette |
| **Panel** | Launch dedicated standalone UI views |
| **Floating Widget** | Render always-on-top interactive widgets |
| **Work Panel View** | Expand the right-hand companion workspace |
| **Agent Tool** | Expose host or API tools for LLM tool-calling |
| **Skill** | Bundle system prompts, workflows, and task recipes |
| **MCP Server** | Connect standardized external MCP endpoints |
| **Background Service** | Execute persistent asynchronous monitoring tasks |
| **Message Bus** | Coordinate events across multiple active plugins |

<div align="center">

### [Explore Plugin Development Guide →](docs/plugin-development.md)

</div>

---

## Unified Architecture

```text
                           Zeus AI Desktop
                                  │
               ┌──────────────────┼──────────────────┐
               │                  │                  │
         Agent Layer       Workspace Layer     Host Platform
               │                  │                  │
          Agent Tools           Panels           Rust Host-Core
            Skills              Widgets           Local SQLite
          Subagents             Views             Encrypted Vault
        MCP Integrations        Themes            Process Sandbox
               │                  │                  │
               └──────────────────┼──────────────────┘
                                  │
                         Your Work, Accelerated
```

---

## Three Modes of Execution

<table>
<tr>

<td width="33%" valign="top">

### 1. Agent Mode

**Provide the objective, inspect the result.**

The agent searches your codebase, plans modifications, edits files surgical-style, runs tests, and diagnoses failures autonomously.

</td>

<td width="33%" valign="top">

### 2. Plan Mode

**Review before execution.**

The agent investigates the codebase, identifies constraints, and generates an actionable implementation plan for your approval before writing any code.

</td>

<td width="33%" valign="top">

### 3. Subagent Swarms

**Parallelize complex engineering.**

Spawn background workers (codebase researchers, a11y reviewers, test generators) while you continue interacting in the main session.

</td>

</tr>
</table>

---

## Getting Started

### Quick Install

Download the latest prebuilt package for your operating system:

<div align="center">

### [Download Zeus AI Latest Release →](https://github.com/candraprasetya/zeus/releases/latest)

**macOS (Apple Silicon & Intel) · Windows (Installer & Portable) · Linux (AppImage, deb, rpm)**

</div>

| Platform | Architecture | Distribution |
| --- | --- | --- |
| **macOS** | Apple Silicon (`arm64`) / Intel (`x64`) | `.dmg` installer, `.zip` |
| **Windows** | 64-bit (`x64`) | Setup executable, Portable `.zip` |
| **Linux** | 64-bit (`x64`, glibc 2.35+) | `.AppImage`, `.deb`, `.rpm` |

---

## Developer Setup

Zeus AI is built as a high-performance monorepo: TypeScript/React frontend in Electron, backed by a native Rust `host-core` daemon.

### Prerequisites

- **Node.js** `>=22.19.0`
- **pnpm** `>=10`
- **Rust & Cargo** (Stable)

### Build & Run from Source

```bash
# 1. Clone repository
git clone https://github.com/candraprasetya/zeus.git
cd zeus

# 2. Install workspace dependencies
pnpm install

# 3. Build native host-core & JavaScript packages
cargo build -p host-core
pnpm build:js

# 4. Launch in development mode
pnpm dev
```

### Running Validation & Tests

```bash
# Typecheck across monorepo
pnpm typecheck

# Lint with Biome
pnpm lint

# Run unit tests
pnpm test
```

---

## Community & Feedback

- **Report Bugs & Suggest Features**: [GitHub Issues](https://github.com/candraprasetya/zeus/issues)
- **Security Inquiries**: See [SECURITY.md](SECURITY.md)

---

## License

Zeus AI is licensed under the **GNU Lesser General Public License v3.0 (LGPL-3.0-or-later)**.
See [LICENSE](LICENSE) for complete terms.

<div align="center">

<img src="docs/image/readme/logo.png" alt="Zeus AI" width="72" />

## Zeus AI

### Build your autonomous agent studio.

**Your code · Your models · Your agents · Your workspace**

<br />

**[Download](https://github.com/candraprasetya/zeus/releases/latest)** ·
[Build a Plugin](docs/plugin-development.md)

<sub>Local-first · Model-agnostic · Plugin-powered</sub>

</div>
