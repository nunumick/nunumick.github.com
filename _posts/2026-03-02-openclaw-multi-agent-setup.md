---
layout: post
title: "OpenClaw 多 Agent 配置完整教程"
date: 2026-03-02 19:40:00 +0800
categories: AI
tags: [OpenClaw, multi-agent, multi-gateway, architecture, high-availability]
description: "详细讲解 OpenClaw 多 Agent 配置与多 Gateway 架构设计，实现 AI 助手协同工作与高可用部署"
---

# OpenClaw 多 Agent 与多 Gateway 架构完整指南

> 📌 **架构演进行**：单 Gateway 单 Agent → 单 Gateway 多 Agent → 多 Gateway 多 Agent

> 📌 **适用场景**：需要多个 AI 助手协同工作、不同场景使用不同 Agent、团队协作等



---

## 一、前言

### 为什么需要多 Agent？

在实际使用中，单一 Agent 可能无法满足所有需求：

- **场景隔离**：工作 Agent 和生活 Agent 需要不同的知识库和行为模式
- **专业分工**：代码开发、内容创作、数据分析等不同任务需要不同特化的 Agent
- **团队协作**：多个 Agent 可以协同完成复杂任务，如一个负责调研、一个负责写作
- **权限分离**：不同 Agent 可以配置不同的工具权限和数据访问范围
- **测试对比**：同时运行多个 Agent 对比不同配置或模型的效果

### 应用场景示例

| 场景 | Agent 1 | Agent 2 | Agent 3 |
|------|---------|---------|---------|
| **内容工作室** | 选题策划 | 文章写作 | 审核编辑 |
| **开发团队** | 需求分析 | 代码实现 | 测试验证 |
| **个人助理** | 日程管理 | 邮件处理 | 研究助手 |
| **客服系统** | 问题分类 | 技术支持 | 投诉处理 |

---

<!--more-->

## 二、准备工作

### OpenClaw 版本要求

确保你的 OpenClaw 版本支持多 Agent 功能：

```bash
# 检查当前版本
openclaw --version

# 如需更新到最新版本
openclaw update
```

**最低版本要求**：v2.0.0+（支持 `agents.list` 配置）

### 申请 Telegram Bot Token

每个 Agent 需要独立的 Telegram Bot：

1. 打开 Telegram，搜索 `@BotFather`
2. 发送 `/newbot` 命令
3. 按提示设置 Bot 名称和用户名
4. 获取 Token（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

**重复以上步骤**，为每个 Agent 创建一个 Bot。

> ⚠️ **重要**：妥善保管 Token，不要泄露到公开仓库

---

## 三、配置步骤

### 1. 备份配置文件

在修改配置前，务必备份原始文件：

```bash
# 进入配置目录
cd ~/.openclaw

# 备份主配置文件
cp openclaw.json openclaw.json.backup.$(date +%Y%m%d)

# 备份 workspace 配置
cp -r workspace workspace.backup.$(date +%Y%m%d)
```

### 2. 创建独立 Workspace

为每个 Agent 创建独立的工作目录：

```bash
# 创建 Agent 工作目录
mkdir -p ~/.openclaw/workspace-agent1
mkdir -p ~/.openclaw/workspace-agent2
mkdir -p ~/.openclaw/workspace-agent3

# 复制基础配置文件
cp -r ~/.openclaw/workspace/* ~/.openclaw/workspace-agent1/
cp -r ~/.openclaw/workspace/* ~/.openclaw/workspace-agent2/
cp -r ~/.openclaw/workspace/* ~/.openclaw/workspace-agent3/
```

**目录结构示例**：

```
~/.openclaw/
├── openclaw.json              # 主配置文件
├── workspace/                 # 主 Agent 工作目录
│   ├── SOUL.md
│   ├── USER.md
│   └── IDENTITY.md
├── workspace-agent1/          # Agent 1 工作目录
│   ├── SOUL.md
│   ├── USER.md
│   └── IDENTITY.md
├── workspace-agent2/          # Agent 2 工作目录
└── workspace-agent3/          # Agent 3 工作目录
```

