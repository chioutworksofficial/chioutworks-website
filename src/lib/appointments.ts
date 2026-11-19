// Lightweight client-side appointment/booking store.
// Stores appointments and admin-closed days in localStorage so the
// /admin panel and the public booking form (CTASection) can work without
// a backend. Designed so it can later be swapped for a Supabase-backed
// implementation without changing the consumers much (same shape as
// src/lib/analytics.ts's readStore/writeStore pattern).
//
// LIMITATION: localStorage is per-browser. A visitor who books from their
// phone will not show up in the admin panel unless the admin opens it in
// that same browser. This is a working prototype until Supabase is wired
// in — not a cross-device production booking system yet.

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  date: string;          // 'YYYY-MM-DD'
  preferredTime: string; // '09:00'..'18:00'
  message: string;       // optional, may be empty
  status: AppointmentStatus;
  createdAt: number;
}

export type NewAppointment = Omit<Appointment, 'id' | 'status' | 'createdAt'>;

interface AppointmentStore {
  appointments: Appointment[];
  closedDays: string[]; // ISO 'YYYY-MM-DD'
}

const STORE_KEY = 'cw_appointments_v1';
const MAX_APPOINTMENTS = 2000;

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readStore(): AppointmentStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { appointments: [], closedDays: [] };
    const parsed = JSON.parse(raw);
    return {
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
      closedDays: Array.isArray(parsed.closedDays) ? parsed.closedDays : [],
    };
  } catch {
    return { appointments: [], closedDays: [] };
  }
}

function writeStore(store: AppointmentStore) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* storage full or unavailable – ignore */
  }
}

// ── Appointments ────────────────────────────────────────────────────────

export function getAppointments(): Appointment[] {
  return readStore().appointments;
}

export function createAppointment(input: NewAppointment): Appointment {
  const store = readStore();
  const appointment: Appointment = {
    ...input,
    id: uid(),
    status: 'pending',
    createdAt: Date.now(),
  };
  store.appointments = [appointment, ...store.appointments].slice(0, MAX_APPOINTMENTS);
  writeStore(store);
  return appointment;
}

export function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const store = readStore();
  store.appointments = store.appointments.map((a) => (a.id === id ? { ...a, status } : a));
  writeStore(store);
}

export function deleteAppointment(id: string) {
  const store = readStore();
  store.appointments = store.appointments.filter((a) => a.id !== id);
  writeStore(store);
}

// ── Closed days ─────────────────────────────────────────────────────────

export function getClosedDays(): string[] {
  return readStore().closedDays;
}

export function isDayClosed(date: string): boolean {
  return readStore().closedDays.includes(date);
}

export function toggleClosedDay(date: string) {
  const store = readStore();
  store.closedDays = store.closedDays.includes(date)
    ? store.closedDays.filter((d) => d !== date)
    : [...store.closedDays, date];
  writeStore(store);
}
