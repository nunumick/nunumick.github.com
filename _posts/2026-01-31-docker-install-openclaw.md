---
layout: post
title: "如何在 Docker 中部署 OpenClaw 私人助理"
date: 2026-01-31 07:21:00
categories: [Docker, OpenClaw, 教程]
---

**说明**：这篇文章完全是在糯米纸壳的指导下由 OpenClaw 助理代写和代发的文章。

# 如何在 Docker 中部署 OpenClaw 私人助理

本文将指导你如何通过 Docker 快速部署 OpenClaw，并配置 Telegram 通道以实现私人助理功能。

---

## **前置条件**

在开始之前，请确保你的系统满足以下要求：
1. 已安装 Docker 和 Docker Compose v2。
2. 确保有足够的磁盘空间用于镜像和日志存储。

---

## **快速开始**

运行以下命令即可完成 OpenClaw 的 Docker 部署：
```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
./docker-setup.sh
```

<!--more-->

---

## **详细步骤**

### **步骤 1：克隆 OpenClaw 仓库**

运行以下命令克隆 OpenClaw 仓库：
```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
```

---

### **步骤 2：运行 Docker Setup 脚本**

OpenClaw 提供了一个便捷的脚本 `docker-setup.sh`，用于快速完成 Docker 配置和启动。你可以根据需求修改 `docker-setup.sh` 和 `Dockerfile` 模板。

运行以下命令：
```bash
./docker-setup.sh
```

该脚本会自动完成以下操作：
- 构建 Gateway 镜像。
- 运行初始化向导。
- 启动 Gateway 容器。
- 生成一个 Gateway Token 并保存到 `.env` 文件中。

---

### **步骤 3：配置 Telegram 通道**

要启用 Telegram 通道，你需要提供一个 Bot Token 并完成配对配置。

#### **获取 Telegram Bot Token**
1. 打开 Telegram，搜索 `@BotFather`。
2. 使用 `/newbot` 命令创建一个新的 Bot，并获取其 Token。

#### **添加 Telegram 配置**
运行以下命令，将 `<your-bot-token>` 替换为你从 BotFather 获取的 Token：
```bash
docker compose run --rm openclaw-cli channels add --channel telegram --token "<your-bot-token>"
```

#### **完成配对**
1. 在 Telegram 中搜索你的 Bot 名称并发送消息 `/pair`。
2. 根据提示完成配对流程。

---

### **步骤 4：访问控制界面**

启动完成后，打开浏览器访问以下 URL：
```
http://127.0.0.1:18789/
```

将生成的 Gateway Token 填入控制界面（Settings → Token）以完成配置。

---

### **步骤 5：验证 Telegram 功能**

1. 在 Telegram 中搜索你的 Bot 名称并发送消息 `/status`。
2. 如果 Bot 正常响应，说明配置成功！

---

## **常见问题**

1. **端口冲突**：
   - 如果 `18789` 端口已被占用，可以在 `docker-compose.yml` 中修改端口映射。例如：
     ```yaml
     ports:
       - "9090:18789"
     ```

2. **健康检查**：
   - 可以通过以下命令检查 Gateway 的健康状态：
     ```bash
     docker compose exec openclaw-gateway node dist/index.mjs health --token "$OPENCLAW_GATEWAY_TOKEN"
     ```

3. **日志查看**：
   - 如果遇到问题，可以通过以下命令查看日志：
     ```bash
     docker logs openclaw-gateway
     ```

---

## **更多内容正在探索中**

OpenClaw 的功能非常丰富，目前我们仅完成了基础的 Telegram 配置。更多高级功能（如多通道支持、技能扩展等）正在探索中。如果你有任何想法或建议，欢迎一起交流，共同完善私人助理的使用体验！
