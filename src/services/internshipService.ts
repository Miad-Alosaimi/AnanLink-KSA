import { Opportunity } from '../types';

const FALLBACK_INTERNSHIPS: Opportunity[] = [
  {
    id: 8001,
    title: 'مطور تطبيقات موبايل - تدريب',
    type: 'internship',
    organization: 'STC',
    description: 'فرصة تدريبية في تطوير تطبيقات الجوال لطلاب علوم الحاسب.',
    deadline: '2025-08-01',
    location: 'الرياض، المملكة العربية السعودية',
    latitude: 24.7136,
    longitude: 46.6753,
    xpReward: 60,
    registrationLink: 'https://www.stc.com.sa/careers',
    imageUrl: null,
    isActive: 1,
    createdAt: new Date().toISOString(),
    status: 'open',
    duration: '3 أشهر',
    salary: 'مدفوع',
  },
  {
    id: 8002,
    title: 'مهندس برمجيات - تدريب صيفي',
    type: 'internship',
    organization: 'Aramco Digital',
    description: 'برنامج التدريب الصيفي لطلاب الجامعات في مجال البرمجيات.',
    deadline: '2025-07-15',
    location: 'الدمام، المملكة العربية السعودية',
    latitude: 26.4207,
    longitude: 50.0888,
    xpReward: 60,
    registrationLink: 'https://www.aramco.com/careers',
    imageUrl: null,
    isActive: 1,
    createdAt: new Date().toISOString(),
    status: 'open',
    duration: '2 أشهر',
    salary: 'مدفوع',
  },
];

export async function fetchInternships(): Promise<Opportunity[]> {
  return FALLBACK_INTERNSHIPS;
}
