import { registerView } from '../core/view-registry';

export const LEGACY_VIEW_IDS = [
  'today',
  'tasks',
  'team',
  'map',
  'providers',
  'files',
  'leads',
  'offers',
  'marketing',
  'deals',
  'launch',
  'analytics',
  'settings',
  'pipeline',
] as const;

export type LegacyViewId = (typeof LEGACY_VIEW_IDS)[number];
export type LegacyViewRenderers = Record<LegacyViewId, () => void>;

export function registerLegacyViews(renderers: LegacyViewRenderers): void {
  for (const id of LEGACY_VIEW_IDS) {
    registerView({
      id,
      mount: () => {
        renderers[id]();
      },
    });
  }
}
