<template>
  <div class="bookmark-container">
    <button 
      @click.prevent="toggleBookmark" 
      class="bookmark-btn"
      :class="{ 'is-bookmarked': isBookmarked }"
      :title="isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
    
    <!-- Auth Popup -->
    <div v-if="showAuthPopup" class="auth-popup">
      <div class="auth-popup-content">
        <button @click="closeAuthPopup" class="close-popup">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
        <h3>Authentication Required</h3>
        <p>You need to be logged in to bookmark media.</p>
        <button @click="handleLoginClick" class="login-btn">Log In</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useSupabase } from '~/utils/supabase';
import { useBookmarks } from '~/composables/useBookmarks';

// Get bookmarks composable
const { 
  bookmarks, 
  isLoading: bookmarksLoading, 
  fetchUserBookmarks, 
  isBookmarked: checkIsBookmarked,
  addBookmark,
  removeBookmark
} = useBookmarks();

const props = defineProps({
  mediaId: {
    type: [String, Number],
    required: true
  },
  mediaType: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: null
  }
});

const supabase = useSupabase();

// State
const isBookmarked = ref(false);
const isLoading = ref(false);
const user = ref(null);
const showAuthPopup = ref(false);

// Check if user is authenticated and if the media is bookmarked
onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    user.value = data.session.user;
    await fetchUserBookmarks(user.value.id);
    updateBookmarkState();
  }
  
  // Listen for auth state changes
  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      user.value = session.user;
      fetchUserBookmarks(user.value.id);
    } else if (event === 'SIGNED_OUT') {
      user.value = null;
      isBookmarked.value = false;
    }
  });
});

// Watch for changes in bookmarks
watch(bookmarks, () => {
  updateBookmarkState();
});

// Update local bookmark state based on the global bookmarks store
function updateBookmarkState() {
  if (!user.value) {
    isBookmarked.value = false;
    return;
  }
  
  isBookmarked.value = checkIsBookmarked(props.mediaId, props.mediaType);
}

// Handle login button click
function handleLoginClick() {
  closeAuthPopup();
  if (process.client) {
    window.$auth.openAuthModal('login');
  }
}

// Close auth popup
function closeAuthPopup() {
  showAuthPopup.value = false;
}

// Toggle bookmark state
async function toggleBookmark() {
  if (!user.value) {
    showAuthPopup.value = true;
    return;
  }
  
  isLoading.value = true;
  
  try {
    if (isBookmarked.value) {
      // Remove bookmark
      const success = await removeBookmark(props.mediaId, props.mediaType);
      if (success) {
        // Immediately update UI state
        isBookmarked.value = false;
      }
    } else {
      // Add bookmark
      const newBookmark = await addBookmark(
        props.mediaId,
        props.mediaType,
        props.title,
        props.image,
        props.rating
      );
      if (newBookmark) {
        // Immediately update UI state
        isBookmarked.value = true;
      }
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.bookmark-container {
  position: relative;
}

.bookmark-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  z-index: 10;
}

.bookmark-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.bookmark-btn.is-bookmarked {
  color: #e50914;
}

.bookmark-btn.is-bookmarked svg {
  fill: #e50914;
}

/* Auth Popup Styles */
.auth-popup {
  position: absolute;
  top: 50px;
  right: 0;
  width: 250px;
  background-color: #2a2a2a;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.auth-popup-content {
  padding: 16px;
  position: relative;
}

.close-popup {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
}

.close-popup:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.auth-popup h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  color: white;
}

.auth-popup p {
  margin-bottom: 16px;
  font-size: 14px;
  color: #ccc;
}

.login-btn {
  width: 100%;
  background-color: #e50914;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #b20710;
}
</style>
