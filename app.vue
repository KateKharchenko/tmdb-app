<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <!-- Global Auth Modal -->
    <AuthModal 
      :show="showAuthModal" 
      :initial-mode="authModalMode" 
      @login="handleLoginSuccess" 
      @register="handleRegisterSuccess" 
      @close="closeAuthModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSupabase } from '~/utils/supabase';
import { useBookmarks } from '~/composables/useBookmarks';
import AuthModal from '~/components/AuthModal.vue';

// Global auth modal state
const showAuthModal = ref(false);
const authModalMode = ref('login');
const supabase = useSupabase();
const { fetchUserBookmarks } = useBookmarks();

// Expose global functions
const openAuthModal = (mode = 'login') => {
  authModalMode.value = mode;
  showAuthModal.value = true;
};

const closeAuthModal = () => {
  showAuthModal.value = false;
};

// Make functions globally available
defineExpose({ openAuthModal });

// Add to global properties
if (process.client) {
  window.$auth = { openAuthModal };
}

// Handle successful login
async function handleLoginSuccess(user) {
  // Fetch user bookmarks after login
  if (user?.id) {
    await fetchUserBookmarks(user.id);
  }
  closeAuthModal();
}

// Handle successful registration
async function handleRegisterSuccess(user) {
  // Fetch user bookmarks after registration
  if (user?.id) {
    await fetchUserBookmarks(user.id);
  }
  closeAuthModal();
}
</script>

<style>
/* Apply Roboto font globally with dark theme */
html, body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 1rem;
  background-color: #141414;
  color: #ffffff;
}

/* Dark theme styles */
:root {
  --primary-bg: #141414;
  --secondary-bg: #1f1f1f;
  --primary-text: #ffffff;
  --secondary-text: #b3b3b3;
  --accent-color: #e50914;
}
</style>
