<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Todo App</h1>
      <p class="subtitle">Sign in to manage your tasks</p>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="test@example.com" required />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="password" required />
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <button type="button" class="btn btn-guest" @click="guestLogin" :disabled="loading">Guest Enter</button>
      </form>

      <p class="switch">Don't have an account? <NuxtLink to="/register">Sign Up</NuxtLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ApiError } from '~/types/api';

  const email = ref('');
  const password = ref('');
  const error = ref('');
  const loading = ref(false);
  const auth = useAuthStore();

  async function handleLogin() {
    error.value = '';
    loading.value = true;
    try {
      await auth.login(email.value, password.value);
      await navigateTo('/tasks');
    } catch (e: unknown) {
      const apiErr = e as ApiError;
      error.value = apiErr?.data?.message || 'Login failed. Please try again.';
    } finally {
      loading.value = false;
    }
  }

  async function guestLogin() {
    email.value = 'test@example.com';
    password.value = 'password';
    await handleLogin();
  }
</script>

<style scoped>
  .login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f5f5f5;
  }

  .login-card {
    width: 360px;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin: 0 0 0.25rem;
    font-size: 1.5rem;
  }

  .subtitle {
    margin: 0 0 1.5rem;
    color: #666;
  }

  .field {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
    font-size: 0.875rem;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .error {
    color: #e53e3e;
    margin: 0.5rem 0;
    font-size: 0.875rem;
  }

  .btn {
    width: 100%;
    padding: 0.625rem;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 0.5rem;
  }

.btn-guest {
  background: #38a169;
}

.switch {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.switch a {
  color: #3182ce;
  text-decoration: none;
  font-weight: 600;
}

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
