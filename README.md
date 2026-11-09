# Attention Analyzer

> Predictive UX & Saliency Analysis — система предиктивного анализа визуального внимания пользователей на веб-страницах.

[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## О проекте

**Attention Analyzer** — инструмент для UX/UI-дизайнеров и маркетологов, который **до запуска сайта** предсказывает, куда пользователи будут смотреть в первую очередь.

В отличие от классической веб-аналитики (Яндекс.Метрика, Hotjar), собирающей данные *после* релиза, наша система работает с **макетами**: пользователь загружает скриншот страницы, а алгоритмы компьютерного зрения (visual saliency) строят прогностическую тепловую карту на основе цветового контраста, яркости и плотности контуров.

### Научно-практическая ценность

- **Предиктивность:** анализ не требует запуска и трафика
- **Объяснимость:** каждая рекомендация привязана к измеримой метрике
- **Итеративность:** UX-правки проверяются до передачи в разработку

## Текущий статус

**MVP в активной разработке.** Реализован фундамент: монорепозиторий, авторизация, схема БД. Ядро анализа (saliency core) и интерактивный дашборд — в roadmap.

## Возможности

### ✅ Реализовано

- **Монорепозиторий** на базе npm workspaces
- **Аутентификация JWT** — регистрация, логин, защищённые роуты
- **PostgreSQL + Prisma** — модели `User`, `Project`, `Analysis`, `Roi`
- **Валидация** входных данных через `class-validator`
- **Общие DTO** между клиентом и сервером (`@attention/shared`)
- **Frontend-каркас:** Vite + React 19 + Tailwind CSS v4

### 🚧 В разработке

- Управление проектами (CRUD)
- Загрузка макетов (PNG/JPG) через Drag-and-Drop
- **Saliency Core** — расчёт тепловой карты (контраст, яркость, контуры)
- **Интерактивный дашборд** — наложение heatmap, слайдер прозрачности
- **ROI (зоны интереса)** — выделение области и оценка заметности (0–100)
- **UX-аудит** — автоматические рекомендации на основе метрик
- **Экспорт** — PNG с тепловой картой, PDF-отчёт

## Стек технологий

### Frontend
| Технология | Роль |
|---|---|
| React 19 + TypeScript | UI |
| Vite 8 | Сборка, dev-сервер |
| Tailwind CSS v4 | Стилизация |
| Lucide React | Иконки |
| React-Konva *(планируется)* | Canvas для heatmap |

### Backend
| Технология | Роль |
|---|---|
| NestJS | HTTP-фреймворк, DI |
| Prisma ORM 6 | Типобезопасный доступ к БД |
| PostgreSQL (Neon) | Облачная БД |
| Passport + JWT | Аутентификация |
| bcryptjs | Хэширование паролей |
| Multer *(планируется)* | Загрузка файлов |

### Анализ изображений
| Технология | Роль |
|---|---|
| JS-ядро на основе `sharp` *(планируется)* | Расчёт saliency map |
| Python + FastAPI *(альтернатива)* | Тяжёлые CV-модели |

## Структура репозитория

```
attention-analyzer/
├── apps/
│   ├── client/                  # React SPA (frontend)
│   │   ├── src/
│   │   └── vite.config.ts
│   └── server/                  # NestJS API (backend)
│       ├── prisma/
│       │   ├── schema.prisma    # Описание моделей БД
│       │   └── migrations/      # SQL-миграции
│       ├── generated/
│       │   └── prisma/          # Сгенерированный Prisma Client
│       └── src/
│           ├── auth/            # JWT-аутентификация
│           ├── prisma/          # PrismaService, PrismaModule
│           ├── app.module.ts
│           └── main.ts
├── packages/
│   └── shared/                  # Общие TypeScript-типы (DTO)
│       ├── src/index.ts
│       └── dist/                # Скомпилированный output
├── package.json                 # Корневой workspace
├── tsconfig.base.json
└── .prettierrc
```

## Требования

- **Node.js** ≥ 22 (рекомендуется LTS)
- **npm** ≥ 10
- **PostgreSQL** 14+ *или* аккаунт на [Neon](https://neon.tech) (бесплатный tier)

## Установка

### 1. Клонирование

```bash
git clone <repo-url> attention-analyzer
cd attention-analyzer
```

### 2. Зависимости

```bash
npm install
```

### 3. Окружение

Скопируй шаблон:

```bash
cp apps/server/.env.example apps/server/.env
```

Заполни `apps/server/.env`:

```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require&connect_timeout=30"
JWT_SECRET="<64-символьный hex>"
JWT_EXPIRES_IN="7d"
PORT=3000
CLIENT_ORIGIN="http://localhost:5173"
```

Генерация `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Миграции

```bash
npm run db:migrate
npm run db:generate
```

### 5. Запуск

```bash
# Оба сервиса одновременно
npm run dev

# Или по отдельности
npm run dev:client   # → http://localhost:5173
npm run dev:server   # → http://localhost:3000/api
```

## API

Все эндпоинты под префиксом `/api`.

### Аутентификация

| Метод | Endpoint | Описание | Тело |
|---|---|---|---|
| `POST` | `/api/auth/register` | Регистрация | `{ email, password }` |
| `POST` | `/api/auth/login` | Вход | `{ email, password }` |
| `GET`  | `/api/auth/me` | Профиль | *требует Bearer-токен* |

**Пример регистрации:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Ответ (201):**

```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "createdAt": "2026-11-09T12:00:00.000Z"
  }
}
```

**Коды ошибок:**

| Код | Причина |
|---|---|
| `400` | Ошибка валидации (email/пароль не соответствуют) |
| `401` | Неверные креды или истёкший токен |
| `409` | Email уже зарегистрирован |

## Модели данных

### `User`
- `id` — cuid
- `email` — уникальный
- `password` — bcryptjs-хэш (10 раундов)
- `createdAt`, `updatedAt`

### `Project`
- `id`, `name`, `description?`
- `userId` — FK → User (Cascade)
- `analyses[]`

### `Analysis`
- `filename`, `width`, `height`
- `saliencyData` — матрица горячих точек (`Float[][]`)
- `uxReport` — Markdown-отчёт
- `projectId` — FK → Project (Cascade)
- `rois[]`

### `Roi`
- `x, y, width, height` — координаты в px
- `score` — 0..100
- `analysisId` — FK → Analysis (Cascade)

## Скрипты

### Корень монорепо

| Команда | Описание |
|---|---|
| `npm run dev` | Клиент + сервер параллельно |
| `npm run dev:client` | Только фронтенд (5173) |
| `npm run dev:server` | Только бэкенд (3000) |
| `npm run build` | Сборка shared → server → client |
| `npm run build:shared` | Сборка `@attention/shared` |
| `npm run format` | Prettier |
| `npm run db:migrate` | Prisma migrate |
| `npm run db:generate` | Генерация Prisma Client |
| `npm run db:studio` | GUI для БД |
| `npm run db:reset` | Сброс БД + миграции |

## Архитектурные решения

### Монорепозиторий на npm workspaces
Единый lock-файл, общие `node_modules` (hoisted), независимая версионность пакетов через scope `@attention/*`.

### Shared-пакет для DTO
Типы запросов/ответов (`AuthResponseDto`, `UserDto`) живут в `packages/shared` и импортируются **и клиентом, и сервером**. При изменении формата API TypeScript подсветит все места, требующие правки.

### Prisma Client: кастомный output
В monorepo Prisma CLI не резолвит `@prisma/client` из hoisted `node_modules`. Решение — явный `output = "../generated/prisma"` в `schema.prisma` + импорт `from '../../generated/prisma'` в `PrismaService`.

### JWT без refresh-токенов (MVP)
Access-токен живёт 7 дней, хранится на клиенте в памяти (не localStorage — защита от XSS). Refresh-токены — в roadmap.

## Roadmap

- [x] Монорепозиторий + инфраструктура
- [x] Auth (JWT, register/login/me)
- [x] Схема БД (User, Project, Analysis, Roi)
- [ ] CRUD проектов
- [ ] Загрузка изображений (Multer + `uploads/`)
- [ ] Saliency Core v1 (контраст + яркость + edge density)
- [ ] Интерактивный heatmap (React-Konva)
- [ ] ROI с оценкой заметности
- [ ] Автоматический UX-аудит (правила)
- [ ] Экспорт PNG / PDF
- [ ] Python-микросервис для ML-модели
- [ ] E2E-тесты (Jest + Supertest)

## Лицензия

[MIT](./LICENSE)

## Автор

Курсовой проект. Вопросы и предложения — через Issues.