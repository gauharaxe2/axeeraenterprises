const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const MAX_BUCKETS = 1000;

interface Bucket {
  failures: number;
  windowStart: number;
}

export class LoginRateLimiter {
  private buckets = new Map<string, Bucket>();
  private now: () => number;

  constructor(now: () => number) {
    this.now = now;
  }

  status(ip: string): { locked: boolean; retryAfterSeconds: number; failures: number } {
    const bucket = this.current(ip);
    if (!bucket || bucket.failures < MAX_FAILURES) {
      return { locked: false, retryAfterSeconds: 0, failures: bucket?.failures ?? 0 };
    }
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.windowStart + WINDOW_MS - this.now()) / 1000));
    return { locked: true, retryAfterSeconds, failures: bucket.failures };
  }

  recordFailure(ip: string): number {
    const existing = this.current(ip);
    const bucket = existing ?? { failures: 0, windowStart: this.now() };
    bucket.failures += 1;
    this.buckets.delete(ip);
    this.buckets.set(ip, bucket);
    if (this.buckets.size > MAX_BUCKETS) {
      const oldest = this.buckets.keys().next().value;
      if (oldest && oldest !== ip) this.buckets.delete(oldest);
    }
    return bucket.failures;
  }

  recordSuccess(ip: string): void {
    this.buckets.delete(ip);
  }

  private current(ip: string): Bucket | null {
    const bucket = this.buckets.get(ip);
    if (!bucket) return null;
    if (this.now() - bucket.windowStart >= WINDOW_MS) {
      this.buckets.delete(ip);
      return null;
    }
    return bucket;
  }
}
