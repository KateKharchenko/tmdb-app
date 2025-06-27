import { ref, watch } from 'vue';
import { useSupabase } from '~/utils/supabase';

// Create a singleton store for bookmarks
const bookmarks = ref([]);
const isLoading = ref(false);
const error = ref(null);
let initialized = false;

export const useBookmarks = () => {
  const supabase = useSupabase();
  
  // Fetch all bookmarks for the current user
  const fetchUserBookmarks = async (userId) => {
    if (!userId) {
      bookmarks.value = [];
      return;
    }
    
    // Prevent duplicate fetches if already loading
    if (isLoading.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId);
      
      if (fetchError) throw fetchError;
      
      bookmarks.value = data || [];
      initialized = true;
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Check if a specific media is bookmarked
  const isBookmarked = (mediaId, mediaType) => {
    return bookmarks.value.some(
      bookmark => 
        bookmark.media_id === mediaId.toString() && 
        bookmark.media_type === mediaType
    );
  };
  
  // Add a bookmark
  const addBookmark = async (mediaId, mediaType, title, image, rating) => {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;
    
    const userId = session.user.id;
    const newBookmark = {
      user_id: userId,
      media_id: mediaId.toString(),
      media_type: mediaType,
      title,
      image: image,
      rating: rating || 0,
      created_at: new Date().toISOString()
    };
    
    try {
      const { data, error: insertError } = await supabase
        .from('bookmarks')
        .insert([newBookmark])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Update local cache
      bookmarks.value.push(data);
      return data;
    } catch (err) {
      console.error('Error adding bookmark:', err);
      error.value = err.message;
      return null;
    }
  };
  
  // Remove a bookmark
  const removeBookmark = async (mediaId, mediaType) => {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return false;
    
    const userId = session.user.id;
    
    try {
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('media_id', mediaId.toString())
        .eq('media_type', mediaType);
      
      if (deleteError) throw deleteError;
      
      // Update local cache
      bookmarks.value = bookmarks.value.filter(
        bookmark => 
          bookmark.media_id !== mediaId.toString() || 
          bookmark.media_type !== mediaType
      );
      
      return true;
    } catch (err) {
      console.error('Error removing bookmark:', err);
      error.value = err.message;
      return false;
    }
  };
  
  // Listen for auth state changes to refresh bookmarks
  const onAuthStateChange = (user) => {
    if (user) {
      fetchUserBookmarks(user.id);
    } else {
      bookmarks.value = [];
    }
  };
  
  return {
    bookmarks,
    isLoading,
    error,
    initialized,
    fetchUserBookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    onAuthStateChange
  };
};
