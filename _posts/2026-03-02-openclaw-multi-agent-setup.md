---
layout: post
title: "OpenClaw 多 Agent 与多 Gateway 架构设计实践"
date: 2026-03-02 19:40:00 +0800
categories: AI
tags: [OpenClaw, multi-agent, multi-gateway, architecture, high-availability]
description: "详细讲解 OpenClaw 多 Agent 配置与多 Gateway 架构设计，实现 AI 助手协同工作与高可用部署"
---
# OpenClaw 多 Agent 与多 Gateway 架构设计实践

> 📌 **架构演进行**：单 Gateway 单 Agent → 单 Gateway 多 Agent → 多 Gateway 多 Agent

---

## 一、设计思路：为什么需要多 Agent 和多 Gateway？

### 1.1 架构演进的三个阶段

```
阶段 1: 单 Gateway 单 Agent
         ↓  （需求：专业分工）
阶段 2: 单 Gateway 多 Agent
         ↓  （需求：互备容灾）
阶段 3: 多 Gateway 多 Agent
```

每个阶段的演进都是为了解决前一阶段的**核心局限性**。

<!--more-->

### 1.2 阶段 1：单 Gateway 单 Agent 的局限性

**场景**：只有一个 OpenClaw 实例，运行一个 Agent。

| 问题 | 具体表现 | 影响 |
|------|----------|------|
| **单点故障** | Gateway 进程崩溃 | ❌ 所有服务中断 |
| **无法运维** | 配置改错了 | ❌ 没人能修复 |
| **资源竞争** | 查资料 + 写代码 + 运维全挤在一起 | ❌ 性能下降 |
| **场景单一** | 工作生活混在一起 | ❌ 知识库污染 |
| **无专业分工** | 什么都干，什么都不精 | ❌ 效率低下 |

**结论**：适合个人测试，不适合生产环境。

### 1.3 阶段 2：单 Gateway 多 Agent 的优势与局限

**方案**：一个 Gateway 内运行多个 Agent，每个 Agent 有独立 Workspace。

**优势**：
- ✅ **专业分工**：代码 Agent 专注开发，产品 Agent 专注文档
- ✅ **场景隔离**：工作 Agent 和生活 Agent 知识库分离
- ✅ **Agent-to-Agent 通信**：同一 Gateway 内可直接通信（低延迟）
- ✅ **资源共享**：共享配置、模型、工具

**局限性**：
- ❌ **仍然单点故障**：Gateway 挂了，所有 Agent 一起瘫痪
- ❌ **无法相互运维**：配置错误时，Agent 们一起被困住
- ❌ **资源竞争**：多个 Agent 共享 CPU/内存

**结论**：适合小团队、单机部署，但仍有风险。

### 1.4 阶段 3：多 Gateway 多 Agent 架构

**方案**：多个 Gateway 实例，每个 Gateway 运行不同的 Agent。

**我们的实际部署**：

| Gateway | 位置 | 部署方式 | Agent | 职责 |
|---------|------|----------|-------|------|
| Gateway 1 | MacBook | 本地运行 | main, superpd, superdev | 查资料、写文档、代码 |
| Gateway 2 | 群晖 NAS | Docker 容器 | xiaoe | NAS 运维、媒体库 |

**设计考虑**：

| 考虑 | 说明 | 价值 |
|------|------|------|
| **互备容灾** | 一个 Gateway 挂了，其他继续运行 | ✅ 高可用 |
| **相互运维** | Gateway 1 可以 SSH 修复 Gateway 2 | ✅ 可维护 |
| **资源隔离** | 每个 Gateway 独立 CPU/内存/网络 | ✅ 性能稳定 |
| **地理分散** | 本地 + 云端，避免单点故障 | ✅ 容灾能力强 |

**结论**：适合生产环境，高可用、可维护。

---

## 二、通信机制：Agent 之间如何协作？

### 2.1 Telegram Bot API 的限制

