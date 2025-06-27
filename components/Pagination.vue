<template>
  <div v-if="totalPages > 1" class="pagination">
    <button 
      class="pagination-button" 
      :disabled="currentPage === 1"
      @click="onPageChange(currentPage - 1)"
    >
      &laquo; Previous
    </button>
    
    <div class="pagination-info">
      Page {{ currentPage }} of {{ totalPages }}
    </div>
    
    <button 
      class="pagination-button" 
      :disabled="currentPage >= totalPages"
      @click="onPageChange(currentPage + 1)"
    >
      Next &raquo;
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  totalResults: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['page-change']);

const onPageChange = (page) => {
  if (page < 1 || page > props.totalPages) return;
  emit('page-change', page);
};
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1rem 0;
}

.pagination-button {
  padding: 0.5rem 1rem;
  background-color: var(--secondary-bg);
  color: var(--primary-text);
  border: 1px solid var(--accent-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: var(--accent-color);
  color: #fff;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: var(--secondary-text);
}

.pagination-info {
  color: var(--secondary-text);
  font-size: 0.9rem;
}
</style>
