# test-vue-nuxt-laravel TODO

<!-- Created by mg-todo skill. Epics are independent, 4-15 items each. -->

## epic-auth | Authentication (Sanctum login/logout/guard/persist)
- [DONE] Scaffold Laravel project with Sanctum
- [DONE] Create LoginRequest Form Request with email/password validation
- [DONE] Implement AuthController with login and logout methods
- [DONE] Configure Sanctum for SPA cookie session (SESSION_DRIVER, SANCTUM_STATEFUL_DOMAINS, CORS)
- [DONE] Create UserSeeder with test user (test@example.com / password)
- [DONE] Seed 15 test tasks with various statuses and due dates
- [DONE] Scaffold Nuxt project with Pinia and routing
- [DONE] Implement auth store (Pinia) with login/logout/user state
- [DONE] Create login page with email/password form and validation errors
- [DONE] Implement auth route middleware (redirect to /login on unauthenticated)
- [DONE] Handle 401 from any API call globally (axios interceptor or useFetch hook)
- [DONE] Verify: login with valid creds redirects to /tasks
- [DONE] Verify: login with invalid creds shows error message
- [DONE] Verify: logout clears session and redirects to /login
- [DONE] Verify: accessing /tasks without auth redirects to /login

## epic-task-backend | Task API (migration, model, requests, controller, routes)
- [DONE] Create tasks migration with all fields (title, description, due_date, status enum)
- [DONE] Create Task model with fillable/guarded, casts (status enum, dates)
- [DONE] Create StoreTaskRequest with title required 3-255, status in enum, due_date nullable date
- [DONE] Create UpdateTaskRequest with same rules (title optional on PATCH)
- [DONE] Implement TaskController with index, store, show, update, destroy
- [DONE] Define API routes in routes/api.php with sanctum auth middleware
- [DONE] Return tasks as JSON with data wrapper and 201/200 response codes
- [DONE] Verify: create task with valid data returns 201
- [DONE] Verify: create task with empty title returns 422
- [DONE] Verify: update task returns 200 with updated data
- [DONE] Verify: delete task returns 200 or 204

## epic-task-frontend | Task UI (components, forms, client validation)
- [DONE] Scaffold Nuxt task pages and components (TaskList, TaskForm, TaskCard)
- [DONE] Implement create task form with title, description, due_date, status fields
- [DONE] Implement edit task modal/form with pre-filled data
- [DONE] Implement delete task with confirmation dialog
- [DONE] Add client-side validation (title required, valid date, valid status)
- [DONE] Handle 422 validation errors from API and display per-field messages
- [DONE] Verify: create task form submits and task appears in list
- [DONE] Verify: edit task saves and list updates without page reload
- [DONE] Verify: delete task removes it from list with confirmation

## epic-access-control | Policy gates owner-only + admin role
- [DONE] Create TaskPolicy with view, create, update, delete methods
- [DONE] Scope tasks index to current user (Task::where('user_id', auth()->id()))
- [DONE] Register TaskPolicy in AuthServiceProvider
- [DONE] Apply authorize() calls in TaskController for update and destroy
- [DONE] Add is_admin boolean column to users migration
- [DONE] Update TaskPolicy to allow admin access to all tasks
- [DONE] Hide edit/delete buttons on frontend for non-owner non-admin users
- [DONE] Verify: user A cannot access or delete user B's task (403)
- [DONE] Verify: admin can view, edit, delete any task
- [DONE] Verify: regular user sees only their own tasks in list
- [DONE] Verify: edit/delete buttons hidden for unauthorized users

## epic-error-handling | Unified JSON error format (401/403/404/422/500)
- [DONE] Customize Laravel exception handler render() for API routes
- [DONE] Return 401 JSON with message for unauthenticated
- [DONE] Return 403 JSON with message for forbidden (policy deny)
- [DONE] Return 404 JSON with message for model not found
- [DONE] Return 422 JSON with field errors for validation failures
- [DONE] Return 500 JSON with generic message for unexpected errors
- [DONE] Ensure all non-API routes still render HTML (no bleed into web routes)
- [DONE] Implement frontend error interceptor to parse JSON errors
- [DONE] Display toast or inline error messages for 401, 403, 404, 422, 500
- [DONE] Verify: GET /api/tasks without token returns 401
- [DONE] Verify: GET /api/tasks/99999 returns 404
- [DONE] Verify: POST /api/tasks with bad data returns 422 with field errors