**关键限制**：
- ❌ Bot 无法读取其他 Bot 的消息
- ❌ Bot 无法识别其他 Bot 的身份
- ✅ Bot 可以读取用户消息
- ✅ Bot 可以读取被@的消息

**影响**：
- Gateway 1 的 Bot 无法直接发消息给 Gateway 2 的 Bot
- 两个 Gateway 的 Agent 无法通过 Telegram 直接通信

### 2.2 单 Gateway 内的 Agent-to-Agent 通信

**机制**：
```
Agent A → Gateway 内部消息总线 → Agent B
```

**配置**：
```json
{
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["main", "superpd", "superdev"]
    }
  }
}
```

**优点**：
- ✅ 低延迟（同一进程内）
- ✅ 完整上下文传递
- ✅ 支持工具调用

**缺点**：
- ❌ 仅限同一 Gateway 内
- ❌ 跨 Gateway 无法使用

### 2.3 跨 Gateway 通信方案对比

| 方案 | 机制 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| **Telegram 群组中转** | Bot→群组→Bot | 简单、可追溯 | 依赖 Telegram、公开 | 日常协作 |
| **共享消息队列** | Redis/RabbitMQ | 低延迟、私密 | 需额外基础设施 | 生产环境 |
| **HTTP API 直连** | HTTP POST | 直接、可控 | 需暴露 API | 内网部署 |

**我们的选择**：Telegram 群组中转（简单有效）

---

## 三、实践：单 Gateway 多 Agent 配置

> 💡 **说明**：这是多 Gateway 的基础，先掌握单 Gateway 多 Agent 配置。

### 3.1 准备工作

**OpenClaw 版本要求**：v2.0.0+（支持 `agents.list` 配置）

**申请 Telegram Bot Token**：
1. 打开 Telegram，搜索 `@BotFather`
2. 发送 `/newbot` 命令
3. 按提示设置 Bot 名称和用户名
4. 获取 Token

**重复以上步骤**，为每个 Agent 创建一个 Bot。

### 3.2 配置步骤

#### 步骤 1：备份配置文件

```bash
cd ~/.openclaw
cp openclaw.json openclaw.json.backup.$(date +%Y%m%d)
cp -r workspace workspace.backup.$(date +%Y%m%d)
```

#### 步骤 2：创建独立 Workspace

```bash
mkdir -p ~/.openclaw/workspace-superpd
mkdir -p ~/.openclaw/workspace-superdev
```

#### 步骤 3：复制基础文件

```bash
cp ~/.openclaw/workspace/SOUL.md ~/.openclaw/workspace-superpd/
cp ~/.openclaw/workspace/USER.md ~/.openclaw/workspace-superpd/
cp ~/.openclaw/workspace/IDENTITY.md ~/.openclaw/workspace-superpd/
# 重复以上步骤为每个 Agent 复制
```

#### 步骤 4：修改 openclaw.json

**关键配置**：

```json
{
  "agents": {
    "list": [
      {"id": "main", "workspace": "~/.openclaw/workspace"},
      {"id": "superpd", "workspace": "~/.openclaw/workspace-superpd"},
      {"id": "superdev", "workspace": "~/.openclaw/workspace-superdev"}
    ]
  },
  "bindings": [
    {"agentId": "main", "match": {"channel": "telegram", "accountId": "default"}},
    {"agentId": "superpd", "match": {"channel": "telegram", "accountId": "superpd"}},
    {"agentId": "superdev", "match": {"channel": "telegram", "accountId": "superdev"}}
  ],
  "channels": {
    "telegram": {
      "accounts": {
        "default": {
          "botToken": "YOUR_BOT_TOKEN_1:ABCdefGHI...",
          "dmPolicy": "pairing",
          "groupPolicy": "open"
        },
        "superpd": {
          "botToken": "YOUR_BOT_TOKEN_2:ABCdefGHI...",
          "dmPolicy": "pairing",
          "groupPolicy": "open"
        },
        "superdev": {
          "botToken": "YOUR_BOT_TOKEN_3:ABCdefGHI...",
          "dmPolicy": "pairing",
          "groupPolicy": "open"
        }
      }
    }
  },
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["main", "superpd", "superdev"]
    }
  }
}
```