### 3. 修改 openclaw.json

编辑主配置文件 `~/.openclaw/openclaw.json`：

```bash
# 使用编辑器打开
nano ~/.openclaw/openclaw.json
# 或
code ~/.openclaw/openclaw.json
```

#### agents.list 配置

在配置文件中添加 `agents.list` 字段：

```json
{
  "agents": {
    "list": [
      {
        "id": "agent-main",
        "name": "主助手",
        "workspace": "~/.openclaw/workspace",
        "model": "bailian/qwen3.5-plus",
        "enabled": true
      },
      {
        "id": "agent-dev",
        "name": "开发助手",
        "workspace": "~/.openclaw/workspace-agent1",
        "model": "bailian/qwen3.5-plus",
        "enabled": true
      },
      {
        "id": "agent-writer",
        "name": "写作助手",
        "workspace": "~/.openclaw/workspace-agent2",
        "model": "bailian/qwen3.5-plus",
        "enabled": true
      }
    ]
  }
}
```

**字段说明**：

| 字段 | 说明 | 必填 |
|------|------|------|
| `id` | Agent 唯一标识符 | ✅ |
| `name` | Agent 显示名称 | ✅ |
| `workspace` | 工作目录路径（绝对或~开头） | ✅ |
| `model` | 使用的 AI 模型 | ✅ |
| `enabled` | 是否启用 | ✅ |

#### bindings 路由规则

配置消息路由规则，决定哪个 Bot 消息由哪个 Agent 处理：

```json
{
  "bindings": [
    {
      "channel": "telegram",
      "accountId": "bot-token-1",
      "agentId": "agent-main",
      "priority": 1
    },
    {
      "channel": "telegram",
      "accountId": "bot-token-2",
      "agentId": "agent-dev",
      "priority": 1
    },
    {
      "channel": "telegram",
      "accountId": "bot-token-3",
      "agentId": "agent-writer",
      "priority": 1
    }
  ]
}
```

**路由规则说明**：

- `accountId`：对应 `channels.telegram.accounts` 中的 Bot ID
- `agentId`：对应 `agents.list` 中的 Agent ID
- `priority`：优先级（数字越小优先级越高）

#### channels.telegram.accounts 多 Bot 配置

配置多个 Telegram Bot：

```json
{
  "channels": {
    "telegram": {
      "accounts": [
        {
          "id": "bot-token-1",
          "token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz1",
          "name": "主助手 Bot",
          "enabled": true
        },
        {
          "id": "bot-token-2",
          "token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz2",
          "name": "开发助手 Bot",
          "enabled": true
        },
        {
          "id": "bot-token-3",
          "token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz3",
          "name": "写作助手 Bot",
          "enabled": true
        }
      ]
    }
  }
}
```

#### 完整配置示例

```json
{
  "version": "2.0",
  "agents": {
    "list": [
      {
        "id": "agent-main",
        "name": "主助手",
        "workspace": "~/.openclaw/workspace",
        "model": "bailian/qwen3.5-plus",
        "enabled": true
      },
      {
        "id": "agent-dev",
        "name": "开发助手",
        "workspace": "~/.openclaw/workspace-agent1",
        "model": "bailian/qwen3.5-plus",
        "enabled": true
      }
    ]
  },
  "bindings": [
    {
      "channel": "telegram",
      "accountId": "bot-main",
      "agentId": "agent-main",
      "priority": 1
    },
    {
      "channel": "telegram",
      "accountId": "bot-dev",
      "agentId": "agent-dev",
      "priority": 1
    }
  ],
  "channels": {
    "telegram": {
      "accounts": [
        {
          "id": "bot-main",
          "token": "YOUR_BOT_TOKEN_1",
          "name": "主助手",
          "enabled": true
        },
        {
          "id": "bot-dev",
          "token": "YOUR_BOT_TOKEN_2",
          "name": "开发助手",
          "enabled": true
        }
      ]
    }
  },
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["agent-main", "agent-dev"]
    }
  }
}
```

