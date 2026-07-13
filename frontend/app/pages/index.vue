<template>
  <div />
</template>

<script setup lang="ts">
  definePageMeta({
    middleware: (_to) => {
      if (import.meta.server) return;
      const auth = useAuthStore();
      auth.init();
      if (auth.isAuthenticated) {
        return navigateTo('/tasks');
      }
      return navigateTo('/login');
    },
  });
</script>
