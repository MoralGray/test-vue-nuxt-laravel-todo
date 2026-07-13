# test-vue-nuxt-laravel

// # ------------------------------------------------------------------------------------------------

## Concept

**Концепт:** Мини-приложение «Список задач» с авторизацией, CRUD-операциями, Laravel API и клиентской частью на Vue/Nuxt. Проект проверяет умение собрать рабочий SPA/API-продукт от миграций до UX-состояний. Laravel отвечает за данные, авторизацию и бизнес-правила, Nuxt/Vue отвечает за интерфейс и взаимодействие с API.

**Project Overview:** A mini To-Do List application with authentication, CRUD operations, Laravel API and client-side on Vue/Nuxt. The project tests the ability to build a working SPA/API product from migrations to UX states. Laravel handles data, authorization and business rules, Nuxt/Vue handles the interface and API interaction.

// # ------------------------------------------------------------------------------------------------

## Architecture

```
[Browser/Nuxt] --HTTP/JSON--> [Laravel API] --Eloquent--> [SQLite]
       |                              |
  [Pinia Store]              [Form Request Validation]
  [Route Guards]             [Sanctum Auth]
  [Composables]              [Policy Gates]
```

### Frontend

- **Framework:** Nuxt 3 (Vue 3, Composition API)
- **Auth:** Sanctum cookie session (default) or Bearer token via composable
- **State:** Pinia store for auth and tasks
- **Routing:** Vue Router with route guards (redirect to login on 401)
- **UI:** Component-based with modal/inline editing, loading/empty/error states
- **HTTP Client:** `$fetch` or nuxt-native `useFetch` with interceptors

### Backend

- **Framework:** Laravel 11, PHP 8.2+
- **Database:** SQLite (dev), Eloquent ORM
- **Auth:** Laravel Sanctum (cookie session or token-based)
- **Validation:** Form Request classes for server-side validation
- **Authorization:** Policy gates for task ownership
- **Error Handling:** Unified JSON error format (401, 403, 404, 422, 500)

### Data Flow

1. User submits login form -> `POST /api/auth/login` -> Sanctum creates token/session
2. Frontend stores auth state in Pinia, attaches token to subsequent requests
3. All `/api/tasks` requests go through auth middleware + policy gates
4. Form Request validates input before controller logic
5. Responses are JSON with `data`, `meta` (pagination) structure
6. On 401 response from any endpoint, frontend redirects to login

### Project Structure

```
test-vue-nuxt-laravel/
|
|-- .env.example                    # Environment template
|-- AGENTS.md                       # Agent instructions
|-- DOCS.md                         # Project documentation
|-- README.md                       # Quick start and overview
|-- TODO.md                         # Task tracking (epics)
|-- setup.sh                        # Quick setup script
|-- mise.toml                       # Task runner config
|-- composer.json                   # PHP dependencies
|
|-- app/                            # Laravel backend
|   |-- Http/
|   |   |-- Controllers/Api/
|   |   |   |-- AuthController.php  # login, logout
|   |   |   |-- TaskController.php  # CRUD + list
|   |   |-- Requests/
|   |   |   |-- LoginRequest.php
|   |   |   |-- StoreTaskRequest.php
|   |   |   |-- UpdateTaskRequest.php
|   |-- Models/
|   |   |-- User.php
|   |   |-- Task.php                # status enum, FK to user
|   |-- Policies/
|   |   |-- TaskPolicy.php          # owner-only + admin gates
|   |-- Providers/
|   |   |-- AppServiceProvider.php  # Policy registration
|
|-- bootstrap/
|   |-- app.php                     # Exceptions + middleware
|-- config/
|   |-- sanctum.php
|   |-- cors.php
|
|-- database/
|   |-- migrations/
|   |   |-- create_users_table.php
|   |   |-- create_tasks_table.php
|   |   |-- add_is_admin_to_users.php
|   |-- factories/
|   |   |-- TaskFactory.php
|   |-- seeders/
|       |-- DatabaseSeeder.php      # test@example.com + user@example.com
|       |-- TaskSeeder.php          # 15 test tasks
|
|-- routes/
|   |-- api.php                     # POST /auth/*, GET/POST/PUT/DELETE /tasks/*
|
|-- frontend/                       # Nuxt 4 SPA
|   |-- app/
|   |   |-- app.vue
|   |   |-- pages/
|   |   |   |-- index.vue           # Redirect based on auth
|   |   |   |-- login.vue
|   |   |   |-- tasks.vue
|   |   |-- components/
|   |   |   |-- TaskForm.vue        # Create/edit modal
|   |   |   |-- ConfirmDialog.vue   # Delete confirmation
|   |   |-- composables/
|   |   |   |-- useTaskFilters.ts   # Search, filter, sort, URL sync
|   |   |   |-- useTaskModals.ts    # Form/confirm state management
|   |   |-- stores/
|   |   |   |-- auth.ts             # Pinia auth store
|   |   |   |-- tasks.ts            # Pinia task store
|   |   |-- middleware/
|   |   |   |-- auth.ts             # Route guard
|   |   |-- plugins/
|   |   |   |-- auth-interceptor.ts # 401 global handler
|   |   |-- types/
|   |       |-- api.ts              # ApiError type + helper
|   |-- eslint.config.js            # ESLint flat config
|   |-- .prettierrc                 # Prettier config
|   |-- vitest.config.ts            # Unit test config
|   |-- playwright.config.ts        # E2E test config
|   |-- tests/
|   |   |-- e2e/
|   |       |-- app.spec.ts         # 18 Playwright tests
|   |-- nuxt.config.ts
|   |-- package.json
|
|-- tests/                          # Backend tests
|   |-- Feature/
|   |   |-- AuthTest.php
|   |   |-- TaskCrudTest.php
|   |   |-- TaskPolicyTest.php
|   |   |-- TaskFilterTest.php
|   |   |-- ErrorFormatTest.php
|
|-- Dockerfile                      # Laravel php-fpm
```

