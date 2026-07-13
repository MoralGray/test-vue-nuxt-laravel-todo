<template>
  <Teleport to="body">
    <div v-if="show" class="confirm-overlay" @click.self="$emit('cancel')">
      <div class="confirm-card">
        <p>{{ message }}</p>
        <div class="actions">
          <button class="btn-cancel" @click="$emit('cancel')">Cancel</button>
          <button class="btn-danger" :disabled="loading" @click="$emit('confirm')">
            {{ loading ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  defineProps<{
    show: boolean;
    message: string;
    loading?: boolean;
  }>();

  defineEmits<{
    confirm: [];
    cancel: [];
  }>();
</script>

<style scoped>
  .confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: 1rem;
  }

  .confirm-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    width: 360px;
    max-width: 100%;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  p {
    margin: 0 0 1.25rem;
    font-size: 1rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .btn-cancel {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }

  .btn-danger {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #e53e3e;
    color: white;
    cursor: pointer;
  }

  .btn-danger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    .confirm-overlay {
      padding: 0;
      align-items: flex-end;
    }

    .confirm-card {
      width: 100%;
      border-radius: 12px 12px 0 0;
    }

    .actions {
      flex-direction: column;
    }

    .btn-cancel,
    .btn-danger {
      width: 100%;
      text-align: center;
      padding: 0.75rem;
    }
  }
</style>
