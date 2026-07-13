import { defineStore } from 'pinia';
import type { ApiError } from '~/types/api';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

interface Meta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);
  const meta = ref<Meta | null>(null);
  const loading = ref(false);
  const error = ref('');

  function apiUrl(path: string) {
    const config = useRuntimeConfig();
    return `${config.public.apiBase}${path}`;
  }

  function authHeaders() {
    const auth = useAuthStore();
    return { Authorization: `Bearer ${auth.token}` };
  }

  async function fetchTasks(opts?: { page?: number; search?: string; status?: string; sort?: string }) {
    loading.value = true;
    error.value = '';
    try {
      const params = new URLSearchParams();
      if (opts?.page) {
        params.set('page', String(opts.page));
      }
      if (opts?.search) {
        params.set('search', opts.search);
      }
      if (opts?.status) {
        params.set('filter[status]', opts.status);
      }
      if (opts?.sort) {
        params.set('sort', opts.sort);
      }
      const qs = params.toString();
      const res = await $fetch<{ data: Task[]; meta: Meta }>(apiUrl(`/tasks${qs ? `?${qs}` : ''}`), {
        headers: authHeaders(),
      });
      tasks.value = res.data;
      meta.value = res.meta;
    } catch (e: unknown) {
      const err = e as ApiError;
      if (err.status !== 401) {
        error.value = err?.data?.message || 'Failed to load tasks.';
      }
    } finally {
      loading.value = false;
    }
  }

  async function createTask(data: {
    title: string;
    description?: string | null;
    due_date?: string | null;
    status?: string;
  }) {
    error.value = '';
    try {
      const res = await $fetch<{ data: Task }>(apiUrl('/tasks'), {
        method: 'POST',
        headers: authHeaders(),
        body: data,
      });
      await fetchTasks({ page: meta.value?.current_page || 1 });
      return { ok: true, task: res.data };
    } catch (e: unknown) {
      const err = e as ApiError;
      if (err.status === 422) {
        return { ok: false, errors: err.data?.errors || {} };
      }
      if (err.status !== 401) {
        error.value = err?.data?.message || 'Failed to create task.';
      }
      return { ok: false, errors: {} };
    }
  }

  async function updateTask(
    id: number,
    data: { title?: string; description?: string | null; due_date?: string | null; status?: string }
  ) {
    error.value = '';
    try {
      const res = await $fetch<{ data: Task }>(apiUrl(`/tasks/${id}`), {
        method: 'PUT',
        headers: authHeaders(),
        body: data,
      });
      const idx = tasks.value.findIndex((t) => t.id === id);
      if (idx !== -1) {
        tasks.value[idx] = res.data;
      }
      return { ok: true, errors: {} };
    } catch (e: unknown) {
      const err = e as ApiError;
      if (err.status === 422) {
        return { ok: false, errors: err.data?.errors || {} };
      }
      if (err.status !== 401) {
        error.value = err?.data?.message || 'Failed to update task.';
      }
      return { ok: false, errors: {} };
    }
  }

  async function deleteTask(id: number) {
    error.value = '';
    try {
      await $fetch(apiUrl(`/tasks/${id}`), {
        method: 'DELETE',
        headers: authHeaders(),
      });
      tasks.value = tasks.value.filter((t) => t.id !== id);
      return true;
    } catch (e: unknown) {
      const err = e as ApiError;
      if (err.status !== 401) {
        error.value = err?.data?.message || 'Failed to delete task.';
      }
      return false;
    }
  }

  return { tasks, meta, loading, error, fetchTasks, createTask, updateTask, deleteTask };
});
