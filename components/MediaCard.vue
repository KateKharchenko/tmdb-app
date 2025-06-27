<template>
  <div class="media-card-container">
    <!-- Bookmark component -->
    <div class="card-bookmark">
      <Bookmark 
        :mediaId="item.id" 
        :mediaType="type" 
        :title="mediaTitle" 
        :image="item.poster_path ? getImageUrl(item.poster_path) : null"
        :rating="item.vote_average"
      />
    </div>
    <NuxtLink :to="`/trending/${type}/${item.id}`" class="media-link">
      <div class="media-card">
        <div class="poster">
          <div v-if="item.poster_path" class="poster-image" :class="{ 'is-loaded': imageLoaded }">
            <!-- Thumbnail image (loads first) -->
            <img 
              :src="getImageUrl(item.poster_path, 'w92')" 
              :alt="mediaTitle"
              class="thumbnail-img"
            >
            
            <!-- Full size image (loads after) -->
            <img 
              :src="getImageUrl(item.poster_path)" 
              :alt="mediaTitle"
              loading="lazy"
              class="full-img"
              @load="imageLoaded = true"
              @error="handleImageError"
            >
          </div>
          <div v-else class="no-poster">No Poster</div>
        </div>
        <div class="info">
          <h3>{{ mediaTitle }}</h3>
          <div class="rating">
            <span class="star">★</span> {{ item.vote_average ? item.vote_average.toFixed(1) : 'N/A' }}
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { getImageUrl } from '~/utils/tmdb';
import Bookmark from '~/components/Bookmark.vue';

// Props
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    default: 'movie',
    validator: (value) => ['movie', 'tv'].includes(value)
  }
});

// State
const imageLoaded = ref(false);
const imageError = ref(false);

// Computed properties
const mediaTitle = computed(() => {
  return props.type === 'movie' ? props.item.title : props.item.name;
});

// Handle image loading error
function handleImageError() {
  console.error('Failed to load image:', props.item.poster_path);
  imageLoaded.value = true;
}
</script>

<style scoped>
.media-card-container {
  position: relative;
}

.media-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.media-card {
  background-color: var(--secondary-bg);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.media-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.poster {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
  background-color: #1a1a1a;
}

.poster-image {
  position: relative;
  width: 100%;
  height: 100%;
}

.poster-image .thumbnail-img,
.poster-image .full-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.poster-image .thumbnail-img {
  opacity: 1;
  filter: blur(8px);
  transform: scale(1.05);
  z-index: 1;
  transition: all 0.5s ease-out;
}

.poster-image .full-img {
  opacity: 0;
  transition: opacity 0.8s ease-in;
  z-index: 2;
}

.poster-image.is-loaded .full-img {
  opacity: 1;
}

.poster-image.is-loaded .thumbnail-img {
  opacity: 0;
  filter: blur(0);
  transform: scale(1);
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1a1a1a;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-poster {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #2a2a2a;
  color: var(--secondary-text);
}

.info {
  padding: 12px;
}

.info h3 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: var(--primary-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rating {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--secondary-text);
}

.star {
  color: var(--accent-color);
  margin-right: 4px;
}

.card-bookmark {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}
</style>