// # ------------------------------------------------------------------------------------------------

## Features

### Feature: Authentication

- ID: F-001
- Status: Done
- Description
- - User can log in with email and password
- - User can log out to end session
- - Auth state persists across page reloads (cookie or stored token)
- - Unauthenticated users are redirected to login page
- User Flow
- - Navigate to `/login`
- - Enter email and password
- - Click "Login" button
- - If valid: redirect to task list
- - If invalid: show validation error messages
- - Click "Logout": session ends, redirect to login
- Technical Notes
- - Sanctum with cookie session or Bearer token
- - Auth state in Pinia store, persisted via cookie or localStorage
- - Route middleware checks auth before protected pages
- Test Spec
- - Navigate to `/tasks` without auth -> redirect to `/login`
- - Submit login with valid credentials -> redirect to `/tasks`
- - Submit login with invalid credentials -> error message displayed
- - Click logout -> redirected to `/login`, `/tasks` inaccessible

### Feature: Task CRUD

- ID: F-002
- Status: Done
- Description
- - User can view a paginated list of their tasks
- - User can create a new task with title, description, due_date, status
- - User can view a single task's details
- - User can edit a task (title, description, due_date, status)
- - User can delete a task
- - All CRUD operations work without full page reload (SPA)
- User Flow
- - On `/tasks`, see list of tasks sorted/filtered
- - Click "Add Task" -> form appears -> fill fields -> submit -> task appears in list
- - Click task or "Edit" -> edit modal/form opens -> change fields -> save -> list updates
- - Click "Delete" -> confirm -> task removed from list
- Technical Notes
- - Endpoints: GET/POST /api/tasks, GET/PUT/DELETE /api/tasks/{id}
- - Modal or inline editing without page reload
- - Optimistic UI updates or refetch after mutation
- Test Spec
- - Create task with valid data -> appears in list
- - Create task with empty title -> validation error shown
- - Edit task title -> list shows updated title
- - Delete task -> removed from list
- - View task detail -> correct data displayed

### Feature: Access Control (Owner-only)

- ID: F-003
- Status: Done
- Description
- - Tasks are scoped to their owner
- - A user can only see, edit, and delete their own tasks
- - Unauthorized access returns 403 JSON error
- - Admin role can optionally see and manage all tasks
- User Flow
- - User A logs in -> sees only User A's tasks
- - User B logs in -> sees only User B's tasks
- - User A tries to edit User B's task directly via API -> 403 error
- Technical Notes
- - Laravel Policy gates: `view`, `create`, `update`, `delete`
- - Controller uses `$this->authorize()` or `Gate::allows()`
- - Frontend conditionally shows edit/delete buttons based on ownership
- Test Spec
- - Authenticate as user A, try to DELETE user B's task -> 403
- - Authenticate as user A, GET /api/tasks returns only user A's tasks

### Feature: Server-side Validation

