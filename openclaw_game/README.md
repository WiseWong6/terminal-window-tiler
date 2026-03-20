# OpenClaw Game

OpenClaw Game 是一个用于可视化 OpenClaw agent / sub-agent 运行状态的单页应用。

现在支持两种启动方式：
- Demo 模式：仓库自带样例数据，启动后立刻能看到主 Agent、常驻 Agent 和临时 sub-agent run。
- Live 模式：读取本机 OpenClaw 数据目录，展示真实 session、事件流和 dispatch/sub-agent 生命周期。

## Quick Start

```bash
cd openclaw_game
npm install
npm start
```

打开 `http://127.0.0.1:3101`。

默认是 `auto` 模式：
- 如果检测到有效的 `~/.openclaw/openclaw.json`，自动进入 live 模式。
- 否则自动回退到 demo 模式。

## Run Modes

### 1. Demo

```bash
npm run start:demo
```

适合第一次体验项目，不依赖本地 OpenClaw。

### 2. Live

```bash
OPENCLAWD_OPENCLAW_HOME="$HOME/.openclaw" npm run start:live
```

如果你的 OpenClaw 数据目录不在默认位置，可以显式指定：

```bash
OPENCLAWD_DATA_MODE=live OPENCLAWD_OPENCLAW_HOME="/path/to/.openclaw" npm start
```

## Environment Variables

- `OPENCLAWD_DATA_MODE=auto|demo|live`
- `OPENCLAWD_OPENCLAW_HOME=/path/to/.openclaw`
- `OPENCLAWD_ADMIN_TOKEN=...`
- `OPENCLAWD_READONLY_TOKEN=...`
- `PORT=3101`

## What Changed

- 前端不再写死 6 个工位，而是按数据动态渲染常驻 Agent 与临时 sub-agent。
- 后端新增 bootstrap API、demo/live 双模式和 sub-agent run 归一化。
- Session 归一化支持 `agent:<agentId>:subagent:<uuid>` 这类官方 sub-agent session key。
- 现在作为 `wise-labs` 仓库中的 `openclaw_game/` 子项目维护，进入子目录即可独立启动。

## Notes

- Demo 模式下 SSE 会回放一段 sub-agent 生命周期，用来验证动态舞台和事件流。
- Live 模式下如果没有读到 OpenClaw 配置或 session 文件，页面会自动退回 demo。
