<template>
  <div class="loader-container">
    <div class="dots-loader">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
});
</script>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  width: 100%;
}

.dots-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: var(--dot-size, 10px);
  height: var(--dot-size, 10px);
  background-color: var(--accent-color);
  border-radius: 50%;
  opacity: 0;
  animation: fadeInOut 0.5s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* Size variations */
.loader-container:has(+ .size-small) .dots-loader {
  --dot-size: 6px;
  gap: 6px;
}

.loader-container:has(+ .size-medium) .dots-loader {
  --dot-size: 10px;
  gap: 8px;
}

.loader-container:has(+ .size-large) .dots-loader {
  --dot-size: 14px;
  gap: 10px;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