### 4. 复制基础文件

为每个 Agent 定制身份文件：

```bash
# Agent 1 - 开发助手
cat > ~/.openclaw/workspace-agent1/IDENTITY.md << 'EOF'
# IDENTITY.md - Who Am I?

- **Name:** 代码专家
- **Creature:** AI 编程助手
- **Vibe:** 严谨、专业、注重最佳实践
- **Emoji:** 💻

---

_专注于代码开发、架构设计、代码审查。_
EOF

# Agent 2 - 写作助手
cat > ~/.openclaw/workspace-agent2/IDENTITY.md << 'EOF'
# IDENTITY.md - Who Am I?

- **Name:** 文案大师
- **Creature:** AI 写作助手
- **Vibe:** 创意、流畅、善于表达
- **Emoji:** ✍️

---

_专注于文章写作、内容创作、文案优化。_
EOF
```

**建议定制的文件**：

- `IDENTITY.md` - Agent 身份定义
- `SOUL.md` - 行为风格和原则
- `TOOLS.md` - 特定工具配置
- `memory/` - 独立记忆目录

### 5. 重启 Gateway

配置完成后重启 OpenClaw Gateway：

```bash
# 停止 Gateway
openclaw gateway stop

# 等待 3 秒
sleep 3

# 启动 Gateway
openclaw gateway start

# 查看状态
openclaw gateway status
```

**验证启动**：

```bash
# 查看日志
openclaw gateway logs --tail 50

# 或实时查看
openclaw gateway logs --follow
```

### 6. Telegram 配对

在 Telegram 中与每个 Bot 进行配对：

1. 打开 Telegram，找到第一个 Bot
2. 发送 `/start` 命令
3. 按提示完成配对流程
4. 重复以上步骤，配对所有 Bot

**配对验证**：

```bash
# 查看已配对的 Bot
openclaw telegram list
```

---

## 四、Agent 间通信配置

### tools.agentToAgent 启用

在 `openclaw.json` 中启用 Agent 间通信：

```json
{
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["agent-main", "agent-dev", "agent-writer"],
      "deny": [],
      "maxDepth": 3
    }
  }
}
```

**字段说明**：

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `enabled` | 是否启用 Agent 间通信 | `false` |
| `allow` | 允许通信的 Agent ID 列表 | `[]` |
| `deny` | 禁止通信的 Agent ID 列表 | `[]` |
| `maxDepth` | 最大调用深度（防止循环） | `3` |

### allow 列表配置

**场景 1：全互通**

```json
{
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["agent-main", "agent-dev", "agent-writer"]
    }
  }
}
```

**场景 2：主从架构**

只有主 Agent 可以调用其他 Agent：

```json
{
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["agent-main"],
      "deny": ["agent-dev", "agent-writer"]
    }
  }
}
```

**场景 3：隔离模式**

Agent 之间完全隔离：

```json
{
  "tools": {
    "agentToAgent": {
      "enabled": false
    }
  }
}
```

### Agent 间调用示例

在 Agent 的提示词或工具配置中，可以使用 `agentToAgent` 工具：

```json
{
  "name": "agentToAgent",
  "description": "调用其他 Agent 完成任务",
  "parameters": {
    "targetAgent": "agent-dev",
    "task": "审查这段代码的安全性",
    "context": "用户提交了一个新的 API 端点"
  }
}
```

---

## 五、测试验证

### 私聊测试

分别与每个 Bot 私聊，验证路由是否正确：

**测试步骤**：

1. 在 Telegram 中打开"主助手 Bot"
2. 发送：`你好，介绍一下你自己`
3. 应该收到"主助手"的回复
4. 打开"开发助手 Bot"
5. 发送：`你好，介绍一下你自己`
6. 应该收到"开发助手"的回复

**预期结果**：

