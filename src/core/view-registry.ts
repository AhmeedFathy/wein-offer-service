import type { PortalContext } from './portal-context';

export interface ViewModule {
  id: string;
  mount(root: HTMLElement, context: PortalContext): void | (() => void);
}

type Cleanup = () => void;

const views = new Map<string, ViewModule>();
let currentCleanup: Cleanup | null = null;

export function registerView(view: ViewModule): void {
  if (!view.id) throw new Error('View id is required.');
  if (views.has(view.id)) throw new Error(`View already registered: ${view.id}`);
  views.set(view.id, view);
}

export function getView(id: string): ViewModule | undefined {
  return views.get(id);
}

export function registeredViewIds(): string[] {
  return [...views.keys()];
}

export function clearCurrentView(): void {
  if (!currentCleanup) return;
  const cleanup = currentCleanup;
  currentCleanup = null;
  cleanup();
}

export function mountView(id: string, root: HTMLElement, context: PortalContext): void {
  const view = getView(id);
  if (!view) throw new Error(`Unknown portal view: ${id}`);

  clearCurrentView();
  const cleanup = view.mount(root, context);
  currentCleanup = typeof cleanup === 'function' ? cleanup : null;
}

export function registerDummyCleanupProbeView(): void {
  if (views.has('__dummy_cleanup_probe')) return;
  registerView({
    id: '__dummy_cleanup_probe',
    mount(root) {
      window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT = window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT ?? 0;
      root.innerHTML = '<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>';
      return () => {
        window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT = (window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT ?? 0) + 1;
      };
    },
  });
}

declare global {
  interface Window {
    WEIN_PORTAL_DUMMY_CLEANUP_COUNT?: number;
  }
}
