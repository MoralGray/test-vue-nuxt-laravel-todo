import type { Task } from '~/stores/tasks';

export const useTaskModals = () => {
  const showForm = ref(false);
  const editingTask = ref<Task | null>(null);
  const showConfirm = ref(false);
  const confirmMessage = ref('');
  const deleteTarget = ref<Task | null>(null);
  const deleting = ref(false);

  function openCreate() {
    editingTask.value = null;
    showForm.value = true;
  }

  function openEdit(task: Task) {
    editingTask.value = task;
    showForm.value = true;
  }

  function closeForm() {
    showForm.value = false;
    editingTask.value = null;
  }

  function confirmDelete(task: Task) {
    deleteTarget.value = task;
    confirmMessage.value = `Delete task "${task.title}"?`;
    showConfirm.value = true;
  }

  function cancelDelete() {
    showConfirm.value = false;
    deleteTarget.value = null;
  }

  async function executeDelete(deleteFn: (id: number) => Promise<boolean>) {
    if (!deleteTarget.value) {
      return;
    }
    deleting.value = true;
    const ok = await deleteFn(deleteTarget.value.id);
    deleting.value = false;
    showConfirm.value = false;
    deleteTarget.value = null;
    return ok;
  }

  return {
    showForm,
    editingTask,
    showConfirm,
    confirmMessage,
    deleteTarget,
    deleting,
    openCreate,
    openEdit,
    closeForm,
    confirmDelete,
    cancelDelete,
    executeDelete,
  };
};
