import type { Task } from '~/stores/tasks';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

function isValidAuthData(data: unknown): data is { token: string; user: User } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'token' in data &&
    typeof (data as Record<string, unknown>).token === 'string' &&
    'user' in data &&
    typeof (data as Record<string, unknown>).user === 'object'
  );
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => !!token.value);

  function canModify(task: Task): boolean {
    if (!user.value) {
      return false;
    }
    return user.value.is_admin || user.value.id === task.user_id;
  }

  function init() {
    if (!import.meta.client) return;
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isValidAuthData(parsed)) {
          token.value = parsed.token;
          user.value = parsed.user;
        } else {
          localStorage.removeItem('auth');
        }
      } catch {
        localStorage.removeItem('auth');
      }
    }
  }

  async function login(email: string, password: string) {
    const config = useRuntimeConfig();
    const res = await $fetch<{ message: string; data: { user: User; token: string } }>(
      `${config.public.apiBase}/auth/login`,
      {
        method: 'POST',
        body: { email, password },
      }
    );
    token.value = res.data.token;
    user.value = res.data.user;
    persist();
    return res;
  }

  async function logout() {
    const config = useRuntimeConfig();
    try {
      await $fetch(`${config.public.apiBase}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
      });
    } catch {
      // logout API failure is non-blocking — clear state anyway
    } finally {
      token.value = null;
      user.value = null;
      persist();
      navigateTo('/login');
    }
  }

  function persist() {
    if (!import.meta.client) return;
    if (token.value) {
      localStorage.setItem('auth', JSON.stringify({ token: token.value, user: user.value }));
    } else {
      localStorage.removeItem('auth');
    }
  }

  return { user, token, isAuthenticated, canModify, init, login, logout };
});
