<template>
  <div>
    <header class="header">
      <h1>My Tasks</h1>
      <div class="header-actions">
        <button class="btn-primary" @click="modals.openCreate">+ New Task</button>
        <button class="btn-logout" @click="handleLogout">Logout</button>
      </div>
    </header>

    <main class="main">
      <div class="toolbar">
        <input v-model="filters.search.value" type="text" placeholder="Search tasks..." class="search-input" />
        <select v-model="filters.statusFilter.value" class="filter-select">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select v-model="filters.sortBy.value" class="filter-select">
          <option value="">Newest</option>
          <option value="due_date">Due Date</option>
          <option value="status">Status</option>
        </select>
      </div>

      <section class="tasks-section">
        <div v-if="taskStore.loading" class="state-msg">Loading tasks...</div>
        <div v-else-if="taskStore.error" class="state-msg error-msg">{{ taskStore.error }}</div>
        <div v-else-if="taskStore.tasks.length === 0" class="state-msg">No tasks yet. Create one!</div>
        <ul v-else class="task-list">
          <li v-for="task in taskStore.tasks" :key="task.id" class="task-card">
            <div class="task-body" @click="modals.openEdit(task)">
              <span class="task-title">{{ task.title }}</span>
              <span v-if="task.description" class="task-desc">{{ task.description }}</span>
              <div class="task-meta">
                <span class="task-status" :class="task.status">{{ statusLabel(task.status) }}</span>
                <span v-if="task.due_date" class="task-date">{{ formatDate(task.due_date) }}</span>
              </div>
            </div>
            <div class="task-actions">
              <button v-if="auth.canModify(task)" class="btn-sm" @click.stop="modals.openEdit(task)">Edit</button>
              <button v-if="auth.canModify(task)" class="btn-sm btn-danger" @click.stop="modals.confirmDelete(task)">
                Delete
              </button>
            </div>
          </li>
        </ul>

        <div v-if="taskStore.meta && taskStore.meta.last_page > 1" class="pagination">
          <button :disabled="taskStore.meta.current_page <= 1" @click="filters.goPage(taskStore.meta.current_page - 1)">
            Prev
          </button>
          <span class="page-info"> Page {{ taskStore.meta.current_page }} of {{ taskStore.meta.last_page }} </span>
          <button
            :disabled="taskStore.meta.current_page >= taskStore.meta.last_page"
            @click="filters.goPage(taskStore.meta.current_page + 1)"
          >
            Next
          </button>
        </div>
      </section>
    </main>

    <TaskForm :show="modals.showForm.value" :task="modals.editingTask.value" @close="modals.closeForm" @saved="load" />

    <ConfirmDialog
      :show="modals.showConfirm.value"
      :message="modals.confirmMessage.value"
      :loading="modals.deleting.value"
      @confirm="onDelete"
      @cancel="modals.cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
  definePageMeta({ middleware: 'auth' });

  const taskStore = useTaskStore();
  const auth = useAuthStore();
  const filters = useTaskFilters();
  const modals = useTaskModals();

  function statusLabel(s: string) {
    const map: Record<string, string> = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };
    return map[s] || s;
  }

  function formatDate(d: string) {
    return d.slice(0, 10);
  }

  function load() {
    taskStore.fetchTasks({
      page: filters.currentPage.value,
      search: filters.search.value || undefined,
      status: filters.statusFilter.value || undefined,
      sort: filters.sortBy.value || undefined,
    });
  }

  filters.onChange(() => load());

  async function onDelete() {
    await modals.executeDelete((id) => taskStore.deleteTask(id));
  }

  async function handleLogout() {
    await auth.logout();
  }

  onMounted(() => load());
</script>

<style scoped>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: white;
    border-bottom: 1px solid #e2e8f0;
  }

  .header h1 {
    margin: 0;
    font-size: 1.25rem;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-logout {
    padding: 0.375rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .btn-primary {
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 4px;
    background: #3182ce;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .main {
    max-width: 720px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .toolbar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .search-input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .filter-select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.875rem;
    background: white;
  }

  .state-msg {
    text-align: center;
    padding: 3rem 1rem;
    color: #666;
  }

  .error-msg {
    color: #e53e3e;
  }

  .task-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .task-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    gap: 1rem;
  }

  .task-body {
    flex: 1;
    cursor: pointer;
    min-width: 0;
  }

  .task-title {
    display: block;
    font-weight: 600;
    margin-bottom: 0.125rem;
  }

  .task-desc {
    display: block;
    font-size: 0.8rem;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .task-meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-top: 0.25rem;
  }

  .task-date {
    font-size: 0.75rem;
    color: #888;
  }

  .task-status {
    font-size: 0.7rem;
    padding: 0.125rem 0.5rem;
    border-radius: 99px;
    text-transform: capitalize;
  }

  .task-status.pending {
    background: #fefcbf;
    color: #744210;
  }

  .task-status.in_progress {
    background: #bee3f8;
    color: #2a4365;
  }

  .task-status.completed {
    background: #c6f6d5;
    color: #22543d;
  }

  .task-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 0.75rem;
  }

  .btn-sm.btn-danger {
    border-color: #fed7d7;
    color: #e53e3e;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .pagination button {
    padding: 0.375rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .pagination button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .page-info {
    font-size: 0.875rem;
    color: #666;
  }
</style>
