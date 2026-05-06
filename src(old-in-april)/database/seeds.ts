import { SQLiteDatabase } from 'expo-sqlite';

const SEED_OPPORTUNITIES = [
  {
    title: 'هاكاثون KFUPM للابتكار 2025',
    type: 'hackathon',
    organization: 'جامعة الملك فهد للبترول والمعادن',
    description: 'هاكاثون يجمع طلاب الحوسبة لبناء حلول تقنية مبتكرة في مجال الطاقة والبيئة خلال 48 ساعة. الفرصة مفتوحة لجميع طلاب الجامعات السعودية.',
    deadline: '2025-06-15',
    location: 'الظهران، المنطقة الشرقية',
    registrationLink: 'https://hackathon.kfupm.edu.sa',
  },
  {
    title: 'تدريب صيفي — شركة أرامكو السعودية',
    type: 'internship',
    organization: 'أرامكو السعودية',
    description: 'برنامج تدريب صيفي في قسم تقنية المعلومات لمدة ثلاثة أشهر. فرصة للعمل مع فريق متميز على مشاريع تقنية حقيقية وتطبيق ما تعلمته في بيئة احترافية.',
    deadline: '2025-05-01',
    location: 'الرياض',
    registrationLink: 'https://careers.aramco.com/internships',
  },
  {
    title: 'مساهمة في مشروع Riyadh-OS',
    type: 'opensource',
    organization: 'مجتمع المطورين السعوديين',
    description: 'مشروع مفتوح المصدر يهدف إلى بناء نظام إدارة المهام بالعربية. نبحث عن مطورين للمساهمة في الكود، تحسين الواجهة، وكتابة الاختبارات.',
    deadline: null,
    location: 'عن بُعد',
    registrationLink: 'https://github.com/saudi-devs/riyadh-os',
  },
  {
    title: 'تطوع في مهرجان LEAP 2025',
    type: 'volunteer',
    organization: 'مؤتمر LEAP للتقنية',
    description: 'انضم كمتطوع في أكبر مؤتمر تقني في الشرق الأوسط. ستساعد في استقبال الضيوف، إدارة الجلسات، ودعم المشاركين. فرصة للتواصل مع كبار خبراء التقنية.',
    deadline: '2025-02-10',
    location: 'الرياض، مركز الملك عبدالعزيز الدولي للمؤتمرات',
    registrationLink: 'https://leap.tech/volunteer',
  },
  {
    title: 'هاكاثون الذكاء الاصطناعي — SDAIA',
    type: 'hackathon',
    organization: 'هيئة البيانات والذكاء الاصطناعي',
    description: 'هاكاثون وطني يركز على بناء تطبيقات الذكاء الاصطناعي التي تخدم رؤية 2030. جوائز تصل إلى 300,000 ريال.',
    deadline: '2025-07-20',
    location: 'الرياض',
    registrationLink: 'https://sdaia.gov.sa/hackathon',
  },
  {
    title: 'تدريب تعاوني — STC',
    type: 'internship',
    organization: 'شركة الاتصالات السعودية',
    description: 'فرصة تدريب تعاوني لمدة ستة أشهر في قسم التحول الرقمي. مناسب لطلاب السنة الثالثة والرابعة في تخصصات الحوسبة والهندسة.',
    deadline: '2025-04-30',
    location: 'الرياض',
    registrationLink: 'https://www.stc.com.sa/careers',
  },
];

export const seedOpportunities = async (db: SQLiteDatabase): Promise<void> => {
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM opportunities'
  );
  if (existing && existing.count > 0) return;

  for (const opp of SEED_OPPORTUNITIES) {
    await db.runAsync(
      `INSERT INTO opportunities (title, type, organization, description, deadline, location, registrationLink)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [opp.title, opp.type, opp.organization, opp.description, opp.deadline ?? null, opp.location, opp.registrationLink]
    );
  }
};
