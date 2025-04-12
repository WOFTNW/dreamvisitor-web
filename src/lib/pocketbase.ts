import PocketBase from 'pocketbase';

// Initialize the PocketBase client using environment variable
export const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090');

// Helper function to check if user is authenticated
export const isUserAuthenticated = () => {
  return pb.authStore.isValid;
};

// Export the auth store for access to the current user
export const authStore = pb.authStore;
