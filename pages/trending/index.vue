<template>
    <section>
      <!-- Dynamic page header based on active tab -->
      <h1 v-if="activeTab === 'movies'">Trending Movies</h1>
      <h1 v-if="activeTab === 'tv'">Trending TV Shows</h1>
      
      <!-- Loading indicator -->
      <Loader v-if="loading" size="large" />
      
      <!-- Error message -->
      <div v-if="error" class="error">
        {{ error }}
      </div>
      
      <!-- Content area -->
      <div class="content-area">
        <!-- Media grid -->
        <div v-if="!loading && !error" class="media-grid">
          <MediaCard 
            v-for="item in currentResults" 
            :key="item.id" 
            :item="item" 
            :type="activeTab === 'movies' ? 'movie' : 'tv'" 
          />
        </div>
        
        <!-- Pagination -->
        <Pagination 
          v-if="!loading && !error" 
          :current-page="currentPagination.page" 
          :total-pages="currentPagination.totalPages" 
          :total-results="currentPagination.totalResults"
          @page-change="goToPage"
        />
      </div>
      
      <!-- Tabs at the bottom -->
      <div class="tabs-container">
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'movies' }" 
            @click="switchTab('movies')"
          >
            Movies
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'tv' }" 
            @click="switchTab('tv')"
          >
            TV Shows
          </button>
        </div>
      </div>
    </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { getTrendingMovies, getTrendingTVShows } from '~/utils/tmdb';
import Loader from '~/components/Loader.vue';
import Pagination from '~/components/Pagination.vue';
import { useRoute, useRouter } from 'vue-router';

// Define page metadata for Nuxt
definePageMeta({
  // Enable server-side rendering for this page
  ssr: true
});

const route = useRoute();
const router = useRouter();

// State
const activeTab = ref(route.query.tab && ['movies', 'tv'].includes(route.query.tab) ? route.query.tab : 'movies');
const loading = ref(false);
const error = ref(null);
const pagination = ref({
  movies: {
    page: 1,
    totalPages: 0,
    totalResults: 0
  },
  tv: {
    page: 1,
    totalPages: 0,
    totalResults: 0
  }
});

// Computed
const currentPage = computed(() => {
  const pageParam = Number(route.query.page) || 1;
  return pageParam > 0 ? pageParam : 1;
});

// Dynamic SEO meta tags based on active tab
const title = computed(() => {
  return activeTab.value === 'movies' 
    ? 'Trending Movies | TMDB App' 
    : 'Trending TV Shows | TMDB App';
});

const description = computed(() => {
  return activeTab.value === 'movies'
    ? `Discover the most popular trending movies this week. Page ${currentPage.value}`
    : `Explore the hottest trending TV shows this week. Page ${currentPage.value}`;
});

// Set page meta tags using Nuxt's useSeoMeta
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogType: 'website',
  ogUrl: () => `https://tmdb-app.example.com/trending?tab=${activeTab.value}&page=${currentPage.value}`,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
});

// Set canonical URL
useHead({
  link: [
    {
      rel: 'canonical',
      href: () => `https://tmdb-app.example.com/trending?tab=${activeTab.value}&page=${currentPage.value}`
    }
  ]
});

// Server-side data fetching for initial page load
const { data: moviesData } = await useAsyncData(
  'trending-movies',
  async () => {
    try {
      const page = currentPage.value;
      const tab = activeTab.value;
      if (tab === 'movies') {
        return await getTrendingMovies('week', page);
      }
      return { results: [], page: 1, totalPages: 0, totalResults: 0 };
    } catch (err) {
      error.value = 'Failed to load trending movies. Please try again later.';
      console.error('Error fetching trending movies:', err);
      return { results: [], page: 1, totalPages: 0, totalResults: 0 };
    }
  },
  { server: true }
);

const { data: tvShowsData } = await useAsyncData(
  'trending-tvshows',
  async () => {
    try {
      const page = currentPage.value;
      const tab = activeTab.value;
      if (tab === 'tv') {
        return await getTrendingTVShows('week', page);
      }
      return { results: [], page: 1, totalPages: 0, totalResults: 0 };
    } catch (err) {
      error.value = 'Failed to load trending TV shows. Please try again later.';
      console.error('Error fetching trending TV shows:', err);
      return { results: [], page: 1, totalPages: 0, totalResults: 0 };
    }
  },
  { server: true }
);