## epic-task-list-api | Backend filtering, search, sort, pagination
- [DONE] Add query parameter support to TaskController index: sort, filter[status], search, page
- [DONE] Implement backend search by title (LIKE %query%)
- [DONE] Implement backend filter by status (where status = filter[status])
- [DONE] Implement backend sort by due_date or status (orderBy)
- [DONE] Return paginated response with LengthAwarePaginator (meta: total, per_page, current_page)
- [DONE] Verify: filter[status]=completed returns only completed tasks
- [DONE] Verify: search=test returns tasks with test in title
- [DONE] Verify: sort=due_date returns tasks ordered by deadline
- [DONE] Verify: page=2 returns second page of paginated results
- [DONE] Verify: empty page returns empty data with meta

## epic-task-list-ui | Frontend filtering, search, sort, pagination, UX states
- [DONE] Implement frontend filter by status (dropdown/tabs: all, pending, in_progress, completed)
- [DONE] Implement frontend sort toggle by due_date and status
- [DONE] Implement search input with 300ms debounce
- [DONE] Sync filter/search/sort/page with URL query parameters
- [DONE] Show loading spinner/skeleton while fetching tasks
- [DONE] Show empty state when no tasks match filters
- [DONE] Show error state with retry button when API fails
- [DONE] Implement pagination component with prev/next and page numbers
- [DONE] Verify: filter by status shows only matching tasks
- [DONE] Verify: search by title filters list after debounce
- [DONE] Verify: URL contains search/filter/page query params
- [DONE] Verify: pagination controls work and page syncs to URL
- [DONE] Verify: empty state shows when no tasks exist

## epic-testing | PHPUnit backend + Vitest frontend tests
- [DONE] Configure PHPUnit with SQLite in-memory for testing
- [DONE] Write LoginTest: test login success, login invalid, logout, unauthenticated access
- [DONE] Write TaskCrudTest: test create, read, update, delete with valid/invalid data
- [DONE] Write TaskPolicyTest: test ownership scoping, admin access, 403 scenarios
- [DONE] Write TaskFilterTest: test status filter, search, sort, pagination
- [DONE] Write ErrorFormatTest: test 401, 403, 404, 422 response formats
- [DONE] Configure Vitest with Vue Test Utils or @vue/test-utils
- [DONE] Write auth store test: login, logout, isAuthenticated state
- [DONE] Write login page test: form render, submit valid, submit invalid
- [DONE] Write task list test: render tasks, filter works, empty state
- [DONE] Write task create test: form validation, successful creation
- [DONE] Verify: php artisan test passes all tests
- [DONE] Verify: frontend test suite passes all tests

## epic-swagger | OpenAPI / Swagger documentation
- [DONE] Install darkaonline/l5-swagger package
- [DONE] Configure l5-swagger with API info (title, version, description)
- [DONE] Add OpenAPI annotations to AuthController (login, logout)
- [DONE] Add OpenAPI annotations to TaskController (index, store, show, update, destroy)
- [DONE] Add OpenAPI schema definitions for Task and User models
- [DONE] Add OpenAPI security scheme for Sanctum bearer/cookie auth
- [DONE] Verify: GET /api/documentation returns 200 with Swagger UI
- [DONE] Verify: all 8 endpoints listed in Swagger with request/response schemas

## epic-arch-fixes | Architecture fixes from codebase review
- [DONE] Consolidate 401 handling into single plugin, remove per-store 401 checks
- [DONE] Add await to auth.logout() in auth-interceptor plugin
- [DONE] Add Vitest + @vue/test-utils for frontend testing
- [DONE] Write auth store tests (login, logout, isAuthenticated, init)
- [DONE] Write task store tests (fetch, create, update, delete)
- [DONE] Write TaskForm component tests (validation, submit, 422 errors)
- [DONE] Define shared ApiError type, replace all catch(e: any)
- [DONE] Extract useTaskFilters composable (search, debounce, URL sync)
- [DONE] Extract useTaskModals composable (showForm, editingTask, confirmDelete)
- [DONE] Add runtime validation to auth store init (JSON.parse guard)
- [DONE] Escape SQL LIKE wildcards (% and _) in TaskController search
- [DONE] Add per_page upper bound in TaskController index
- [DONE] Remove duplicate 401 handling in tasks store
- [DONE] Fix ErrorFormatTest to match actual AuthorizationException message
- [DONE] Add JSDoc to all exported store functions and composables

## epic-e2e | Playwright end-to-end tests
- [DONE] Install @playwright/test + chromium browser
- [DONE] Create playwright.config.ts with base URL
- [DONE] Write auth tests (login, invalid, guest, guard, logout, register)
- [DONE] Write task CRUD tests (list, create, validation, edit, delete)
- [DONE] Write task list tests (status filter, search, pagination)
- [DONE] Write admin role tests (admin tasks count, regular empty, UI visibility, button hiding)
- [DONE] Write API error tests (401, 404, 422)
- [DONE] Add test:e2e script to package.json
- [DONE] Add e2e task to mise.toml

## Removed

## epic-docker | Docker Compose (removed — not needed for bare-metal deployment)

