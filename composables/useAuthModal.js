import { ref, readonly } from 'vue';

// Create singleton state for auth modal
const isVisible = ref(false);
const mode = ref('login'); // 'login' or 'register'

export const useAuthModal = () => {
  // Open the modal with specified mode
  const openModal = (initialMode = 'login') => {
    mode.value = initialMode;
    isVisible.value = true;
  };

  // Close the modal
  const closeModal = () => {
    isVisible.value = false;
  };

  // Toggle between login and register modes
  const toggleMode = () => {
    mode.value = mode.value === 'login' ? 'register' : 'login';
  };

  // Set specific mode
  const setMode = (newMode) => {
    if (newMode === 'login' || newMode === 'register') {
      mode.value = newMode;
    }
  };

  return {
    isVisible,
    mode,
    openModal,
    closeModal,
    toggleMode,
    setMode
  };
};
