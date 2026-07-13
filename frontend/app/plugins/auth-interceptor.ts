export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return;
  }

  let loggingOut = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const res = await originalFetch(input, init);
    if (res.status === 401 && !loggingOut) {
      loggingOut = true;
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/api/')) {
        const auth = useAuthStore();
        await auth.logout();
      }
    }
    return res;
  };
});
