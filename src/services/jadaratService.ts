import { Opportunity } from '../types';

const JADARAT_API_KEY = 'YOUR_JADARAT_API_KEY';

const FALLBACK: Opportunity[] = [
  {
    id: 7001,
    title: 'برنامج تمهير - مطور تطبيقات',
    type: 'internship',
    organization: 'STC',
    description: 'برنامج تمهير لتطوير مهارات خريجي تقنية المعلومات في بيئة عمل حقيقية برعاية HRDF.',
    deadline: '2025-08-30',
    location: 'الرياض، المملكة العربية السعودية',
    latitude: 24.7136,
    longitude: 46.6753,
    xpReward: 80,
    registrationLink: 'https://jadarat.hrsd.gov.sa',
    imageUrl: null,
    isActive: 1,
    createdAt: new Date().toISOString(),
    status: 'open',
    duration: '6 أشهر',
    salary: '3000 ريال/شهر',
  },
  {
    id: 7002,
    title: 'تدريب تعاوني - هندسة البرمجيات',
    type: 'internship',
    organization: 'Aramco Digital',
    description: 'فرصة تدريب تعاوني لطلاب علوم الحاسب والهندسة في بيئة تقنية عالمية.',
    deadline: '2025-07-20',
    location: 'الظهران، المملكة العربية السعودية',
    latitude: 26.3081,
    longitude: 50.1478,
    xpReward: 80,
    registrationLink: 'https://jadarat.hrsd.gov.sa',
    imageUrl: null,
    isActive: 1,
    createdAt: new Date().toISOString(),
    status: 'open',
    duration: '3 أشهر',
    salary: '4000 ريال/شهر',
  },
  {
    id: 7003,
    title: 'برنامج التدريب الصيفي - تطوير الويب',
    type: 'internship',
    organization: 'stc pay',
    description: 'تدريب صيفي في تطوير تطبيقات الدفع الإلكتروني والخدمات المالية الرقمية.',
    deadline: '2025-06-30',
    location: 'الرياض، المملكة العربية السعودية',
    latitude: 24.7136,
    longitude: 46.6753,
    xpReward: 70,
    registrationLink: 'https://jadarat.hrsd.gov.sa',
    imageUrl: null,
    isActive: 1,
    createdAt: new Date().toISOString(),
    status: 'upcoming',
    duration: '2 أشهر',
    salary: '2500 ريال/شهر',
  },
  {
    id: 7004,
    title: 'تمهير - مهندس ذكاء اصطناعي',
    type: 'internship',
    organization: 'SDAIA',
    description: 'برنامج تمهير متخصص في الذكاء الاصطناعي وعلوم البيانات تحت إشراف الهيئة السعودية للبيانات.',
    deadline: '2025-09-15',
    location: 'الرياض، المملكة العربية السعودية',
    latitude: 24.7136,
    longitude: 46.6753,
    xpReward: 100,
    registrationLink: 'https://jadarat.hrsd.gov.sa',
    imageUrl: null,
    isActive: 1,
    createdAt: new Date().toISOString(),
    status: 'open',
    duration: '6 أشهر',
    salary: '5000 ريال/شهر',
  },
  {
    id: 7005,
    title: 'تدريب تعاوني - أمن المعلومات',
    type: 'internship',
    organization: 'ZATCA',
    description: 'تدريب تعاوني في مجال الأمن السيبراني وحماية البيانات في هيئة الزكاة والضريبة.',
    deadline: '2025-08-01',
    location: 'الرياض، المملكة العربية السعودية',
    latitude: 24.7136,
    longitude: 46.6753,
    xpReward: 75,
    registrationLink: 'https://jadarat.hrsd.gov.sa',
    imageUrl: null,
    isActive: 1,
    createdAt: new Date().toISOString(),
    status: 'open',
    duration: '4 أشهر',
    salary: '3500 ريال/شهر',
  },
];

export async function fetchJadaratOpportunities(): Promise<Opportunity[]> {
  if (JADARAT_API_KEY === 'YOUR_JADARAT_API_KEY') {
    return FALLBACK;
  }
  try {
    const res = await fetch(
      'https://api.jadarat.hrsd.gov.sa/v1/opportunities?type=internship&per_page=30',
      { headers: { Authorization: `Bearer ${JADARAT_API_KEY}`, Accept: 'application/json' } }
    );
    if (!res.ok) return FALLBACK;
    const json = await res.json();
    return json.data?.length ? json.data : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
