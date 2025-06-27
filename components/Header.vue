<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <NuxtLink to="/trending" class="logo-link">TMDB App</NuxtLink>
      </div>
      <div>
        <button 
          v-if="!user" 
          @click="openLoginModal" 
          class="login-btn"
        >
          Login
        </button>
        <div v-else class="user-info">
          <NuxtLink to="/bookmarks" class="bookmarks-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>My Bookmarks</span>
          </NuxtLink>
          <span class="user-email">{{ user.email }}</span>
          <button 
            @click="handleLogout" 
            class="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
    
    <!-- Auth Modal is now global in app.vue -->
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useSupabase } from '~/utils/supabase';
import { useBookmarks } from '~/composables/useBookmarks';
import { useRuntimeConfig } from '#app'

// Auth state
const user = ref(null)

// Initialize Supabase client
const supabase = useSupabase()

// Initialize bookmarks store
const { fetchUserBookmarks, onAuthStateChange } = useBookmarks();

// Check for existing session on mount
onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    user.value = data.session.user;
    // Fetch user bookmarks on initial load
    await fetchUserBookmarks(user.value.id);
  }
  
  // Listen for auth state changes
  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      user.value = session.user;
      // Update bookmarks when user signs in
      fetchUserBookmarks(user.value.id);
    } else if (event === 'SIGNED_OUT') {
      user.value = null;
      // Clear bookmarks when user signs out
      onAuthStateChange(null);
    }
  });
});

// Modal functions
function openLoginModal() {
  if (process.client) {
    window.$auth.openAuthModal('login');
  }
}

function openRegisterModal() {
  if (process.client) {
    window.$auth.openAuthModal('register');
  }
}

const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Error logging out:', error)
  }
}
</script>

<style scoped>
.header {
  background-color: #1a1a1a;
  color: white;
  padding: 16px 0;
}

.container {
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-link {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.login-btn {
  background-color: #e50914;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #b20710;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bookmarks-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-text);
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  background-color: var(--secondary-bg);
  transition: background-color 0.2s ease;
}

.bookmarks-link:hover {
  background-color: var(--accent-color);
}

.user-email {
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.logout-btn {
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: white;
  color: #1a1a1a;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background-color: #2a2a2a;
  padding: 24px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
}

.close-btn:hover {
  color: white;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.form-input {
  box-sizing: border-box;
  width: 100%;
  background-color: #3a3a3a;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
}

.form-input:focus {
  outline: none;
  border-color: #e50914;
  box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.3);
}

.error-message {
  color: #e50914;
  font-size: 14px;
  margin-bottom: 16px;
}

.success-message {
  color: #4BB543;
  font-size: 14px;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submit-btn {
  width: 100%;
  background-color: #e50914;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #b20710;
}

.submit-btn:disabled {
  background-color: #888;
  cursor: not-allowed;
}

.toggle-mode-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}

.toggle-mode-btn:hover {
  color: white;
}
</style>
