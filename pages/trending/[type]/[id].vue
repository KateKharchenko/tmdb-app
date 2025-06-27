<template>
  <section>
    <Loader v-if="loading" size="large" />
    
    <div v-if="!loading && error" class="error">
      {{ error }}
    </div>
    
    <div v-if="!loading && !error && media" class="media-details">
      <div class="media-header">
        <div class="poster-container">
          <Bookmark 
            :mediaId="mediaId" 
            :mediaType="mediaType" 
            :title="mediaTitle" 
            :image="media.poster_path ? getImageUrl(media.poster_path) : null"
            :rating="media.vote_average"
            class="detail-bookmark"
          />
          <img 
            v-if="media.poster_path" 
            :src="getImageUrl(media.poster_path, 'w342')" 
            :alt="mediaTitle"
            class="poster"
          />
          <div v-else class="no-poster">No Poster Available</div>
        </div>
        
        <div class="info">
          <div class="title-row">
            <h1>{{ mediaTitle }}</h1>
          </div>
          
          <div class="meta">
            <div class="rating">
              <span class="star">★</span> {{ media.vote_average ? media.vote_average.toFixed(1) : 'N/A' }}
              <span class="vote-count">({{ media.vote_count }} votes)</span>
            </div>
            
            <div v-if="mediaType === 'movie'" class="year">
              {{ media.release_date ? new Date(media.release_date).getFullYear() : 'Unknown Year' }}
            </div>
            <div v-else class="year">
              {{ media.first_air_date ? new Date(media.first_air_date).getFullYear() : 'Unknown Year' }}
            </div>
          </div>
          
          <div class="genres">
            <span v-for="genre in media.genres" :key="genre.id" class="genre-tag">
              {{ genre.name }}
            </span>
          </div>
          
          <p class="overview">{{ media.overview }}</p>
          
          <div class="additional-info">
            <div v-if="mediaType === 'movie'">
              <p><strong>Runtime:</strong> {{ media.runtime ? `${media.runtime} minutes` : 'Unknown' }}</p>
              <p><strong>Status:</strong> {{ media.status }}</p>
            </div>
            <div v-else>
              <p><strong>Seasons:</strong> {{ media.number_of_seasons || 'Unknown' }}</p>
              <p><strong>Episodes:</strong> {{ media.number_of_episodes || 'Unknown' }}</p>
              <p><strong>Status:</strong> {{ media.status }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="back-button">
        <button @click="goBack" class="btn-back">
          &laquo; Back
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { getImageUrl } from '~/utils/tmdb';
import Loader from '~/components/Loader.vue';
import Bookmark from '~/components/Bookmark.vue';

// Define page metadata for Nuxt
definePageMeta({
  ssr: true
});

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

const mediaType = route.params.type;
const mediaId = route.params.id;

// Media data
const media = ref(null);

// Function to handle back navigation
function goBack() {
  if (window.history.length > 2) {
    router.go(-1);
  } else {
    router.push('/trending');
  }
}

// State
const loading = ref(true);
const error = ref(null);

// Computed properties
const mediaTitle = computed(() => {
  if (!media.value) return '';
  return mediaType === 'movie' ? media.value.title : media.value.name;
});

// Dynamic SEO meta tags
useSeoMeta({
  title: () => media.value ? `${mediaTitle.value} | TMDB App` : 'Loading...',
  description: () => media.value?.overview || 'Loading media details...',
  ogTitle: () => media.value ? `${mediaTitle.value} | TMDB App` : 'Loading...',
  ogDescription: () => media.value?.overview || 'Loading media details...',
  ogType: 'website',
  ogImage: () => media.value?.poster_path ? getImageUrl(media.value.poster_path, 'w500') : null,
  twitterCard: 'summary_large_image',
});

// Fetch media details
const { data, pending, error: fetchError } = await useAsyncData(
  `media-${mediaType}-${mediaId}`,
  async () => {
    try {
      const config = useRuntimeConfig();
      const baseUrl = config.public.tmdbApiBaseUrl;
      const token = config.public.tmdbApiToken;
      
      const response = await fetch(
        `${baseUrl}/${mediaType}/${mediaId}?language=en-US`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${mediaType} details`);
      }
      
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${mediaType} details:`, err);
      throw new Error(`Failed to load ${mediaType} details. Please try again later.`);
    }
  },
  { 
    server: true,
    // lazy: true, // Ensure data is available during SSR
    immediate: true // Start fetching immediately
  }
);

// Watch for errors and update error state
watchEffect(() => {
  if (fetchError.value) {
    error.value = fetchError.value.message;
  }
});

// Set initial loading state to true and update based on pending
loading.value = true;
watchEffect(() => {
  loading.value = pending.value;
});

// Set media data from async fetch
media.value = data.value;
</script>

<style scoped>
.media-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.media-header {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .media-header {
    grid-template-columns: 300px 1fr;
  }
}

.poster-container {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  position: relative;
}

.detail-bookmark {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.poster {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.no-poster {
  width: 100%;
  aspect-ratio: 2/3;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--secondary-bg);
  border-radius: 8px;
  color: var(--secondary-text);
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

h1 {
  margin-top: 0;
  margin-bottom: 0;
  color: var(--primary-text);
  flex: 1;
}

.meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: var(--secondary-text);
}

.rating {
  display: flex;
  align-items: center;
}

.star {
  color: var(--accent-color);
  margin-right: 4px;
}

.vote-count {
  font-size: 0.8rem;
  margin-left: 4px;
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.genre-tag {
  background-color: var(--secondary-bg);
  color: var(--primary-text);
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.8rem;
  border: 1px solid var(--accent-color);
}

.overview {
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: var(--primary-text);
}

.additional-info {
  color: var(--secondary-text);
}

.additional-info p {
  margin: 0.5rem 0;
}

.back-button {
  margin-top: 2rem;
}

.btn-back {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--secondary-bg);
  color: var(--primary-text);
  text-decoration: none;
  border-radius: 4px;
  border: 1px solid var(--accent-color);
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 1rem;
  font-family: inherit;
}

.btn-back:hover {
  background-color: var(--accent-color);
  color: #fff;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #ff6b6b;
}
</style>