// Initialize data from server-side fetch
const trendingMovies = ref(moviesData.value?.results || []);
const trendingTVShows = ref(tvShowsData.value?.results || []);

// Update pagination data
if (moviesData.value) {
  pagination.value.movies = {
    page: moviesData.value.page || 1,
    totalPages: moviesData.value.totalPages || 0,
    totalResults: moviesData.value.totalResults || 0
  };
}

if (tvShowsData.value) {
  pagination.value.tv = {
    page: tvShowsData.value.page || 1,
    totalPages: tvShowsData.value.totalPages || 0,
    totalResults: tvShowsData.value.totalResults || 0
  };
}

// Computed for current results based on active tab
const currentResults = computed(() => {
  return activeTab.value === 'movies' ? trendingMovies.value : trendingTVShows.value;
});

const currentPagination = computed(() => {
  return activeTab.value === 'movies' ? pagination.value.movies : pagination.value.tv;
});

// Methods for client-side data fetching after initial load
const fetchTrendingMovies = async (page = currentPage.value) => {
  loading.value = true;
  error.value = null;
  
  try {
    const data = await getTrendingMovies('week', page);
    trendingMovies.value = data.results;
    pagination.value.movies = {
      page: data.page,
      totalPages: data.totalPages,
      totalResults: data.totalResults
    };
  } catch (err) {
    console.error('Error fetching trending movies:', err);
    error.value = 'Failed to load trending movies. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const fetchTrendingTVShows = async (page = currentPage.value) => {
  loading.value = true;
  error.value = null;
  
  try {
    const data = await getTrendingTVShows('week', page);
    trendingTVShows.value = data.results;
    pagination.value.tv = {
      page: data.page,
      totalPages: data.totalPages,
      totalResults: data.totalResults
    };
  } catch (err) {
    console.error('Error fetching trending TV shows:', err);
    error.value = 'Failed to load trending TV shows. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const switchTab = (tab) => {
  activeTab.value = tab;
  
  // Always reset to page 1 when switching tabs
  // Update URL without refreshing the page, but remove page parameter
  router.replace({ query: { tab } });
  
  // Always fetch page 1 data when switching tabs
  if (tab === 'movies') {
    fetchTrendingMovies(1);
  } else {
    fetchTrendingTVShows(1);
  }
};

const goToPage = (page) => {
  if (page < 1 || page > currentPagination.value.totalPages) return;
  
  // Update URL with new page number
  router.push({ query: { ...route.query, page } });
  
  // Fetch new data based on active tab
  if (activeTab.value === 'movies') {
    fetchTrendingMovies(page);
  } else {
    fetchTrendingTVShows(page);
  }
  
  // Scroll to top of the page
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Watch for URL query changes
watch(() => route.query, (newQuery) => {
  // Handle page changes from URL
  if (newQuery.page && Number(newQuery.page) !== currentPagination.value.page) {
    const page = Number(newQuery.page);
    if (activeTab.value === 'movies') {
      fetchTrendingMovies(page);
    } else {
      fetchTrendingTVShows(page);
    }
  }
  
  // Handle tab changes from URL
  if (newQuery.tab && newQuery.tab !== activeTab.value) {
    activeTab.value = ['movies', 'tv'].includes(newQuery.tab) ? newQuery.tab : 'movies';
    switchTab(activeTab.value);
  }
}, { immediate: true, deep: true });
</script>

<style scoped>
/* Page styles */
h1 {
  color: var(--primary-text);
  margin-bottom: 1.5rem;
}

/* Loading and error states */
.loading, .error {
  text-align: center;
  padding: 2rem;
  color: var(--secondary-text);
}

.error {
  color: var(--accent-color);
}

/* Content area */
.content-area {
  margin-bottom: 80px; /* Space for the fixed tabs */
  padding: 0 1rem;
}

/* Media grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

/* Pagination */
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

/* Tabs */
.tabs-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--secondary-bg);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  padding: 10px 0;
  z-index: 10;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.tab {
  padding: 10px 20px;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 500;
  color: var(--secondary-text);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: var(--accent-color);
  border-bottom: 2px solid var(--accent-color);
}
</style>