# aitest1（前后端 + MySQL 一键启动）

## 项目结构

- `frontend/`：登录页面（Nginx 托管）
- `backend/`：Node.js + Express API（含 MySQL 连接）
- `docker-compose.yml`：一键启动前端/后端/MySQL
- `.env.example`：环境变量模板

## 一键启动（Docker Compose）

```bash
cp .env.example .env
docker compose up -d --build
```

启动后访问：

- 前端：http://localhost:8080
- 后端健康检查：http://localhost:3000/api/health
- MySQL：localhost:3306

默认测试账号：

- 用户名：`admin`
- 密码：`123456`

## 停止

```bash
docker compose down
```

如果要连同数据库卷一起清理：

```bash
docker compose down -v
```

## 在线预览（静态页）

仓库启用 GitHub Pages 后可访问：

- https://ljybug.github.io/aitest1/

> 说明：Pages 是静态预览，真实登录接口需后端服务可用。
