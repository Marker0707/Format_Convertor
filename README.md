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
- 前端访问：http://localhost:8080
- 后端 API：http://localhost:8000

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
docker run -p 8080:80 format-frontend
```

## API 简介
- POST /api/upload  上传文件并自动转换，返回压缩包

## 贡献者
@Mark @唯唯🍪 @胖子杰
