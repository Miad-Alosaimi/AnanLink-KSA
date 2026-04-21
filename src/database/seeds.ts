export const SEED_OPPORTUNITIES = [
  // ============ HACKATHONS ============
  {
    title: 'تحدي الابتكار KAUST 2025',
    type: 'hackathon',
    organization: 'جامعة الملك عبدالله للعلوم والتقنية',
    description:
      'هاكاثون لمدة 48 ساعة يركز على حلول الذكاء الاصطناعي لتحديات الاستدامة. شارك مع أفضل العقول التقنية في المملكة وفوز بجوائز تصل إلى 50,000 ريال.',
    deadline: '2025-08-15',
    location: 'ثول، مكة المكرمة',
    latitude: 22.3093,
    longitude: 39.1,
    xpReward: 150,
    registrationLink: 'https://hackathon.kaust.edu.sa',
  },
  {
    title: 'تحدي SDAIA للذكاء الاصطناعي',
    type: 'hackathon',
    organization: 'الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA)',
    description:
      'تحدٍّ وطني لتطوير حلول ذكاء اصطناعي تخدم أهداف رؤية 2030. المشاركة مفتوحة لفرق من 2-5 أفراد من الجامعات السعودية.',
    deadline: '2025-09-20',
    location: 'الرياض',
    latitude: 24.7136,
    longitude: 46.6753,
    xpReward: 200,
    registrationLink: 'https://sdaia.gov.sa/hackathon',
  },
  {
    title: 'بوتكامب تويق للبرمجة',
    type: 'hackathon',
    organization: 'أكاديمية تويق',
    description:
      'مسابقة برمجية مكثفة لمدة أسبوع تشمل تطوير تطبيقات الويب والجوال. الفائزون يحصلون على فرص تدريب مدفوعة وعروض توظيف.',
    deadline: '2025-07-30',
    location: 'الرياض',
    latitude: 24.75,
    longitude: 46.7,
    xpReward: 120,
    registrationLink: 'https://tuwaiq.edu.sa',
  },
  {
    title: 'هاكاثون منتدى رؤية 2030',
    type: 'hackathon',
    organization: 'مكتب تحقيق الرؤية',
    description:
      'هاكاثون رسمي ضمن فعاليات منتدى رؤية 2030، يستهدف تطوير حلول تقنية في قطاعات الصحة والتعليم والنقل.',
    deadline: '2025-10-01',
    location: 'الرياض، مركز الملك عبدالعزيز الدولي',
    latitude: 24.68,
    longitude: 46.72,
    xpReward: 180,
    registrationLink: 'https://vision2030.gov.sa',
  },

  // ============ INTERNSHIPS ============
  {
    title: 'برنامج تدريب STC لطلاب الحاسب',
    type: 'internship',
    organization: 'شركة الاتصالات السعودية (STC)',
    description:
      'برنامج تدريب صيفي مدته 3 أشهر في مجالات تطوير البرمجيات، الأمن السيبراني، والذكاء الاصطناعي. راتب شهري 4,000 ريال.',
    deadline: '2025-06-15',
    location: 'الرياض (مع خيار العمل عن بُعد جزئياً)',
    latitude: 24.69,
    longitude: 46.68,
    xpReward: 100,
    registrationLink: 'https://stc.com.sa/careers',
  },
  {
    title: 'تدريب أرامكو الرقمي — مسار البيانات',
    type: 'internship',
    organization: 'أرامكو السعودية الرقمية',
    description:
      'فرصة تدريبية نادرة مع فريق البيانات والتحليلات في أرامكو. يشمل العمل على مشاريع حقيقية في علوم البيانات وتعلم الآلة.',
    deadline: '2025-05-30',
    location: 'الظهران، المنطقة الشرقية',
    latitude: 26.2767,
    longitude: 50.1962,
    xpReward: 120,
    registrationLink: 'https://aramco.com/digital-internship',
  },
  {
    title: 'تدريب NEOM Tech — تطوير البرمجيات',
    type: 'internship',
    organization: 'شركة NEOM',
    description:
      'انضم لفريق تقنية NEOM وعمل على مشاريع المدن الذكية والبنية التحتية الرقمية لمدينة المستقبل.',
    deadline: '2025-07-10',
    location: 'تبوك، منطقة NEOM',
    latitude: 28.0,
    longitude: 35.2,
    xpReward: 140,
    registrationLink: 'https://neom.com/careers',
  },
  {
    title: 'فرصة تدريب في موارد بي',
    type: 'internship',
    organization: 'شركة موارد بي',
    description:
      'تدريب في تطوير تطبيقات الجوال (iOS & Android) لمدة شهرين مع إمكانية التحويل لوظيفة دائمة.',
    deadline: '2025-08-01',
    location: 'جدة',
    latitude: 21.5433,
    longitude: 39.1728,
    xpReward: 90,
    registrationLink: 'https://mawared.sa',
  },

  // ============ OPEN SOURCE ============
  {
    title: 'مشروع معالجة اللغة العربية — AraNLP',
    type: 'opensource',
    organization: 'مجتمع مطوري الذكاء الاصطناعي العربي',
    description:
      'مكتبة مفتوحة المصدر لمعالجة اللغة العربية الطبيعية. نحتاج مساهمين في تطوير نماذج NLP وتوثيق الكود.',
    deadline: null,
    location: 'عن بُعد',
    latitude: null,
    longitude: null,
    xpReward: 80,
    registrationLink: 'https://github.com/aranlp/aranlp',
  },
  {
    title: 'منصة البيانات المفتوحة لرؤية 2030',
    type: 'opensource',
    organization: 'الهيئة العامة للإحصاء',
    description:
      'ساهم في تطوير منصة حكومية مفتوحة المصدر لعرض وتحليل إحصاءات المملكة. يتطلب خبرة في React أو Python.',
    deadline: null,
    location: 'عن بُعد',
    latitude: null,
    longitude: null,
    xpReward: 70,
    registrationLink: 'https://github.com/gstat-ksa/open-data',
  },
  {
    title: 'تطبيق إدارة الجدول الدراسي الجامعي',
    type: 'opensource',
    organization: 'نادي Coders بجامعة KFUPM',
    description:
      'تطبيق React Native مفتوح المصدر يساعد الطلاب في إدارة جداولهم الدراسية. فرصة رائعة للمبتدئين في تطوير الجوال.',
    deadline: null,
    location: 'عن بُعد',
    latitude: null,
    longitude: null,
    xpReward: 60,
    registrationLink: 'https://github.com/kfupm-coders/schedule-app',
  },

  // ============ VOLUNTEER ============
  {
    title: 'دعم فعاليات KACST التقنية',
    type: 'volunteer',
    organization: 'مدينة الملك عبدالعزيز للعلوم والتقنية (KACST)',
    description:
      'نبحث عن متطوعين تقنيين لدعم المؤتمرات والفعاليات العلمية. المهام تشمل الدعم التقني، التوثيق، وإدارة وسائل التواصل.',
    deadline: '2025-09-05',
    location: 'الرياض',
    latitude: 24.76,
    longitude: 46.64,
    xpReward: 50,
    registrationLink: 'https://kacst.edu.sa/volunteer',
  },
  {
    title: 'تعليم البرمجة للمرحلة الابتدائية',
    type: 'volunteer',
    organization: 'مبادرة علّمني كود',
    description:
      'انضم لفريق من المتطوعين لتعليم أساسيات البرمجة للأطفال في المدارس الابتدائية. كل جلسة ساعتان أسبوعياً.',
    deadline: '2025-11-01',
    location: 'الرياض، جدة، الدمام',
    latitude: 24.7,
    longitude: 46.7,
    xpReward: 40,
    registrationLink: 'https://teachmetocode.sa',
  },
  {
    title: 'منظم فني في GITEX Saudi',
    type: 'volunteer',
    organization: 'معرض GITEX Saudi Arabia',
    description:
      'كن جزءاً من أكبر حدث تقني في المنطقة. نبحث عن متطوعين للمساعدة في الاستقبال، التوجيه، والدعم الفني للزوار.',
    deadline: '2025-10-15',
    location: 'الرياض، مركز الرياض للمعارض',
    latitude: 24.85,
    longitude: 46.72,
    xpReward: 60,
    registrationLink: 'https://gitexsaudi.com',
  },
];

