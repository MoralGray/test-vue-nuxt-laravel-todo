<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <h2>{{ isEdit ? 'Edit Task' : 'New Task' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="field">
            <label for="title">Title *</label>
            <input id="title" v-model="form.title" type="text" placeholder="Task title" />
            <p v-if="errors.title" class="field-error">{{ errors.title[0] }}</p>
          </div>

          <div class="field">
            <label for="description">Description</label>
            <textarea id="description" v-model="form.description" placeholder="Optional description" rows="3" />
          </div>

          <div class="field">
            <label for="due_date">Due Date</label>
            <input id="due_date" v-model="form.due_date" type="date" />
            <p v-if="errors.due_date" class="field-error">{{ errors.due_date[0] }}</p>
          </div>

          <div class="field">
            <label for="status">Status</label>
            <select id="status" v-model="form.status">
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <p v-if="errors.status" class="field-error">{{ errors.status[0] }}</p>
          </div>

          <div class="actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">Cancel</button>
            <button type="submit" class="btn-save" :disabled="submitting">
              {{ submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import type { Task } from '~/stores/tasks';

  const props = defineProps<{
    show: boolean;
    task?: Task | null;
  }>();

  const emit = defineEmits<{
    close: [];
    saved: [];
  }>();

  const isEdit = computed(() => !!props.task);
  const taskStore = useTaskStore();
  const submitting = ref(false);
  const errors = ref<Record<string, string[]>>({});

  const form = reactive({
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
  });

  watch(
    () => props.show,
    (val) => {
      if (val) {
        if (props.task) {
          form.title = props.task.title;
          form.description = props.task.description || '';
          form.due_date = props.task.due_date ? props.task.due_date.slice(0, 10) : '';
          form.status = props.task.status;
        } else {
          form.title = '';
          form.description = '';
          form.due_date = '';
          form.status = 'pending';
        }
        errors.value = {};
      }
    }
  );

  function validate(): boolean {
    errors.value = {};
    if (!form.title.trim() || form.title.trim().length < 3) {
      errors.value.title = ['Title must be at least 3 characters.'];
    }
    if (form.due_date && Number.isNaN(Date.parse(form.due_date))) {
      errors.value.due_date = ['Invalid date format.'];
    }
    if (!['pending', 'in_progress', 'completed'].includes(form.status)) {
      errors.value.status = ['Invalid status.'];
    }
    return Object.keys(errors.value).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      return;
    }

    submitting.value = true;
    errors.value = {};

    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      due_date: form.due_date || null,
      status: form.status,
    };

    let result;
    if (isEdit.value && props.task) {
      result = await taskStore.updateTask(props.task.id, payload);
    } else {
      result = await taskStore.createTask(payload);
    }

    submitting.value = false;

    if (result.ok) {
      emit('saved');
      emit('close');
    } else {
      errors.value = result.errors || {};
    }
  }
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }

  .modal-card {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    width: 440px;
    max-width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  h2 {
    margin: 0 0 1.25rem;
    font-size: 1.25rem;
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

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
    font-family: inherit;
  }

  textarea {
    resize: vertical;
  }

  .field-error {
    color: #e53e3e;
    font-size: 0.8rem;
    margin: 0.25rem 0 0;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }

  .btn-cancel {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }

  .btn-save {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #3182ce;
    color: white;
    cursor: pointer;
  }

  .btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    .modal-overlay {
      padding: 0;
      align-items: flex-end;
    }

    .modal-card {
      width: 100%;
      max-height: 90vh;
      border-radius: 12px 12px 0 0;
      padding: 1.5rem;
    }

    .actions {
      flex-direction: column;
    }

    .btn-cancel,
    .btn-save {
      width: 100%;
      text-align: center;
      padding: 0.75rem;
    }
  }
</style>
