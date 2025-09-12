// Simple API request logger to help debug excessive requests
class APILogger {
  private requests: Map<string, { count: number; lastCall: number }> =
    new Map();
  private readonly RESET_INTERVAL = 60000; // 1 minute

  log(endpoint: string, method: string = 'GET') {
    const key = `${method} ${endpoint}`;
    const now = Date.now();

    const existing = this.requests.get(key);
    if (!existing || now - existing.lastCall > this.RESET_INTERVAL) {
      this.requests.set(key, { count: 1, lastCall: now });
    } else {
      existing.count++;
      existing.lastCall = now;

      // Log warning if too many requests
      if (existing.count > 5) {
        console.warn(
          `🚨 Excessive API requests detected: ${key} called ${existing.count} times in the last minute`
        );
        console.trace('Call stack:');
      }
    }
  }

  getStats() {
    const stats: Array<{ endpoint: string; count: number; lastCall: Date }> =
      [];
    this.requests.forEach((data, endpoint) => {
      stats.push({
        endpoint,
        count: data.count,
        lastCall: new Date(data.lastCall),
      });
    });
    return stats.sort((a, b) => b.count - a.count);
  }

  clear() {
    this.requests.clear();
  }
}

export const apiLogger = new APILogger();

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).apiLogger = apiLogger;
}