// Mock leaderboard users for seeding
export const MOCK_LEADERBOARD_USERS = [
  { fullName: 'أمجاد الهيدان', firstName: 'أمجاد', lastName: 'الهيدان', email: 'amjad@kfupm.edu.sa', university: 'KFUPM', major: 'Computer Science', specialty: 'AI/ML', academicYear: 3, xp: 1240, level: 12 },
  { fullName: 'محمد العمري', firstName: 'محمد', lastName: 'العمري', email: 'mohammed@ksu.edu.sa', university: 'KSU', major: 'Computer Science', specialty: 'Backend', academicYear: 4, xp: 980, level: 9 },
  { fullName: 'هند الغامدي', firstName: 'هند', lastName: 'الغامدي', email: 'hind@kau.edu.sa', university: 'KAU', major: 'Information Systems', specialty: 'Frontend', academicYear: 3, xp: 870, level: 8 },
  { fullName: 'عبدالله الشمري', firstName: 'عبدالله', lastName: 'الشمري', email: 'abdullah@psu.edu.sa', university: 'PSU', major: 'Software Engineering', specialty: 'Mobile', academicYear: 4, xp: 720, level: 7 },
  { fullName: 'رنا القحطاني', firstName: 'رنا', lastName: 'القحطاني', email: 'rana@uqu.edu.sa', university: 'UQU', major: 'Computer Science', specialty: 'Cybersecurity', academicYear: 2, xp: 640, level: 6 },
  { fullName: 'فيصل الدوسري', firstName: 'فيصل', lastName: 'الدوسري', email: 'faisal@iau.edu.sa', university: 'IAU', major: 'Computer Engineering', specialty: 'Cloud', academicYear: 4, xp: 520, level: 5 },
  { fullName: 'نورة السلمي', firstName: 'نورة', lastName: 'السلمي', email: 'noura@kfupm.edu.sa', university: 'KFUPM', major: 'Computer Science', specialty: 'Data Science', academicYear: 3, xp: 460, level: 4 },
  { fullName: 'سلطان المالكي', firstName: 'سلطان', lastName: 'المالكي', email: 'sultan@ksu.edu.sa', university: 'KSU', major: 'Information Technology', specialty: 'DevOps', academicYear: 4, xp: 380, level: 3 },
  { fullName: 'لمى الحربي', firstName: 'لمى', lastName: 'الحربي', email: 'lama@kau.edu.sa', university: 'KAU', major: 'Computer Science', specialty: 'UI/UX', academicYear: 2, xp: 290, level: 2 },
  { fullName: 'يوسف العتيبي', firstName: 'يوسف', lastName: 'العتيبي', email: 'yousef@pmu.edu.sa', university: 'PMU', major: 'Software Engineering', specialty: 'Full Stack', academicYear: 3, xp: 210, level: 2 },
];