- 不同 Bot 回复风格符合各自 `IDENTITY.md` 定义
- 回复内容体现各自的专业领域
- 无交叉响应（Bot A 不响应 Bot B 的消息）

### 群组消息测试

将多个 Bot 加入同一个群组：

```bash
# 在群组中@不同 Bot
@主助手 Bot 今天天气如何？
@开发助手 Bot 帮我看看这段代码
@写作助手 Bot 帮我润色这段文字
```

**验证要点**：

- 只有被@的 Bot 响应
- 未被@的 Bot 保持沉默
- 多个 Bot 可以协同回答复杂问题

### Agent 协同任务

测试 Agent 间通信和协作：

**示例任务**：开发一个功能

1. **主助手**接收需求：`帮我开发一个用户登录功能`
2. **主助手**调用**开发助手**：`设计登录功能的代码架构`
3. **开发助手**返回设计方案
4. **主助手**调用**写作助手**：`编写功能文档`
5. **写作助手**返回文档
6. **主助手**整合回复用户

**验证日志**：

```bash
# 查看 Agent 间调用日志
openclaw gateway logs --grep "agentToAgent" --tail 100
```

---

## 六、常见问题

### 配置语法错误

**问题**：Gateway 启动失败，提示 JSON 解析错误

**排查步骤**：

```bash
# 验证 JSON 语法
cat ~/.openclaw/openclaw.json | jq .

# 如有错误，jq 会提示具体行号
```

**常见错误**：

```json
// ❌ 错误：缺少逗号
{
  "id": "agent-1"
  "name": "助手 1"
}

// ✅ 正确
{
  "id": "agent-1",
  "name": "助手 1"
}
```

**解决方法**：

1. 使用 `jq` 或在线 JSON 验证工具
2. 检查逗号、引号、括号是否匹配
3. 确保没有尾随逗号（最后一个字段后不能有逗号）

### Bot 无法响应

**问题**：Bot 在线但不回复消息

**排查清单**：

```bash
# 1. 检查 Gateway 状态
openclaw gateway status

# 2. 检查 Bot Token 是否正确
grep -A 2 "token" ~/.openclaw/openclaw.json

# 3. 检查 bindings 配置
grep -A 5 "bindings" ~/.openclaw/openclaw.json

# 4. 查看实时日志
openclaw gateway logs --follow
```

**常见原因**：

| 原因 | 症状 | 解决方法 |
|------|------|----------|
| Token 错误 | 无法连接 Telegram | 重新获取 Token |
| bindings 缺失 | Bot 在线但无响应 | 添加 bindings 配置 |
| agentId 不匹配 | 路由失败 | 检查 agents.list 和 bindings |
| enabled: false | Bot 被禁用 | 设置为 true |

### Workspace 权限问题

**问题**：Agent 无法读取工作目录文件

**排查命令**：

```bash
# 检查目录权限
ls -la ~/.openclaw/workspace-agent1/

# 修复权限（macOS/Linux）
chmod -R 755 ~/.openclaw/workspace-agent1/
chown -R $(whoami) ~/.openclaw/workspace-agent1/

# 检查文件是否存在
test -f ~/.openclaw/workspace-agent1/SOUL.md && echo "存在" || echo "不存在"
```

**常见错误**：

```bash
# ❌ 错误：路径使用了相对路径
"workspace": "workspace-agent1"

# ✅ 正确：使用绝对路径或~开头
"workspace": "~/.openclaw/workspace-agent1"
"workspace": "/Users/username/.openclaw/workspace-agent1"
```

### 其他问题

#### 问题：Agent 间通信失败

**检查**：

```json
// 确保 tools.agentToAgent 已启用
{
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["agent-main", "agent-dev"]
    }
  }
}
```

#### 问题：内存占用过高

**解决**：

```bash
# 限制 Agent 数量
# 在 openclaw.json 中只启用必要的 Agent

# 定期重启 Gateway
openclaw gateway restart

# 监控资源使用
ps aux | grep openclaw
```

