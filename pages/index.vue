<script setup>
// Import required composables
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Redirect from / to /trending
const router = useRouter();

// Redirect on component mount
onMounted(() => {
  router.push('/trending');
});
</script>

<template>
  <div>
    <!-- This page will redirect to /trending -->
    <p>Redirecting to trending page...</p>
  </div>
</template>
