# Cloudflare Tunnel 部署

用 Cloudflare Tunnel 将 PettyCare 暴露到公网，无需开放防火墙端口。

## 架构

```
用户 → your-domain.com → Cloudflare → Tunnel → localhost:8080 → nginx → 静态文件
```

## 前置条件

- Cloudflare 账号 + 域名已接入 Cloudflare
- Docker + Docker Compose

## 使用步骤

### 1. 构建前端

```bash
npm run build
```

### 2. 获取 Tunnel Token

[Cloudflare Zero Trust Dashboard](https://dash.teams.cloudflare.com/) → Access → Tunnels → Create a tunnel → 选择 Docker 方式 → 复制 Token。

### 3. 配置 Token

```bash
echo "TUNNEL_TOKEN=your_token_here" > docker/cloudflared/.env
```

### 4. 一键启动

```bash
docker compose up -d
```

Web 服务监听 **127.0.0.1:8080**，Tunnel 自动映射到公网域名。访问 `http://localhost:8080` 可验证本地是否正常。在 Cloudflare Dashboard 中将域名指向该 Tunnel 即可公网访问。
