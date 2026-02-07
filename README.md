# Format_Convertor

## 项目简介
Format_Convertor 是一个基于 FastAPI（后端）和 React（前端）的文件格式转换工具，支持多文件上传与批量格式转换。

## 目录结构
```
backend/      # FastAPI 后端服务
frontend/     # React 前端项目
```

## 快速开始

### 1. 使用 Docker Compose 部署（推荐）

```bash
git clone <本项目地址>
cd Format_Convertor
docker-compose up --build
```
- 前端访问：http://localhost
- 后端 API：http://localhost:8000

如需改前端宿主机端口，可通过环境变量覆盖：
```bash
FRONTEND_PORT=8080 docker-compose up --build
```

### 2. 单独构建与运行

#### 后端
```bash
cd backend
docker build -t format-backend .
docker run -p 8000:8000 format-backend
```

#### 前端
```bash
cd frontend
docker build -t format-frontend .
docker run -p 80:80 format-frontend
```

## 常见排查
- 若 `http://localhost` 无法访问，先检查 `80` 端口是否被占用：
```bash
sudo lsof -iTCP:80 -sTCP:LISTEN -n -P
```
- 服务部署在远程服务器时，请使用 `http://服务器IP` 或域名访问，不是你本机的 `localhost`。

## API 简介
- POST /api/upload  上传文件并自动转换，返回压缩包

## 贡献者
@Mark @唯唯🍪 @胖子杰
