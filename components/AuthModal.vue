<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ isLogin ? 'Login' : 'Register' }}</h2>
        <button @click="close" class="close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            class="form-input"
          />
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="loading"
          >
            {{ loading ? 'Processing...' : isLogin ? 'Login' : 'Register' }}
          </button>
          
          <button 
            type="button"
            @click="toggleAuthMode"
            class="toggle-mode-btn"
          >
            {{ isLogin ? 'Need an account? Register' : 'Already have an account? Login' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSupabase } from '~/utils/supabase';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  initialMode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value)
  }
});

const emit = defineEmits(['login', 'register', 'close']);

// State
const isLogin = ref(props.initialMode === 'login');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

// Initialize Supabase client
const supabase = useSupabase();

// Watch for show prop changes to reset form
watch(() => props.show, (newValue) => {
  if (newValue) {
    resetForm();
  }
});

// Watch for initialMode prop changes
watch(() => props.initialMode, (newValue) => {
  isLogin.value = newValue === 'login';
});

// Methods
function close() {
  emit('close');
  emit('update:show', false);
  resetForm();
}

function toggleAuthMode() {
  isLogin.value = !isLogin.value;
  errorMessage.value = '';
  successMessage.value = '';
}

function resetForm() {
  email.value = '';
  password.value = '';
  errorMessage.value = '';
  successMessage.value = '';
}

async function handleSubmit() {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;
  
  try {
    if (isLogin.value) {
      // Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      });
      
      if (error) throw error;
      
      emit('login', data.user);
      // Close modal on successful login
      close();
    } else {
      // Register without email confirmation
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: email.value.split('@')[0] // Use part of email as name
          }
        }
      });
      
      if (error) throw error;
      
      // Check if user was created successfully
      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          errorMessage.value = 'This email is already registered.';
        } else {
          // Show success message but don't close modal yet
          successMessage.value = 'Registration successful! You can now log in with your credentials.';
          emit('register', data.user);
          // Reset form fields but keep success message
          email.value = '';
          password.value = '';
          // Switch to login mode after successful registration
          isLogin.value = true;
        }
      }
    }
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred during authentication';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
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
