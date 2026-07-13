<template>
  <div />
</template>

<script setup lang="ts">
  definePageMeta({
    middleware: (_to) => {
      const auth = useAuthStore();
      auth.init();
      if (auth.isAuthenticated) {
        return navigateTo('/tasks');
      }
      return navigateTo('/login');
    },
  });
</script>
