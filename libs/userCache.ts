// Simple in-memory cache for user data to prevent duplicate requests
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class UserDataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly pendingRequests = new Map<string, Promise<any>>();

  // Get cached data or fetch if not available/expired
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> {
    // Check if there's already a pending request for this key
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest && !forceRefresh) {
      return pendingRequest;
    }

    const cached = this.cache.get(key);

    // Return cached data if it's still fresh and not forcing refresh
    if (
      cached &&
      !forceRefresh &&
      Date.now() - cached.timestamp < this.CACHE_DURATION
    ) {
      return cached.data;
    }

    // Create and store the promise to prevent duplicate requests
    const fetchPromise = fetcher()
      .then((data) => {
        // Cache the result
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
        });

        // Remove from pending requests
        this.pendingRequests.delete(key);

        return data;
      })
      .catch((error) => {
        // Remove from pending requests on error
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, fetchPromise);
    return fetchPromise;
  }

  // Clear cache for a specific key
  invalidate(key: string) {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Get cache size for debugging
  size() {
    return this.cache.size;
  }
}

export const userCache = new UserDataCache();
