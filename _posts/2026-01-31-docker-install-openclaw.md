---
layout: post
title: "使用 Docker 快速安装和运行 OpenClaw"
date: 2026-01-31 06:49:00
categories: [Docker, OpenClaw, 教程]
---

# 使用 Docker 快速安装和运行 OpenClaw

本文将指导你如何通过 Docker 快速安装和运行 OpenClaw，从而简化部署流程并确保环境一致性。

---

## **前置条件**

在开始之前，请确保你的系统满足以下要求：
1. 已安装 Docker 和 Docker Compose。
2. 系统已连接到互联网。

如果尚未安装 Docker，请参考以下命令完成安装：
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo apt install docker-compose
```

---

## **步骤 1：拉取 OpenClaw 镜像**

运行以下命令从 Docker Hub 拉取 OpenClaw 镜像：
```bash
docker pull openclaw/openclaw:latest
```

---

## **步骤 2：创建配置文件**

在本地创建一个 `openclaw.yml` 配置文件，用于定义 OpenClaw 的运行参数。示例配置如下：
```yaml
version: '3'
services:
  openclaw:
    image: openclaw/openclaw:latest
    container_name: openclaw
    ports:
      - "8080:80"
    volumes:
      - ./data:/app/data
    environment:
      - TZ=Asia/Shanghai
    restart: unless-stopped
```

---

## **步骤 3：启动容器**

使用 Docker Compose 启动 OpenClaw 容器：
```bash
docker-compose -f openclaw.yml up -d
```

启动后，OpenClaw 将运行在 `http://localhost:8080`。

---

## **步骤 4：验证安装**

访问以下 URL 验证 OpenClaw 是否成功运行：
```
http://localhost:8080
```

如果页面正常加载，说明安装成功！

---

## **常见问题**

1. **端口冲突**：
   - 如果 `8080` 端口已被占用，可以修改 `openclaw.yml` 中的端口映射。例如：
     ```yaml
     ports:
       - "9090:80"
     ```

2. **数据持久化**：
   - 所有数据存储在 `./data` 目录中，请确保该目录存在并具有适当权限。

3. **日志查看**：
   - 如果遇到问题，可以通过以下命令查看日志：
     ```bash
     docker logs openclaw
     ```

---

希望这篇文章对你有帮助！如果有任何问题，请随时联系我。
