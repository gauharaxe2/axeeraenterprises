import type { PageView } from '../types.ts';

export const META_PIXEL_ID = '1174303161608369';

export type FbqFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

export interface SpaPageViewContext {
  previousPageKey: string | null;
  currentPageKey: string;
  adminGate: 'off' | 'gate' | 'open';
  currentPage: PageView;
}

export function shouldTrackSpaPageView({
  previousPageKey,
  currentPageKey,
  adminGate,
  currentPage
}: SpaPageViewContext): boolean {
  if (previousPageKey === null) return false;
  if (previousPageKey === currentPageKey) return false;
  if (adminGate !== 'off') return false;
  if (currentPage === 'not-found') return false;
  return true;
}

export function trackMetaPixelPageView(
  fbqFn: ((command: string, event: string) => void) | undefined =
    typeof window !== 'undefined' ? window.fbq : undefined
): boolean {
  if (typeof fbqFn !== 'function') return false;
  fbqFn('track', 'PageView');
  return true;
}