#### 步骤 5：重启 Gateway

```bash
openclaw gateway restart
```

#### 步骤 6：Telegram 配对

```bash
openclaw pairing approve telegram <配对码>
```

---

## 四、实践：多 Gateway 部署

### 4.1 MacBook Gateway 配置

**位置**：`/Users/nunumick/.openclaw/openclaw.json`

**Agent**：main, superpd, superdev

**配置要点**：
- 3 个 Agent，3 个 Bot Token
- 启用 agentToAgent 通信
- 加入群组 `-YOUR_GROUP_ID`

### 4.2 NAS Gateway 配置

**位置**：`/volumeUSB2/usbshare/MediaCenter/apps/openclaw/openclaw.json`

**部署方式**：Docker 容器

**Agent**：xiaoe

**配置要点**：
- 1 个 Agent，1 个 Bot Token
- 加入群组 `-YOUR_GROUP_ID`
- 配置 SSH 访问（用于互维）

### 4.3 运维要点

| 操作 | 命令 | 说明 |
|------|------|------|
| 备份配置 | `cp openclaw.json openclaw.json.bak` | 修改前必须备份 |
| 重启 Gateway | `docker compose restart openclaw-gateway` | NAS 上需 root |
| 查看状态 | `docker compose ps` | 检查容器状态 |
| 查看日志 | `docker compose logs -f openclaw-gateway` | 实时日志 |

---

## 五、协作案例

### 5.1 单 Gateway 内协作（MacBook）

**任务**：写一篇多 Agent 配置教程

**分工**：
1. main ⚔️：规划大纲、统筹协调
2. superpd 🔍：撰写详细内容
3. superdev 💻：Git 提交发布

**流程**：
```
main 启动 subagent → superpd 写作 → 文件保存 → superdev git 提交
```

**说明**：
- 这是**单 Gateway 内协作**
- 使用 `sessions_spawn` 和 `subagents` 机制
- 低延迟、高效率

### 5.2 跨 Gateway 运维

**任务**：NAS 上的 OpenClaw 配置错误

**分工**：
1. MacBook main ⚔️：发现问题，SSH 登录 NAS
2. NAS xiaoe 📦：提供本地信息，验证修复

**流程**：
```
MacBook 发现异常 → SSH 登录 NAS → 修复配置 → 重启 Gateway → 验证正常
```

**说明**：
- 这是**跨 Gateway 协作**
- 使用 SSH + Telegram 群组通信
- 体现互备容灾价值

---

## 六、架构对比总结

| 架构 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **单 Gateway 单 Agent** | 简单 | 单点故障、无法分工 | 个人测试 |
| **单 Gateway 多 Agent** | 分工协作、Agent 通信 | 仍单点故障 | 小团队、单机部署 |
| **多 Gateway 多 Agent** | 容灾、互维、隔离 | 配置复杂、通信受限 | 生产环境、高可用 |

---

## 七、最佳实践

1. **渐进式演进**：从简单到复杂，按需扩展
2. **互备容灾**：不依赖单点，故障可恢复
3. **相互运维**：每个 Gateway 能维护其他 Gateway
4. **简单优先**：能用简单方案就不用复杂方案
5. **配置备份**：修改前务必备份
6. **Token 安全**：不要提交到版本控制
7. **监控告警**：定期检查 Gateway 状态

---

**参考资料**：

- [Telegram Bot API 官方文档](https://core.telegram.org/bots/api)
- [OpenClaw 官方文档](https://docs.openclaw.ai)

**有问题？** 在评论区留言或加入 OpenClaw Discord 社区讨论！