#### 问题：配置更新不生效

**解决**：

```bash
# 1. 完全停止 Gateway
openclaw gateway stop

# 2. 等待进程完全退出
sleep 5
ps aux | grep openclaw

# 3. 重新启动
openclaw gateway start

# 4. 验证配置
openclaw gateway status
```

---


---

## 七、架构演进：从单 Gateway 到多 Gateway

上面介绍的是**单 Gateway 多 Agent**的部署方式。在生产环境中，我们推荐**多 Gateway 多 Agent**架构。

### 7.1 架构演进路线

```
单 Gateway 单 Agent → 单 Gateway 多 Agent → 多 Gateway 多 Agent
```

### 7.2 单 Gateway 单 Agent 的局限性

| 问题 | 说明 | 影响 |
|------|------|------|
| **单点故障** | Gateway 进程崩溃 | ❌ 所有服务中断 |
| **无法运维** | 配置改错了 | ❌ 没人能修复 |
| **资源竞争** | 所有任务挤在一个进程 | ❌ 性能下降 |
| **场景单一** | 只有一个 Agent | ❌ 无法专业分工 |

### 7.3 单 Gateway 多 Agent 的优势与局限

**优势**（本章重点）：
- ✅ 专业分工：不同 Agent 负责不同场景
- ✅ 场景隔离：工作 Agent 和生活 Agent 知识库分离
- ✅ Agent-to-Agent 通信：同一 Gateway 内可直接通信
- ✅ 资源共享：共享配置、模型、工具

**局限**：
- ❌ 仍然单点故障：Gateway 挂了，所有 Agent 瘫痪
- ❌ 无法相互运维：配置错误时无法自我修复
- ❌ 资源竞争：多个 Agent 共享 CPU/内存

### 7.4 多 Gateway 多 Agent 架构设计

我们的实际部署：

| Gateway | 位置 | 部署方式 | Agent | 职责 |
|---------|------|----------|-------|------|
| Gateway 1 | MacBook | 本地运行 | main, superpd, superdev | 外出查资料、写文档、浏览器 |
| Gateway 2 | 群晖 NAS | Docker 容器 | xiaoe | NAS 运维、媒体库、本地服务 |

**网络拓扑**：

```
┌─────────────────────────────────────┐
│         Telegram 服务器              │
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
┌───────────────┐  ┌───────────────┐
│ MacBook       │  │ 群晖 NAS      │
│ Gateway 1     │  │ Gateway 2     │
│ (192.168.51.226)│  │ (192.168.51.61)│
│               │  │               │
│ - main ⚔️    │  │ - xiaoe 📦   │
│ - superpd 🔍 │  │               │
│ - superdev 💻│  │               │
└───────────────┘  └───────────────┘
        │               │
        └───────┬───────┘
                │
        ┌───────┴───────┐
        │   Telegram    │
        │   群组        │
        │ -5125543633   │
        └───────────────┘
```

**设计考虑**：

| 考虑 | 说明 |
|------|------|
| **互备容灾** | 一个 Gateway 挂了，其他继续运行 |
| **相互运维** | Gateway 1 可以 SSH 修复 Gateway 2 |
| **资源隔离** | 每个 Gateway 独立 CPU/内存/网络 |
| **地理分散** | 本地 + 云端，避免单点故障 |

### 7.5 Telegram Bot API 限制与通信机制

#### 7.5.1 Telegram Bot API 限制

**关键限制**：
- ❌ Bot 无法读取其他 Bot 的消息
- ❌ Bot 无法识别其他 Bot 的身份
- ✅ Bot 可以读取用户消息
- ✅ Bot 可以读取被@的消息

**影响**：
- Gateway 1 的 Bot 无法直接发消息给 Gateway 2 的 Bot
- 两个 Gateway 的 Agent 无法通过 Telegram 直接通信

#### 7.5.2 单 Gateway 内的 Agent-to-Agent 通信

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

#### 7.5.3 跨 Gateway 通信方案

