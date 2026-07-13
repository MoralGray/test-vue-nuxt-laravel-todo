<template>
  <div class="register-page">
    <div class="register-card">
      <h1>Todo App</h1>
      <p class="subtitle">Create your account</p>

      <form @submit.prevent="handleRegister">
        <div class="field">
          <label for="name">Name</label>
          <input id="name" v-model="name" type="text" placeholder="Your name" required />
          <p v-if="errors.name" class="field-error">{{ errors.name[0] }}</p>
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="you@example.com" required />
          <p v-if="errors.email" class="field-error">{{ errors.email[0] }}</p>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="Min 8 characters" required />
          <p v-if="errors.password" class="field-error">{{ errors.password[0] }}</p>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn">
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>
      </form>

      <p class="switch">Already have an account? <NuxtLink to="/login">Sign In</NuxtLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiError } from '~/types/api';

const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const errors = ref<Record<string, string[]>>({});
const loading = ref(false);
const auth = useAuthStore();

async function handleRegister() {
  error.value = '';
  errors.value = {};
  loading.value = true;

  const config = useRuntimeConfig();

  try {
    const res = await $fetch<{ data: { user: any; token: string } }>(
      `${config.public.apiBase}/auth/register`,
      {
        method: 'POST',
        body: { name: name.value, email: email.value, password: password.value },
      }
    );
    await auth.login(email.value, password.value);
    await navigateTo('/tasks');
  } catch (e: unknown) {
    const apiErr = e as ApiError;
    if (apiErr?.data?.errors) {
      errors.value = apiErr.data.errors;
    } else {
      error.value = apiErr?.data?.message || 'Registration failed.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.register-card {
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

.field-error {
  color: #e53e3e;
  font-size: 0.8rem;
  margin: 0.25rem 0 0;
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
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
</style>
