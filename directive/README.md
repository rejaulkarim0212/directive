# Directive US Fullstack (10 Agents)

This folder provides a runnable frontend + backend setup for the **US 10-agent** version:

- `backend/server.py` -> launches the project API backend (`dashboard/server.py`)
- `frontend/` -> React dashboard source (Vite + TypeScript)

## Project Structure

```
directive/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── models/         # SQLAlchemy 模型
│   │   ├── schemas/        # Pydantic 数据模型
│   │   ├── services/       # 业务逻辑服务
│   │   ├── workers/        # 后台工作进程
│   │   ├── config.py       # 配置管理
│   │   ├── db.py           # 数据库连接
│   │   └── main.py         # FastAPI 应用入口
│   └── server.py           # 启动脚本
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── api/            # API 客户端
│   │   │   ├── types.ts    # API 类型定义
│   │   │   ├── client.ts   # HTTP 请求封装
│   │   │   └── index.ts    # API 函数
│   │   ├── components/     # React 组件
│   │   │   ├── ui/         # 通用 UI 组件
│   │   │   ├── layout/     # 布局组件
│   │   │   ├── panels/     # 面板组件
│   │   │   └── config/     # 配置组件
│   │   ├── constants/      # 常量定义
│   │   ├── store/          # Zustand 状态管理
│   │   ├── utils/          # 工具函数
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Quick Start

### 1) Start backend

```bash
cd directive
python3 backend/server.py --port 7891
```

Or using the project-level dashboard server:

```bash
cd dashboard
python3 server.py --port 7891
```

### 2) Start frontend (dev)

```bash
cd directive/frontend
npm install
npm run dev
```

Frontend defaults to `http://127.0.0.1:7891` via `.env.development`.

Open browser at `http://localhost:5173/`

## Build for Production

```bash
cd directive/frontend
npm run build
```

Build output goes to `../../dashboard/dist/`

## Agent IDs used

`chief_of_staff`, `nsc`, `senate`, `omb`, `treasury`, `state_dept`, `dod`, `doj`, `commerce`, `supreme_court`

## Architecture Notes

### Frontend
- **Framework**: React 18 + TypeScript 5.6
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand 4.5
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI 0.115
- **ORM**: SQLAlchemy 2.0 (async)
- **Database**: PostgreSQL (via asyncpg)
- **Cache**: Redis
- **Migrations**: Alembic
