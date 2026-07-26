// src/types/map.ts

export type Category = 'food' | 'nightlife' | 'outdoors' | 'culture' | 'other';

export type Friend = {
  id: string;
  initials: string;
  color: string;
  textColor: string;
};

export type MapEvent = {
  id: string;
  title: string;
  location: string;
  date: Date;
  latitude: number;
  longitude: number;
  goingCount: number;
  circleFriends: Friend[];
  isNew: boolean;
  category: Category;
};

export type CategoryStyle = {
  bg: string;
  border: string;
  icon: string;
  iconColor: string;
};

export const CATEGORY_STYLE: Record<Category, CategoryStyle> = {
  food:      { bg: '#FAECE7', border: '#D85A30', icon: 'restaurant',  iconColor: '#712B13' },
  nightlife: { bg: '#EEEDFE', border: '#7F77DD', icon: 'music-note',  iconColor: '#3C3489' },
  outdoors:  { bg: '#EAF3DE', border: '#639922', icon: 'terrain',     iconColor: '#27500A' },
  culture:   { bg: '#E1F5EE', border: '#1D9E75', icon: 'palette',     iconColor: '#085041' },
  other:     { bg: '#F1EFE8', border: '#888780', icon: 'place',       iconColor: '#444441' },
};

export function formatHour(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric' });
}

export function formatDayLabel(d: Date): string {
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const tmr = new Date(today);
  tmr.setDate(today.getDate() + 1);
  if (d.toDateString() === tmr.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString([], { weekday: 'short' });
}
