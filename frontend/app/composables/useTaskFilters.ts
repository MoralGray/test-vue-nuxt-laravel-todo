export const useTaskFilters = () => {
  const route = useRoute();
  const router = useRouter();

  const search = ref((route.query.search as string) || '');
  const statusFilter = ref((route.query.status as string) || '');
  const sortBy = ref((route.query.sort as string) || '');
  const currentPage = ref(Number(route.query.page) || 1);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let callback: (() => void) | null = null;

  function onChange(fn: () => void) {
    callback = fn;
  }

  function notify() {
    callback?.();
  }

  watch(search, () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      currentPage.value = 1;
      syncUrl();
      notify();
    }, 300);
  });

  watch([statusFilter, sortBy], () => {
    currentPage.value = 1;
    syncUrl();
    notify();
  });

  function syncUrl() {
    const query: Record<string, string> = {};
    if (search.value) {
      query.search = search.value;
    }
    if (statusFilter.value) {
      query.status = statusFilter.value;
    }
    if (sortBy.value) {
      query.sort = sortBy.value;
    }
    if (currentPage.value > 1) {
      query.page = String(currentPage.value);
    }
    router.replace({ query });
  }

  function goPage(page: number) {
    currentPage.value = page;
    syncUrl();
    notify();
  }

  return { search, statusFilter, sortBy, currentPage, goPage, onChange, syncUrl, notify };
};
