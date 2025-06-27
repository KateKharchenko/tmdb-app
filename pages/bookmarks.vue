<template>
  <section class="bookmarks-page">
    <h1>My Bookmarks</h1>
    
    <div v-if="!loading && !user" class="auth-required">
      <p>Please log in to view your bookmarks</p>
      <button @click="openLoginModal" class="login-btn">Log In</button>
    </div>
    
    <div v-else>
      <div v-if="loading" class="loading">
        <Loader size="large" />
      </div>
      
      <div v-else-if="userBookmarks.length === 0" class="no-bookmarks">
        <p>You haven't bookmarked any media yet.</p>
        <NuxtLink to="/trending" class="browse-link">Browse trending media</NuxtLink>
      </div>
      
      <div v-else class="bookmarks-grid">
        <MediaCard 
          v-for="bookmark in userBookmarks" 
          :key="`${bookmark.media_type}-${bookmark.media_id}`"
          :item="formatBookmarkAsMedia(bookmark)"
          :type="bookmark.media_type"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSupabase } from '~/utils/supabase';
import MediaCard from '~/components/MediaCard.vue';
import Loader from '~/components/Loader.vue';

// Get Supabase client
const supabase = useSupabase();

// State
const user = ref(null);
const userBookmarks = ref([]);
const loading = ref(true);

// Fetch bookmarks directly from Supabase
async function fetchUserBookmarks() {

  if (!user.value?.id) return;
  
  loading.value = true;
  
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.value.id);
    
    if (error) throw error;
    userBookmarks.value = data || [];
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
  } finally {
    loading.value = false;
  }
}

// Format bookmark data to match the media card format
function formatBookmarkAsMedia(bookmark) {
  return {
    id: bookmark.media_id,
    title: bookmark.title,
    name: bookmark.title,
    poster_path: bookmark.image?.replace('https://image.tmdb.org/t/p/w500', '') || null,
    vote_average: bookmark.rating || 0
  };
}

// Initialize on mount
onMounted(async () => {
  // Get current session
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    user.value = data.session.user;
    await fetchUserBookmarks();
  } else {
    loading.value = false;
  }
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      user.value = session.user;
      await fetchUserBookmarks();
    } else if (event === 'SIGNED_OUT') {
      user.value = null;
      userBookmarks.value = [];
    }
  });
});

// Open login modal
function openLoginModal() {
  if (process.client) {
    window.$auth.openAuthModal('login');
  }
}
</script>

<style scoped>
.bookmarks-page {
  padding: 2rem 0;
}

h1 {
  color: var(--primary-text);
  margin-bottom: 1.5rem;
}

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.auth-required, .no-bookmarks, .loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.login-btn, .browse-link {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.login-btn:hover, .browse-link:hover {
  opacity: 0.9;
}
</style>
