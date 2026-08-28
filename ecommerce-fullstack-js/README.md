# 🛒 E-Commerce Fullstack JS

Ứng dụng thương mại điện tử fullstack được xây dựng bằng **React + Express + MongoDB**.

## 📁 Cấu trúc dự án

```
ecommerce-fullstack-js/
├── app/
│   ├── frontend/       # React 18 SPA
│   └── backend/        # Express REST API
├── .agent/             # AI Agent governance & skills
│   ├── AGENTS.md       # Quy tắc cho AI Agent
│   ├── skills/         # Agent skills
│   ├── workflows/      # Agent workflows
│   └── templates/      # Document templates
└── .docs/              # Tài liệu dự án
    ├── ARCHITECTURE.md # Kiến trúc hệ thống
    └── STYLEGUIDE.md   # Design system
```

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Redux Toolkit, Bootstrap 5, Framer Motion |
| Backend | Node.js, Express 4, MongoDB (Mongoose) |
| State | Redux Toolkit |
| HTTP | Axios |

## ⚙️ Cài đặt & Chạy

### 1. Clone & Cài dependencies

```bash
# Frontend
cd app/frontend
npm install

# Backend
cd app/backend
npm install
```

### 2. Cấu hình môi trường

```bash
# Tạo file .env từ template
cd app/backend
cp .env.example .env
# Điền các giá trị thực vào .env
```

### 3. Chạy ứng dụng

```bash
# Backend (port 3000)
cd app/backend
npm start

# Frontend (port 3001 hoặc auto)
cd app/frontend
npm start
```

## 📖 Tài liệu

- [Kiến trúc hệ thống](.docs/ARCHITECTURE.md)
- [Style Guide](.docs/STYLEGUIDE.md)
- [AI Agent Rules](.agent/AGENTS.md)