- ID: F-004
- Status: Done
- Description
- - All incoming data is validated on the server using Form Request classes
- - Title is required, 3-255 characters
- - Status must be one of: pending, in_progress, completed
- - Due date must be a valid date if provided
- - Validation errors return 422 with structured JSON
- User Flow
- - Submit task with empty title -> see field error "Title is required"
- - Submit task with 1-char title -> see field error "Title must be at least 3 characters"
- - Submit task with invalid status -> see field error "Invalid status selected"
- Technical Notes
- - Form Request classes per action: `StoreTaskRequest`, `UpdateTaskRequest`
- - Login validation in `LoginRequest`
- - Frontend parses 422 response and displays per-field errors
- Test Spec
- - POST /api/tasks with empty title -> 422, error for `title` field
- - POST /api/tasks with status "invalid" -> 422, error for `status` field
- - POST /api/tasks with valid data -> 201, task created

### Feature: Unified JSON Error Handling

- ID: F-005
- Status: Done
- Description
- - All API errors return consistent JSON format
- - 401: Unauthenticated
- - 403: Forbidden (not owner)
- - 404: Resource not found
- - 422: Validation errors with field details
- - 500: Server error (generic message)
- User Flow
- - Request without token -> 401 JSON: `{"message": "Unauthenticated"}`
- - Request for non-existent task -> 404 JSON: `{"message": "Not found"}`
- - Request for another user's task -> 403 JSON: `{"message": "Forbidden"}`
- Technical Notes
- - Laravel exception handler customized in `bootstrap/app.php`
- - `render()` method returns JSON for API routes
- - Frontend error interceptor parses and displays appropriate messages
- Test Spec
- - GET /api/tasks without auth header -> 401
- - GET /api/tasks/99999 -> 404

### Feature: Task List Filtering, Sorting & States

- ID: F-006
- Status: Done
- Description
- - Tasks can be sorted by due_date and status
- - Tasks can be filtered by status (pending, in_progress, completed)
- - Search by title with debounce
- - Loading state shown while fetching
- - Empty state shown when no tasks match filter
- - Error state shown when API fails
- User Flow
- - On `/tasks`, see all tasks sorted by default (e.g. due_date ASC)
- - Click "Sort by Status" -> tasks reorder by status
- - Select filter "Completed" -> only completed tasks shown
- - Type in search box -> list filters by title after 300ms debounce
- - If no tasks exist -> see "No tasks yet" empty state
- - If API fails -> see error message with retry option
- Technical Notes
- - Query params: `sort`, `filter[status]`, `search`, `page`
- - Debounce 300ms implemented via custom timer in `useTaskFilters` composable
- - URL query parameters synced with filter state for shareable URLs
- - Pagination controls at bottom of list
- Test Spec
- - Filter by status -> only matching tasks shown
- - Search by title -> only matching tasks shown
- - Empty state visible when no tasks exist
- - Error state visible when API is unreachable

### Feature: Admin Role

- ID: F-007
- Status: Done
- Description
- - Admin role can view, edit and delete all tasks
- - Admin sees all users' tasks in the list
- - Non-admin users only see their own tasks
- - Edit/delete buttons hidden for non-owner non-admin users
- User Flow
- - Admin logs in -> sees all tasks from all users
- - Admin edits any task -> save succeeds
- - Regular user sees no edit/delete buttons on other users' tasks
- Technical Notes
- - `is_admin` boolean column on users table or roles table
- - Policy gates check `$user->is_admin()` before ownership
- - Frontend checks `user.is_admin` or task ownership to show/hide actions
- Test Spec
- - Admin GET /api/tasks -> returns tasks from all users
- - Admin DELETE task owned by another user -> 200
- - Regular user DELETE task owned by another user -> 403

### Feature: Search with Debounce

- ID: F-008
- Status: Done
- Description
- - Search tasks by title with debounced input
- - Search query synced to URL query parameter
- - Backend searches title column with LIKE or full-text
- User Flow
- - Type in search field -> after 300ms pause, list filters by title
- - Share URL with `?search=...` -> page loads with search applied
- - Clear search -> full list restored
- Technical Notes
- - Debounce 300ms via custom timer in `useTaskFilters` composable
- - URL query string synced via `useRoute()` / `useRouter()`
- - Backend: `Task::where('title', 'like', "%{$search}%")`
- Test Spec
- - Type search term -> list updates after debounce
- - URL contains `?search=term` after typing

### Feature: Pagination

- ID: F-009
- Status: Done
- Description
- - API returns paginated results with `meta.total`, `meta.per_page`, `meta.current_page`
- - Frontend shows page navigation (prev/next, page numbers)
- - Page number synced to URL query parameter
- User Flow
- - On `/tasks`, see first 10-15 tasks
- - Click "Next" -> second page loads, URL updates to `?page=2`
- - Apply filter + change page -> filtered results on selected page
- Technical Notes
- - Laravel `LengthAwarePaginator` via `Model::paginate()`
- - Frontend pagination component with prev/next and page buttons
- - Test Spec
- - GET /api/tasks?page=1 -> returns first page with meta
- - GET /api/tasks?page=999 -> returns empty data with meta

