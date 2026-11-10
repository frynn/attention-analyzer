# Attention Analyzer

> Predictive UX & Saliency Analysis — система предиктивного анализа визуального внимания пользователей на веб-страницах.

[![Status](https://img.shields.io/badge/status-MVP-brightgreen)]()
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## О проекте

**Attention Analyzer** — инструмент для UX/UI-дизайнеров, маркетологов и продуктовых команд, который **предсказывает визуальное внимание пользователей до запуска сайта**.

В отличие от классической веб-аналитики (Яндекс.Метрика, Hotjar, CrazyEgg), собирающей данные *после* релиза и *только с реальным трафиком*, наша система работает с **макетами**: пользователь загружает скриншот страницы, а алгоритм компьютерного зрения строит прогностическую тепловую карту на основе цветового контраста, яркости, границ и цветовой насыщенности.

### Научно-практическая ценность

- **Предиктивность:** анализ не требует запуска и трафика
- **Объяснимость:** каждая UX-рекомендация привязана к измеримой метрике заметности
- **Итеративность:** правки проверяются до передачи макета в разработку
- **Интерактивность:** выделение ROI с мгновенной оценкой (0–100) и экспортом отчёта в PNG

## Возможности

### ✅ Реализовано

#### Аутентификация
- Регистрация и вход по email + пароль
- JWT-токены (access, 7 дней)
- Хэширование паролей bcryptjs (10 раундов)
- Защищённые роуты через `JwtAuthGuard`
- Восстановление сессии после F5

#### Управление проектами
- Создание, чтение, обновление, удаление проектов
- Изоляция проектов по пользователю (ownership check)
- Каскадное удаление связанных анализов и ROI

#### Анализ макетов
- Загрузка скриншотов PNG/JPG (до 10 МБ)
- Извлечение размеров через `sharp`
- **Saliency Core:** собственный алгоритм расчёта карты внимания
- Хранение матрицы saliency в PostgreSQL (JSON)
- Автоматический UX-аудит (текстовые рекомендации)

#### Интерактивный дашборд
- Тепловая карта поверх скриншота (Canvas)
- Слайдер прозрачности (0–100%)
- **ROI-выделение:** обводка области мышью → мгновенный score (0–100) + текстовая рекомендация
- Адаптивная вёрстка (mobile + desktop)

#### Экспорт
- Скачивание композитного PNG в оригинальном разрешении
- Наложение heatmap с выбранной прозрачностью
- Включение ROI-разметки с оценкой и советом
- Водяной знак с брендом и датой

#### UX/UI
- Landing-страница с интерактивным hero (mock-heatmap)
- Политика конфиденциальности
- Дизайн-система «Digital Sage» (шалфейный/песочный/forest)
- Shimmer-скелетоны (защита от layout shift)
- Оптимизированный hover-glow за курсором (0 ре-рендеров через rAF)

### 🚧 Roadmap

- PDF-отчёт с текстовым UX-аудитом
- Сохранение ROI в базе данных (история зон)
- ML-модель (SAM / SALICON) через Python-микросервис
- A/B сравнение двух макетов
- Экспорт отчёта по всему проекту
- E2E тесты (Jest + Supertest + Playwright)

## Стек технологий

### Монорепозиторий
| Технология | Роль |
|---|---|
| **npm workspaces** | Управление монорепо (`apps/*`, `packages/*`) |
| **TypeScript 6 / 5.9** | Строгий типизированный JS |
| **Prettier** | Единый код-стиль |

### Frontend (`apps/client`)
| Технология | Роль |
|---|---|
| **React 19.3** | UI |
| **Vite 8** (rolldown) | Сборка, dev-сервер, HMR |
| **Tailwind CSS v4** | Стилизация (утилитарный подход, `@theme`) |
| **React Router 7** | Клиентский роутинг |
| **HTML5 Canvas API** | Отрисовка heatmap |
| **useActionState / useFormStatus** | Современные формы React 19 |
| **fetch + Blob URL** | Загрузка защищённых изображений |

### Backend (`apps/server`)
| Технология | Роль |
|---|---|
| **NestJS** | HTTP-фреймворк, DI, модульная архитектура |
| **Prisma ORM 6.19** | Типобезопасный доступ к PostgreSQL |
| **PostgreSQL (Neon)** | Облачная serverless БД |
| **sharp** | Обработка изображений (C++, prebuilt) |
| **Multer** | Загрузка файлов |
| **passport + passport-jwt** | JWT-стратегия |
| **bcryptjs** | Хэширование паролей |
| **class-validator** | Валидация DTO |
| **@nestjs/config** | Загрузка `.env` через dotenv |

### Общий пакет (`packages/shared`)
TypeScript-типы (DTO) для запросов и ответов, импортируются и клиентом, и сервером. Единственный источник правды для API-контракта.

## Структура репозитория

```
attention-analyzer/
├── apps/
│   ├── client/                      # React SPA
│   │   └── src/
│   │       ├── components/          # AuthCard, HeatmapViewer, AuthedImage, Skeleton, SubmitButton
│   │       ├── context/             # AuthContext
│   │       ├── hooks/               # usePageMeta
│   │       ├── lib/                 # api.ts, exportHeatmap.ts
│   │       ├── pages/               # Landing, Login, Register, Projects, ProjectDetail, Analysis, Privacy
│   │       └── main.tsx
│   └── server/                      # NestJS API
│       ├── prisma/
│       │   ├── schema.prisma        # Модели БД
│       │   └── migrations/          # SQL-миграции
│       ├── generated/prisma/        # Сгенерированный клиент
│       ├── uploads/                 # Загруженные макеты (gitignore)
│       └── src/
│           ├── auth/                # JWT-аутентификация
│           ├── projects/            # CRUD проектов
│           ├── analyses/            # Upload + Saliency + UX-audit
│           ├── prisma/              # PrismaService, PrismaModule
│           ├── app.module.ts
│           └── main.ts
├── packages/
│   └── shared/                      # Общие DTO
│       ├── src/index.ts
│       └── dist/
├── package.json                     # Корневой workspace
├── tsconfig.base.json
└── README.md
```

## Требования

- **Node.js** ≥ 22 (рекомендуется LTS)
- **npm** ≥ 10 (рекомендуется 11+)
- **PostgreSQL** 14+ *или* аккаунт на [Neon](https://neon.tech) (бесплатный tier)

## Установка

### 1. Клонирование

```bash
git clone https://github.com/frynn/attention-analyzer.git
cd attention-analyzer
```

### 2. Зависимости

```bash
npm install
```

### 3. Окружение

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

**Генерация `JWT_SECRET`:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**⚠️ ВАЖНО:** `.env` не должен содержать запятых после значений, пробелов вокруг `=` и лишних кавычек. `.env` — не JSON.

### 4. Миграции

```bash
npm run db:migrate
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

Все эндпоинты под префиксом `/api`. Защищённые требуют `Authorization: Bearer <token>`.

### Аутентификация

| Метод | Endpoint | Описание |
|---|---|---|
| `POST` | `/api/auth/register` | Регистрация |
| `POST` | `/api/auth/login` | Вход |
| `GET`  | `/api/auth/me` | Текущий профиль 🔒 |

### Проекты

| Метод | Endpoint | Описание |
|---|---|---|
| `POST`   | `/api/projects` | Создать 🔒 |
| `GET`    | `/api/projects` | Список своих 🔒 |
| `GET`    | `/api/projects/:id` | Один проект 🔒 |
| `PATCH`  | `/api/projects/:id` | Обновить 🔒 |
| `DELETE` | `/api/projects/:id` | Удалить 🔒 |

### Анализы

| Метод | Endpoint | Описание |
|---|---|---|
| `POST`   | `/api/analyses` | Загрузить макет (multipart: `file`, `projectId`) 🔒 |
| `GET`    | `/api/analyses?projectId=...` | Список анализов проекта 🔒 |
| `GET`    | `/api/analyses/:id` | Детали + saliency map 🔒 |
| `GET`    | `/api/analyses/:id/image` | Оригинальное изображение 🔒 |
| `DELETE` | `/api/analyses/:id` | Удалить (вместе с файлом) 🔒 |

### Пример: регистрация

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
    "createdAt": "2026-11-10T12:00:00.000Z"
  }
}
```

### Коды ошибок

| Код | Значение |
|---|---|
| `400` | Ошибка валидации |
| `401` | Не авторизован / истёк токен |
| `403` | Нет прав (обычно маскируется под 404) |
| `404` | Ресурс не найден |
| `409` | Конфликт (email занят) |
| `413` | Файл слишком большой |
| `415` | Неподдерживаемый тип файла |

## Модели данных

### `User`
```prisma
id        String   @id @default(cuid())
email     String   @unique
password  String   // bcrypt-хэш
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
projects  Project[]
```

### `Project`
```prisma
id          String   @id @default(cuid())
name        String
description String?
userId      String   // FK → User (Cascade)
analyses    Analysis[]
```

### `Analysis`
```prisma
id           String   @id @default(cuid())
filename     String   // имя файла в uploads/
width        Int
height       Int
saliencyData Json?    // { width, height, map: number[] }
uxReport     String?  // текст UX-аудита
projectId    String   // FK → Project (Cascade)
rois         Roi[]
```

### `Roi`
```prisma
id         String   @id @default(cuid())
name       String?
x          Int
y          Int
width      Int
height     Int
score      Float    // 0–100
analysisId String   // FK → Analysis (Cascade)
```

## Saliency Core — алгоритм

Собственная реализация (без ML) на основе low-level признаков. Выполняется на сервере через `sharp`.

**Пайплайн:**

1. **Downscale** до 256px по длинной стороне (fit: `inside`)
2. **Извлечение признаков** для каждого пикселя:
   - **Luminance** = `0.299·R + 0.587·G + 0.114·B`
   - **Colorfulness** = `(max(R,G,B) − min(R,G,B)) / 255`
3. **Локальный контраст:** `|pixel − boxBlur(pixel, radius=4)|`
4. **Границы:** Sobel-magnitude (Kx, Ky ядра 3×3)
5. **Нормализация** contrast и edges по 95-му перцентилю (отсечение выбросов)
6. **Комбинирование** с весами:
   ```
   saliency = 0.4·contrast + 0.4·edges + 0.2·colorfulness
   ```
7. **Сглаживание** `boxBlur(radius=6)` → мягкие «пятна» вместо шума
8. **Нормализация** по 95-му перцентилю (top-5% → 1.0, остальное линейно)
9. **Gamma correction** `^0.5` — подъём середины
10. **Упаковка** в `{ width, height, map: number[] }` (row-major, `[0, 1]`)

**Результат:** матрица 256×N (обычно 40 960 точек для 16:10) сохраняется в `Analysis.saliencyData` как JSON.

## Архитектурные решения

### Монорепозиторий на npm workspaces
Единый lock-файл, общие `node_modules` (hoisted), независимая версионность через scope `@attention/*`. Плюс общий пакет `@attention/shared` с типами — при изменении API TypeScript подсветит все места на клиенте и сервере.

### Prisma Client: кастомный output
В monorepo Prisma CLI не резолвит `@prisma/client` из hoisted `node_modules`. Решение — явный `output = "../generated/prisma"` в `schema.prisma` + импорт `from '../../generated/prisma'` в `PrismaService`.

### JWT без refresh-токенов (MVP)
Access-токен на 7 дней, хранится в `localStorage`. Для продакшена — httpOnly-cookies + refresh flow. Для курсовой упрощение оправдано.

### Ownership через 404, а не 403
При попытке доступа к чужому проекту возвращается **404 Not Found**, а не **403 Forbidden**. Это стандартная практика безопасности: клиент не может перебором ID узнать, какие ресурсы существуют, а какие нет.

### Идентификация пользователя в запросах
Декоратор `@CurrentUser()` извлекает `{ userId, email }` из `req.user`, куда его положила `JwtStrategy.validate()`. Контроллеры не парсят токен вручную.

### Saliency — на сервере, не на клиенте
Тяжёлая обработка (`sharp`, C++) выполняется на сервере один раз при upload. Клиент получает готовую JSON-матрицу и только рисует. Это даёт консистентность (одинаковый алгоритм для всех) и не грузит CPU пользователя.

### ROI-scoring — на клиенте
После загрузки saliency-матрицы клиент может считать score для любой области **мгновенно**, без запросов к серверу. Формула: среднее значение `map[y][x]` внутри bounding box × 100. Это даёт UX «выделил → увидел результат» без задержек.

### Оптимизация hover-glow на лендинге
Свечение за курсором реализовано через `requestAnimationFrame` + прямое обновление `transform: translate3d(...)`, **без** `useState`. React не ре-рендерит компонент на каждое движение мыши → 60 FPS на любом ноутбуке.

### Защита от layout shift
`AuthedImage` получает `width`/`height` пропсами и рендерит shimmer-заглушку с правильным `aspect-ratio` пока грузится. Это устраняет скачки высоты — важный показатель **CLS (Cumulative Layout Shift)**, влияющий на воспринимаемую производительность.

## Скрипты

### Корень

| Команда | Описание |
|---|---|
| `npm run dev` | Клиент + сервер параллельно |
| `npm run dev:client` | Только фронт (5173) |
| `npm run dev:server` | Только бэк (3000) |
| `npm run build` | Сборка shared → server → client |
| `npm run build:shared` | Сборка `@attention/shared` |
| `npm run format` | Prettier |
| `npm run db:migrate` | Применить миграции Prisma |
| `npm run db:generate` | Пересобрать Prisma Client |
| `npm run db:studio` | Prisma Studio (GUI для БД) |
| `npm run db:reset` | Сброс БД + миграции |

## Дизайн-система

Палитра «Digital Sage» — приглушённые природные оттенки вместо неонового киберпанка.

| Токен | Hex | Роль |
|---|---|---|
| `forest-950` | `#0E1311` | Основной фон |
| `forest-900` | `#161D19` | Поверхности (карточки) |
| `forest-800` | `#1F2823` | Hover-состояния |
| `forest-700` | `#2A3530` | Границы |
| `sage-500` | `#A3C1AD` | Primary accent (кнопки) |
| `sage-400` | `#B8D4C2` | Primary hover |
| `sand-500` | `#D4C5B0` | Secondary accent |
| `cream-100` | `#E8EDE9` | Основной текст |
| `cream-500` | `#8A9A91` | Вторичный текст |

**Палитра heatmap** (данные, не трогаем): синий `#0000FF` → циан `#00FFFF` → зелёный `#00FF00` → жёлтый `#FFFF00` → оранжевый `#FF8000` → красный `#FF0000`.

## Безопасность

- **Пароли:** bcryptjs (10 раундов), в открытом виде не хранятся и не передаются
- **JWT:** подписанный HS256, `JWT_SECRET` ≥ 32 символа, истечение через `JWT_EXPIRES_IN`
- **Валидация:** `class-validator` + `ValidationPipe` с `whitelist: true` и `forbidNonWhitelisted: true` — отбрасывает лишние поля, кидает 400 на неизвестные
- **CORS:** только `CLIENT_ORIGIN` (не `*`), с `credentials: true`
- **Ownership:** все операции с проектами/анализами проверяют `userId` текущего пользователя
- **File upload:** `fileFilter` пропускает только `image/png` и `image/jpeg`, `limits.fileSize` = 10 MB
- **`.env`** — в `.gitignore`, не коммитится
- **`uploads/`** — в `.gitignore`, приватная директория

## Производительность

- **Downsample:** saliency считается на 256px, а не на 2880px → в 100× быстрее
- **Canvas в native resolution:** heatmap рисуется в 256×160 и CSS-растягивается (browser bilinear) → плавно и быстро
- **rAF для hover-glow:** 0 React-ререндеров
- **Shimmer skeleton:** устранён layout shift
- **Hoisted deps:** общие `node_modules` для клиента и сервера

## Лицензия

[MIT](./LICENSE)

## Автор

Курсовой проект. GitHub: [@frynn](https://github.com/frynn)