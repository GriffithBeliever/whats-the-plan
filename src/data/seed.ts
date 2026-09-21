// src/data/seed.ts
// Generates the in-memory placeholder dataset the whole app runs on: a pool of
// plans, a handful of fake users to populate them, and chat history for the
// groups the test account belongs to. Everything is produced by a seeded PRNG
// so a fresh app launch always gets the same, demo-friendly world (including a
// plan that is "live" right now and one starting in a few minutes) without
// needing a backend yet. Swapping this for real API data later just means
// replacing where AppStateContext gets its initial plans/groups from.
import { gradients, icons } from '../theme/theme';
import {
  Plan,
  PlanCard,
  ServiceCard,
  ItemCard,
  InstaPayCard,
  clampOutingCapacity,
} from '../types/plan';
import { User, Group, ChatMessage } from '../types/social';

function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

function pickN<T>(rng: () => number, arr: readonly T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

const VENUES = [
  'Riverside Park', 'Skyline Rooftop', 'The Attic Bar', 'Botanical Gardens',
  'Old Town Square', 'Sunset Pier', 'Cedar Hall', 'Blue Note Lounge',
  'Maple Street Studio', 'Harbor Deck', 'The Glasshouse', 'Northside Arena',
  'Level 9 Sky Bar', 'Willow Creek Trailhead', 'The Vinyl Room', 'Central Plaza',
  'Lantern Courtyard', 'The Warehouse', 'Riviera Beach Club', 'Ivy Rooftop Garden',
];

const OUTING_TITLES = [
  'Board Game Night', 'Beach Bonfire', 'Sunset Hike', 'Trivia Night',
  'Karaoke Session', 'Brunch Meetup', 'Pickup Basketball', 'Wine Tasting',
  'Movie Marathon', 'Paint & Sip', 'Bowling Night', 'Rooftop BBQ',
  'Kayak Trip', 'Cooking Class', 'Poker Night',
];

const EVENT_TITLES = [
  'Summer Music Festival', 'Tech Meetup', 'Charity Gala', 'Startup Pitch Night',
  'Food & Wine Expo', 'Art Exhibition Opening', 'Comedy Show', 'Fashion Show',
  'Jazz Concert', 'Community Fun Run', 'Film Screening', 'Craft Beer Festival',
  'Dance Showcase', 'Indie Book Fair', 'New Year Countdown',
];

const FAKE_NAMES = [
  'Maya Chen', 'Leo Fontaine', 'Sara Haddad', 'Omar Fares', 'Nadine Aoun',
  'Jack Bennett', 'Priya Nair', 'Diego Alvarez', 'Yara Khoury', 'Tom Richter',
  'Amira Saleh', 'Noah Kim', 'Lina Abboud', 'Chris Palmer', 'Rania Zaidan',
  'Sam Okafor', 'Elena Rossi', 'Karim Nasser', 'Hana Suzuki', 'Ben Carter',
];

const AMENITIES_POOL = [
  'Free Parking', 'Welcome Drink', 'Live DJ', 'Photo Booth', 'Goodie Bag',
  'Free WiFi', 'Coat Check', 'Shuttle Service',
];

const CHAT_LINES = [
  "Can't wait for this!",
  'Who else is coming?',
  'Should we carpool?',
  "I'll bring some snacks",
  'What time should we get there?',
  'This is going to be so much fun',
  'Just RSVP’d, see you all there',
  'Is parking easy around there?',
  'Reminder: it starts soon!',
  'Anyone want to meet up beforehand?',
];

function makeUsers(rng: () => number): User[] {
  return FAKE_NAMES.map((name, i) => ({
    id: `u${i + 1}`,
    name,
    username: name.toLowerCase().replace(/\s+/g, '.'),
    phone: '',
    bio: '',
    avatarEmoji: pick(rng, icons),
    avatarGradient: pick(rng, gradients),
    bannerGradient: pick(rng, gradients),
  }));
}

function makeCard(rng: () => number, id: string, isPaid: boolean): PlanCard {
  const kind = pick(rng, ['service', 'item', 'instapay'] as const);
  const price = isPaid ? Math.round(3 + rng() * 25) : 0;
  const preorderEnabled = rng() < 0.6;

  if (kind === 'service') {
    const card: ServiceCard = {
      id, kind: 'service', preorderEnabled, price,
      title: pick(rng, ['Face Painting', 'Massage Chair', 'Bartender Request', 'Photo Session', 'Bike Rental']),
      description: 'One request per person — join the queue and we’ll call you.',
      estimatedWaitMinutes: 5 + Math.floor(rng() * 20),
      queueLength: Math.floor(rng() * 6),
      myQueuePosition: null,
    };
    return card;
  }
  if (kind === 'item') {
    const unlimited = rng() < 0.4;
    const quantityTotal = unlimited ? null : 10 + Math.floor(rng() * 40);
    const card: ItemCard = {
      id, kind: 'item', preorderEnabled, price,
      title: pick(rng, ['Welcome Drink', 'Snack Box', 'Event T-Shirt', 'Raffle Ticket', 'BBQ Plate']),
      description: unlimited ? 'Order as many as you like.' : 'Limited stock — first come, first served.',
      unlimited,
      quantityTotal,
      quantityRemaining: quantityTotal,
      myOrderedCount: 0,
    };
    return card;
  }
  const card: InstaPayCard = {
    id, kind: 'instapay', preorderEnabled: false,
    price: Math.max(price, 5),
    title: pick(rng, ['Skip-the-Line Pass', 'VIP Upgrade', 'Express Entry']),
    description: 'Buy instantly, no cart needed.',
    claimed: false,
  };
  return card;
}

export type SeedData = {
  currentUser: User;
  users: User[];
  plans: Plan[];
  groups: Group[];
};

export function generateSeedData(seedValue = 42): SeedData {
  const rng = mulberry32(seedValue);
  const users = makeUsers(rng);
  const now = Date.now();

  const currentUser: User = {
    id: 'me',
    name: 'Alex Morgan',
    username: 'alex.morgan',
    phone: '+1 555 0100',
    bio: "Always down for the next plan.",
    avatarEmoji: '🙂',
    avatarGradient: ['#38BDF8', '#0E7490'],
    bannerGradient: ['#F97066', '#7F1D1D'],
  };

  const PLAN_COUNT = 100;
  const plans: Plan[] = [];

  for (let i = 0; i < PLAN_COUNT; i++) {
    const id = `p${i + 1}`;
    const kind = rng() < 0.6 ? 'outing' : 'event';
    const title = kind === 'outing' ? pick(rng, OUTING_TITLES) : pick(rng, EVENT_TITLES);
    const venue = pick(rng, VENUES);
    const dayOffset = Math.floor(rng() * 40) - 10; // -10..+29 days from now
    const hour = 9 + Math.floor(rng() * 14); // 9am - 11pm
    const start = new Date(now);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(hour, rng() < 0.5 ? 0 : 30, 0, 0);

    const isPublic = rng() < 0.8;
    const hasGroupChat = rng() < 0.5;
    const isPaid = rng() < 0.5;
    const organizerId = rng() < 0.06 ? 'me' : pick(rng, users).id;
    const maxParticipants = kind === 'outing' ? clampOutingCapacity(4 + rng() * 11) : null;

    const participantPool = users.filter(u => u.id !== organizerId);
    const participantCount = Math.min(
      participantPool.length,
      kind === 'outing' ? 2 + Math.floor(rng() * 10) : 5 + Math.floor(rng() * 30),
    );
    const participantIds = pickN(rng, participantPool.map(u => u.id), participantCount);
    if (organizerId === 'me' && !participantIds.includes('me')) participantIds.push('me');

    const cardCount = 1 + Math.floor(rng() * 4);
    const cards = Array.from({ length: cardCount }, (_, ci) => makeCard(rng, `${id}-c${ci + 1}`, isPaid));

    plans.push({
      id,
      kind,
      title,
      description: `Join us for ${title.toLowerCase()} at ${venue}. Good company, good vibes.`,
      location: venue,
      latitude: 40.73 + (rng() - 0.5) * 0.12,
      longitude: -73.99 + (rng() - 0.5) * 0.12,
      startTime: start.toISOString(),
      gradient: pick(rng, gradients),
      icon: pick(rng, icons),
      isPublic,
      hasGroupChat,
      maxParticipants,
      splitBillEnabled: kind === 'outing' ? rng() < 0.4 : false,
      isPaid,
      ticketPrice: isPaid ? Math.round(5 + rng() * 55) : 0,
      amenities: pickN(rng, AMENITIES_POOL, Math.floor(rng() * 4)),
      cards,
      organizerId,
      participantIds,
      createdAt: new Date(start.getTime() - (2 + rng() * 20) * 86400000).toISOString(),
    });
  }

  // Guarantee the test account (`me`) is registered in ~10 plans, on top of
  // whatever it organizes: pick public plans it isn't already part of.
  const mine = plans.filter(p => p.participantIds.includes('me'));
  const needed = Math.max(0, 10 - mine.length);
  const candidates = plans.filter(p => !p.participantIds.includes('me') && p.isPublic);
  for (const p of pickN(rng, candidates, needed)) {
    p.participantIds.push('me');
  }

  // Make sure there's always something to demo immediately: one plan already
  // live (started 10 min ago) and one starting very soon (in 8 min).
  const joined = plans.filter(p => p.participantIds.includes('me'));
  if (joined[0]) {
    joined[0].startTime = new Date(now - 10 * 60 * 1000).toISOString();
    joined[0].hasGroupChat = true;
  }
  if (joined[1]) {
    joined[1].startTime = new Date(now + 8 * 60 * 1000).toISOString();
    joined[1].hasGroupChat = true;
  }

  const groups: Group[] = [];
  for (const plan of plans) {
    if (!plan.hasGroupChat) continue;
    const messages: ChatMessage[] = [];
    if (plan.participantIds.includes('me')) {
      const chatters = pickN(rng, plan.participantIds.filter(id => id !== 'me'), Math.min(4, plan.participantIds.length));
      const lineCount = 4 + Math.floor(rng() * 5);
      let lastLine = '';
      for (let m = 0; m < lineCount; m++) {
        const senderId = m === lineCount - 1 ? 'me' : pick(rng, chatters.length ? chatters : ['me']);
        const sender = senderId === 'me' ? currentUser : users.find(u => u.id === senderId)!;
        let line = pick(rng, CHAT_LINES);
        if (line === lastLine && CHAT_LINES.length > 1) line = pick(rng, CHAT_LINES.filter(l => l !== lastLine));
        lastLine = line;
        messages.push({
          id: `${plan.id}-m${m + 1}`,
          groupId: plan.id,
          senderId: sender.id,
          senderName: sender.name,
          senderEmoji: sender.avatarEmoji,
          text: line,
          createdAt: new Date(now - (lineCount - m) * 40 * 60000).toISOString(),
        });
      }
    }
    groups.push({ id: plan.id, planId: plan.id, messages });
  }

  return { currentUser, users, plans, groups };
}