**方案 A：Telegram 群组中转**（我们采用）

```
Gateway 1 Agent → Telegram 群组 → Gateway 2 Agent
```

实现：
- 所有 Gateway 的 Bot 加入同一个 Telegram 群组
- Agent 发消息到群组（@目标 Agent 的 Bot）
- 目标 Gateway 收到消息，路由到对应 Agent

优点：
- ✅ 实现简单
- ✅ 无需额外基础设施
- ✅ 有聊天记录可追溯

缺点：
- ❌ 依赖 Telegram 服务
- ❌ 消息公开（群组内可见）
- ❌ 延迟较高

**方案 B：共享消息队列**

```
Gateway 1 Agent → Redis/RabbitMQ → Gateway 2 Agent
```

**方案 C：HTTP API 直连**

```
Gateway 1 Agent → HTTP POST → Gateway 2 Gateway API → Agent
```

### 7.6 实际协作案例

#### 案例 1：单 Gateway 内协作（MacBook）

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
- 这是**单 Gateway 内协作**（都在 MacBook）
- 使用 `sessions_spawn` 和 `subagents` 机制
- 低延迟、高效率

#### 案例 2：跨 Gateway 运维

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

### 7.7 配置对比

#### MacBook Gateway 配置

```json
{
  "agents": {
    "list": [
      {"id": "main", "workspace": "~/.openclaw/workspace"},
      {"id": "superpd", "workspace": "~/.openclaw/workspace-superpd"},
      {"id": "superdev", "workspace": "~/.openclaw/workspace-superdev"}
    ]
  },
  "channels": {
    "telegram": {
      "accounts": {
        "default": {"botToken": "8750103987:AAH..."},
        "superpd": {"botToken": "8765391556:AAF..."},
        "superdev": {"botToken": "8690882791:AAH..."}
      }
    }
  }
}
```

#### NAS Gateway 配置

```json
{
  "agents": {
    "list": [
      {"id": "xiaoe", "workspace": "~/.openclaw/workspace"}
    ]
  },
  "channels": {
    "telegram": {
      "accounts": {
        "default": {"botToken": "8319784903:AAH..."}
      }
    }
  }
}
```

### 7.8 架构对比总结

| 架构 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **单 Gateway 单 Agent** | 简单 | 单点故障、无法分工 | 个人测试 |
| **单 Gateway 多 Agent** | 分工协作、Agent 通信 | 仍单点故障 | 小团队、单机部署 |
| **多 Gateway 多 Agent** | 容灾、互维、隔离 | 配置复杂、通信受限 | 生产环境、高可用 |

### 7.9 最佳实践

1. **渐进式演进**：从简单到复杂，按需扩展
2. **互备容灾**：不依赖单点，故障可恢复
3. **相互运维**：每个 Gateway 能维护其他 Gateway
4. **简单优先**：能用简单方案就不用复杂方案

---

## 总结

配置 OpenClaw 多 Agent 系统的关键步骤：

1. ✅ **准备**：确保版本支持，申请多个 Bot Token
2. ✅ **隔离**：为每个 Agent 创建独立 Workspace
3. ✅ **配置**：编辑 `openclaw.json` 的 `agents.list`、`bindings`、`accounts`
4. ✅ **定制**：为每个 Agent 定制身份文件
5. ✅ **通信**：配置 `agentToAgent` 工具（可选）
6. ✅ **验证**：测试私聊、群聊、协同任务

**最佳实践**：

- 📝 每次修改配置前务必备份
- 🔐 Token 不要提交到版本控制
- 🧪 先测试单个 Agent，再扩展到多个
- 📊 定期查看日志监控运行状态
- 🔄 保持配置文件简洁，避免过度复杂

---

**参考资料**：

- [Telegram Bot API 官方文档](https://core.telegram.org/bots/api)
- [OpenClaw 官方文档](https://docs.openclaw.ai)

**有问题？** 在评论区留言或加入 OpenClaw 社区讨论！
