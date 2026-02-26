export const SPORTS_MEET_STORAGE_KEY = 'kpt_sports_meet_events_v1';

const indoorSeed = ['Chess', 'Table Tennis', 'Yoga'];

const outdoorSeed = [
  '100 M Race',
  '200 M Race',
  '400 M Race',
  '800 M Race',
  '1 KM Race',
  '1500 M Race',
  '3 KM Race',
  '4 x 100 M Relay',
  '4 x 400 M Relay',
  'Discus',
  'Long Jump',
  'High Jump',
  'Triple Jump',
  'Javelin Throw',
  'Cricket',
  'Kabaddi',
  'Volleyball',
  'Athletics',
];

const toSeedEvent = (eventName, category) => ({
  id: `${eventName}-${category}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  eventName,
  category,
  sportType: category === 'Indoor' ? 'Mind Sport' : 'Athletics',
  entryFee: '',
  level: 'Open',
  gender: 'Mixed',
  eventType: eventName === 'Cricket' || eventName === 'Kabaddi' || eventName === 'Volleyball' ? 'Team' : 'Individual',
  maxParticipants: '',
  maxTeams: '',
  date: '',
  time: '',
  venue: '',
  status: 'Open',
});

export const SPORTS_MEET_SEED = [
  ...indoorSeed.map((name) => toSeedEvent(name, 'Indoor')),
  ...outdoorSeed.map((name) => toSeedEvent(name, 'Outdoor')),
];

export const readSportsMeetEvents = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(SPORTS_MEET_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(SPORTS_MEET_STORAGE_KEY, JSON.stringify(SPORTS_MEET_SEED));
    return SPORTS_MEET_SEED;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SPORTS_MEET_SEED;
  } catch {
    window.localStorage.setItem(SPORTS_MEET_STORAGE_KEY, JSON.stringify(SPORTS_MEET_SEED));
    return SPORTS_MEET_SEED;
  }
};

export const writeSportsMeetEvents = (events) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SPORTS_MEET_STORAGE_KEY, JSON.stringify(events));
};
