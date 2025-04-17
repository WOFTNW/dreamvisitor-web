import PocketBase from 'pocketbase';

// Initialize the PocketBase client using environment variable
export const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090');

// Helper function to check if user is authenticated
export const isUserAuthenticated = () => {
  return pb.authStore.isValid;
};

// Export the auth store for access to the current user
export const authStore = pb.authStore;

// Simple cache for tracking request cancellations
const pendingRequests = new Map<string, AbortController>();

// Create a wrapper for making cancellable requests
export const cancelableFetch = (cancelKey: string, requestFn: () => Promise<any>) => {
  // Cancel existing request with the same key if it exists
  if (pendingRequests.has(cancelKey)) {
    pendingRequests.get(cancelKey)?.abort();
    pendingRequests.delete(cancelKey);
  }

  // Create a new AbortController for this request
  const abortController = new AbortController();
  pendingRequests.set(cancelKey, abortController);

  // Call the request function
  const promise = requestFn().finally(() => {
    // Clean up when done
    pendingRequests.delete(cancelKey);
  });

  return {
    promise,
    cancel: () => abortController.abort(),
    abortController
  };
};
