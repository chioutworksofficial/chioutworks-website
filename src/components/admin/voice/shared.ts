import { ApiError } from '../api';
import type { St } from './types';

export const ST: Record<St, string> = { to_call: 'Aranacak', calling: 'Aranıyor', booked: 'Randevu alındı', no_answer: 'Cevap yok' };
export const PT: Record<string, string> = { morning: 'Sabah', afternoon: 'Öğleden sonra', any: 'Fark etmez' };
export const mask = (p: string) => (p.length > 3 ? `${'•'.repeat(Math.min(p.length - 3, 8))}${p.slice(-3)}` : p);
export const msgOf = (x: unknown, d: string) => (x instanceof ApiError ? x.data?.message ?? (x.status === 401 ? 'Oturum süresi doldu, yeniden giriş yapın.' : d) : d);
