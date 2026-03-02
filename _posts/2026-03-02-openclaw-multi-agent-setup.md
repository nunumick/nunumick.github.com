---
layout: post
title: "OpenClaw 多 Agent 配置完整教程"
date: 2026-03-02 19:40:00 +0800
categories: AI
tags: [OpenClaw, multi-agent, Telegram, tutorial]
description: "详细讲解如何配置 OpenClaw 多 Agent 系统，实现多个 AI 助手协同工作"
---

# OpenClaw 多 Agent 配置完整教程

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
