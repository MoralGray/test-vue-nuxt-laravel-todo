# test-vue-nuxt-laravel

To-Do List SPA на Laravel + Nuxt 3. Мини-приложение со списком задач, авторизацией и CRUD-операциями.

<!---->

## Quick Start

### Быстрый запуск (setup.sh)

```bash
./setup.sh
```
```bash
mise all      # Start both servers (backend + frontend)
```

### Пошагово

```bash
# 1. Backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
# Laravel API на http://localhost:8000

# 2. Frontend (в отдельном терминале)
cd frontend
npm install
npm run dev
# Nuxt на http://localhost:3000
```

### mise (task runner)

```bash
mise all      # Start both servers (backend + frontend)
mise test     # Run all tests (PHPUnit + Vitest + Playwright)
mise lint     # Lint (Pint + ESLint)
mise format   # Format (Pint + Prettier)
```

<!---->

## Test Users

После `php artisan migrate --seed` доступны два пользователя:

| Email | Password | Role | Tasks |
|---|---|---|---|
| `test@example.com` | `password` | **Admin** | 15 seeded tasks (все статусы) |
| `user@example.com` | `password` | Regular | 0 tasks (для проверки scoping) |

**Различия ролей:**
- **Admin** — видит, редактирует, удаляет все задачи всех пользователей
- **Regular** — видит только свои задачи; кнопки Edit/Delete скрыты для чужих задач

### Регистрация нового пользователя

Доступна по адресу `/register`. Новый пользователь создаётся с ролью Regular. После регистрации — автоматический вход и редирект на список задач.

<!---->

## Auth Approach

Используется **Laravel Sanctum с Bearer token** (stateful SPA-аутентификация).

**Почему этот подход:**
- Token хранится в Pinia store и localStorage, отправляется в `Authorization: Bearer` header
- Не требует cookie-сессий — проще настройка CORS
- Sanctum поддерживает как cookie, так и token режимы
- Простая интеграция с `$fetch` — достаточно передать header

**Конфигурация:**
- `SANCTUM_STATEFUL_DOMAINS=localhost:3000` — разрешённый origin для SPA
- `SESSION_DRIVER=cookie` — сессия в cookie (для веб-маршрутов)
- `SESSION_DOMAIN=localhost`

<!---->

## Tech Stack

| Layer | Technology |
|---|---|---|
| Backend | Laravel 11, PHP 8.2+ |
| Frontend | Nuxt 4, Vue 3, Composition API |
| Database | SQLite |
| Auth | Laravel Sanctum (Bearer token) |
| Validation | Form Request |
| Authorization | Policy Gates |
| Unit tests | PHPUnit (backend), Vitest (frontend) |
| E2E tests | Playwright |
| Linting | ESLint (flat config) |
| Formatting | Prettier |
| Documentation | OpenAPI / Swagger (l5-swagger) |

<!---->

## Project Structure

```
├── app/                        # Laravel backend
│   ├── Http/Controllers/Api/   # AuthController, TaskController
│   ├── Http/Requests/          # LoginRequest, StoreTaskRequest, UpdateTaskRequest
│   ├── Models/                 # User, Task
│   └── Policies/               # TaskPolicy
├── bootstrap/app.php           # Exception handler + middleware
├── config/                     # sanctum.php, cors.php
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/                # test@example.com, 15 tasks
├── routes/api.php              # 8 API endpoints
├── frontend/                   # Nuxt 4 SPA
│   ├── app/
│   │   ├── pages/              # login.vue, tasks.vue, index.vue
│   │   ├── components/         # TaskForm.vue, ConfirmDialog.vue
│   │   ├── composables/        # useTaskFilters, useTaskModals
│   │   ├── stores/             # auth.ts, tasks.ts
│   │   ├── middleware/         # auth.ts (route guard)
│   │   ├── plugins/           # auth-interceptor.ts
│   │   └── types/             # api.ts (ApiError)
│   ├── eslint.config.js
│   ├── .prettierrc
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── tests/e2e/             # 18 Playwright tests
│   └── nuxt.config.ts
├── tests/Feature/              # 30 PHPUnit tests
├── setup.sh
├── mise.toml
└── .env.example
```

<!---->

## Features

Подробное описание всех фич — в [DOCS.md](./DOCS.md).

Кратко:
- **F-001** — Авторизация (login/logout, guard, persist)
- **F-002** — CRUD задач (создание, просмотр, редактирование, удаление)
- **F-003** — Access Control (owner-only, policy gates)
- **F-004** — Form Request валидация
- **F-005** — Единый JSON формат ошибок (401/403/404/422/500)
- **F-006** — Фильтрация, сортировка, поиск, UX-состояния
- **F-007** — Admin role (скрытие кнопок)
- **F-008** — Поиск с debounce и синхронизацией URL
- **F-009** — Пагинация (backend + frontend)
- **F-010** — Тесты (PHPUnit + Vitest)
- **F-011** — Swagger / OpenAPI документация

<!---->

## Evaluation Criteria

| Критерий | Описание |
|---|---|
| Запуск | README, .env.example, миграции, сиды, понятные команды |
| Backend | Модели, миграции, Form Request, Policy gates, JSON errors |
| Frontend | Структура Nuxt, API, состояние, маршруты, формы, loading/error |
| Качество кода | Читаемость, типизация, декомпозиция, без дублирования |
| UX | Список задач, edit без перезагрузки, empty states, responsive |
