import { Opportunity } from '../types';

const FALLBACK_HACKATHONS: Opportunity[] = [
  {
    id: 9001,
    title: 'هاكاثون LEAP 2025',
    type: 'hackathon',
    organization: 'LEAP Conference',
    description: 'هاكاثون تقني كبير في إطار مؤتمر LEAP بالرياض.',
    deadline: '2025-09-01',
    location: 'الرياض، المملكة العربية السعودية',
    latitude: 24.7136,
    longitude: 46.6753,
    xpReward: 100,
    registrationLink: 'https://www.leapconference.com',
    imageUrl: null,
    isActive: 1,
    createdAt: new Date().toISOString(),
    status: 'upcoming',
    prize: '50,000 ريال',
  },
  {
    id: 9002,
    title: 'هاكاثون وزارة الاتصالات',
    type: 'hackathon',
    organization: 'وزارة الاتصالات وتقنية المعلومات',
    description: 'هاكاثون لتطوير حلول رقمية لخدمات الحكومة السعودية.',
    deadline: '2025-10-15',
    location: 'جدة، المملكة العربية السعودية',
    latitude: 21.4858,
    longitude: 39.1925,
    xpReward: 80,
    registrationLink: 'https://www.mcit.gov.sa',
    imageUrl: null,
    isActive: 1,
    createdAt: new Date().toISOString(),
    status: 'upcoming',
    prize: '30,000 ريال',
  },
];

export async function fetchHackathons(): Promise<Opportunity[]> {
  return FALLBACK_HACKATHONS;
}
