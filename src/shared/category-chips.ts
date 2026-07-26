import { escapeHtml } from './html';

export const CATEGORY_CHIP_OPTIONS = ['all', 'Dining', 'Health & Beauty', 'Fun & Activities', 'Hotels & Aqua Park'] as const;

export type CategoryChipValue = (typeof CATEGORY_CHIP_OPTIONS)[number];

export function categoryChipsHtml(activeValue: string, onClickFn: string): string {
  return `<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${CATEGORY_CHIP_OPTIONS.map((category) =>
    `<button class="chip ${activeValue === category ? 'active' : ''}" type="button" onclick="${onClickFn}('${category.replace(/'/g, "\\'")}')">${category === 'all' ? 'All' : escapeHtml(category)}</button>`
  ).join('')}</div>`;
}

export function matchesCategoryFilter(itemCategory: unknown, filterValue: string): boolean {
  return filterValue === 'all' || String(itemCategory || '') === filterValue;
}

export function categoryLabel(item: { category?: unknown; vertical?: unknown } | null | undefined): string {
  return String(item?.category || item?.vertical || '-');
}

export function catBadgeClass(category: unknown): string {
  const value = String(category || '').toLowerCase();
  if (value.includes('dining')) return 'dining';
  if (value.includes('health')) return 'health';
  if (value.includes('fun')) return 'fun';
  if (value.includes('hotel')) return 'hotels';
  return '';
}