### Feature: Unit & Feature Tests

- ID: F-010
- Status: Done
- Description
- - Laravel feature tests for authentication endpoints
- - Laravel feature tests for task CRUD with ownership validation
- - Frontend unit tests (Vitest) for stores and utilities
- - End-to-end tests (Playwright) for auth, CRUD, filters, admin role, error codes
- User Flow
- - Run `php artisan test` -> all backend tests pass
- - Run `npm run test` (frontend) -> all unit tests pass
- - Run `npm run test:e2e` -> all e2e tests pass
- Technical Notes
- - Backend: PHPUnit with Laravel test helpers, SQLite in-memory database
- - Frontend unit: Vitest with Vue Test Utils
- - Frontend e2e: Playwright with Chromium, auto-starts Laravel + Nuxt servers
- - Test Spec
- - `php artisan test` exits with 0
- - Frontend test suite exits with 0

### Feature: OpenAPI / Swagger Documentation

- ID: F-011
- Status: Done
- Description
- - API endpoints documented with OpenAPI/Swagger
- - Swagger UI available at `/api/documentation`
- - Request/response schemas documented
- User Flow
- - Navigate to `/api/documentation` -> see interactive API docs
- - Try endpoints directly from Swagger UI
- Technical Notes
- - `darkaonline/l5-swagger` package for Laravel
- - Annotations on controllers and Form Requests
- - Test Spec
- - GET /api/documentation -> 200, valid Swagger UI page

// # ------------------------------------------------------------------------------------------------

## API Reference

### Auth

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/login` | Authenticate user, return token or set session | public |
| POST | `/api/auth/logout` | End session, invalidate token | auth |

### User

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/user` | Get current authenticated user | auth |

### Tasks

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/tasks` | List tasks with sort, filter, search, pagination | auth |
| POST | `/api/tasks` | Create a new task | auth |
| GET | `/api/tasks/{id}` | Get single task by ID | auth |
| PUT/PATCH | `/api/tasks/{id}` | Update task | owner/admin |
| DELETE | `/api/tasks/{id}` | Delete task | owner/admin |

### Standard Error Codes

| Code | Description |
|---|---|
| 401 | Unauthenticated — no or invalid token |
| 403 | Forbidden — not the owner and not admin |
| 404 | Resource not found |
| 422 | Validation errors — field-level details in response |
| 500 | Internal server error |

// # ------------------------------------------------------------------------------------------------

## Database Schema

### users

| Column | Type | Description |
|---|---|---|
| id | integer / uuid | Primary key |
| name | string | User display name |
| email | string | User email, unique |
| password | string | bcrypt hash |
| is_admin | boolean nullable | Admin flag (bonus feature) |
| created_at | datetime | Auto-generated |
| updated_at | datetime | Auto-generated |

### tasks

| Column | Type | Description |
|---|---|---|
| id | integer / uuid | Primary key |
| user_id | integer / uuid | FK to users.id, task owner |
| title | string | Required, 3-255 characters |
| description | text nullable | Task details |
| due_date | date nullable | Deadline |
| status | enum | pending, in_progress, completed |
| created_at | datetime | Auto-generated |
| updated_at | datetime | Auto-generated |

### personal_access_tokens (Sanctum)

| Column | Type | Description |
|---|---|---|
| id | integer | Primary key |
| tokenable_type | string | Morph class (User) |
| tokenable_id | integer | FK to users.id |
| name | string | Token name |
| token | string | Hash of token |
| abilities | text nullable | Token permissions |
| last_used_at | datetime nullable | Last usage timestamp |
| expires_at | datetime nullable | Token expiry |
| created_at | datetime | Auto-generated |
| updated_at | datetime | Auto-generated |

// # ------------------------------------------------------------------------------------------------

## State Management

| Store | Storage | Key | Description |
|---|---|---|---|
| AuthStore | localStorage | `auth` | Current user, token, isAuthenticated flag |
| TaskStore | in-memory | — | Task list, current filters, sort, search, pagination meta |

// # ------------------------------------------------------------------------------------------------

*Future ideas:*
- Dark mode toggle
- Task categories / tags
- Due date reminders / notifications
- Drag-and-drop task reordering
- CSV export of tasks
- WebSocket real-time updates for multi-user collaboration
