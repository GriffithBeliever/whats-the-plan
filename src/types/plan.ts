// src/types/plan.ts
// Core domain model. This is the single source of truth for what a "Plan" looks
// like on the client; when a real backend exists these types should map ~1:1
// onto API responses so the centralized state in AppStateContext can be swapped
// from seeded data to network data with minimal churn.

export type PlanKind = 'outing' | 'event';

export type CardKind = 'service' | 'item' | 'instapay';

export type PlanCardBase = {
  id: string;
  kind: CardKind;
  title: string;
  description: string;
  price: number; // 0 = free
  preorderEnabled: boolean;
};

export type ServiceCard = PlanCardBase & {
  kind: 'service';
  estimatedWaitMinutes: number;
  queueLength: number;
  myQueuePosition: number | null; // null = not queued
};

export type ItemCard = PlanCardBase & {
  kind: 'item';
  unlimited: boolean;
  quantityTotal: number | null;
  quantityRemaining: number | null;
  myOrderedCount: number;
};

export type InstaPayCard = PlanCardBase & {
  kind: 'instapay';
  claimed: boolean;
};

export type PlanCard = ServiceCard | ItemCard | InstaPayCard;

export type Plan = {
  id: string;
  kind: PlanKind;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  startTime: string; // ISO string
  gradient: [string, string];
  icon: string;
  isPublic: boolean;
  hasGroupChat: boolean;
  maxParticipants: number | null; // outing: <=15, event: null = unlimited
  splitBillEnabled: boolean; // outing-only
  isPaid: boolean;
  ticketPrice: number;
  amenities: string[];
  cards: PlanCard[];
  organizerId: string;
  participantIds: string[];
  createdAt: string; // ISO string
};

export const OUTING_MAX_PARTICIPANTS = 15;
export const LIVE_LEAD_MS = 15 * 60 * 1000;
export const LIVE_DURATION_MS = 3 * 60 * 60 * 1000;

export function clampOutingCapacity(n: number): number {
  return Math.max(1, Math.min(OUTING_MAX_PARTICIPANTS, Math.round(n)));
}

export function isPlanLive(plan: Plan, nowMs: number = Date.now()): boolean {
  const startMs = new Date(plan.startTime).getTime();
  return nowMs >= startMs - LIVE_LEAD_MS && nowMs <= startMs + LIVE_DURATION_MS;
}

export function isPlanUpcoming(plan: Plan, nowMs: number = Date.now()): boolean {
  return new Date(plan.startTime).getTime() > nowMs;
}

export function isPlanPast(plan: Plan, nowMs: number = Date.now()): boolean {
  return new Date(plan.startTime).getTime() + LIVE_DURATION_MS < nowMs;
}

export function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const tmr = new Date(today);
  tmr.setDate(today.getDate() + 1);
  if (d.toDateString() === tmr.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(iso: string): string {
  return `${formatDayLabel(iso)} · ${formatTime(iso)}`;
}

export function isPlanFull(plan: Plan): boolean {
  return plan.maxParticipants != null && plan.participantIds.length >= plan.maxParticipants;
}
