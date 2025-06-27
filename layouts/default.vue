<template>
  <div>
    <Header />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue';
</script>

<style scoped>
.main-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
