import { escapeHtml } from './html';

export function whatsappLink(phone: unknown, name: unknown): string | null {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('0')) digits = `20${digits.slice(1)}`;
  const msg = `Hi! Following up on the WeIN offer sheet for ${name} - do you have 5 minutes today?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

export function whatsappButtonHtml(phone: unknown, name: unknown): string {
  const url = whatsappLink(phone, name);
  if (!url) return '';
  return `<a class="mini-btn" href="${escapeHtml(url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`;
}
