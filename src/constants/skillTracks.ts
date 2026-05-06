import { Colors } from './colors';
import { XP_VALUES } from './xpValues';

export type GradientColors = readonly [string, string, ...string[]];
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface SkillUnit {
  title: string;
  desc: string;
  hours: number;
  tech?: string;
}

export interface SkillTrack {
  id: string;
  title: string;
  icon: string;
  gradient: GradientColors;
  tech: string;
  difficulty: Difficulty;
  tags?: string[];
  prerequisite?: { requiredTrackId?: string; unitsRequired: number };
  units: SkillUnit[];
}

/** 9 career paths — matches the register-screen dropdown. */
export type CareerId =
  | 'frontend'
  | 'backend'
  | 'mobile'
  | 'data-science'
  | 'ai'
  | 'cybersecurity'
  | 'cloud'
  | 'devops'
  | 'uiux';

export const CAREERS: { id: CareerId; title: string; icon: string }[] = [
  { id: 'frontend',      title: 'Front-end Development',      icon: '🎨' },
  { id: 'backend',       title: 'Back-end Development',       icon: '⚙️' },
  { id: 'mobile',        title: 'Mobile Development',         icon: '📱' },
  { id: 'data-science',  title: 'Data Science',               icon: '📊' },
  { id: 'ai',            title: 'Artificial Intelligence',    icon: '🤖' },
  { id: 'cybersecurity', title: 'Cybersecurity',              icon: '🔒' },
  { id: 'cloud',         title: 'Cloud Computing',            icon: '☁️' },
  { id: 'devops',        title: 'DevOps',                     icon: '🔧' },
  { id: 'uiux',          title: 'UI/UX Design',               icon: '✨' },
];

/** Tracks that are NOT assigned to any career yet but still appear in "استكشاف". */
export const SKILL_TRACKS: SkillTrack[] = [
  // =========================
  // Front-end related
  // =========================
  {
    id: 'html-css', title: 'HTML & CSS', icon: '🖌️',
    gradient: ['#E34F26', '#F06529'],
    tech: 'Web Fundamentals', difficulty: 'beginner',
    tags: ['HTML', 'CSS', 'Flexbox'],
    units: [
      { title: 'HTML الدلالي', desc: 'Semantic tags and structure', hours: 3 },
      { title: 'CSS الأساسي', desc: 'Selectors, box model, specificity', hours: 4 },
      { title: 'Flexbox', desc: 'Modern 1D layouts', hours: 3 },
      { title: 'CSS Grid', desc: 'Modern 2D layouts', hours: 4 },
      { title: 'Responsive Design', desc: 'Media queries and mobile-first', hours: 4 },
      { title: 'مشروع صفحة ويب', desc: 'Portfolio page', hours: 5 },
    ],
  },
  {
    id: 'javascript', title: 'JavaScript', icon: '📜',
    gradient: ['#F7DF1E', '#F0DB4F'],
    tech: 'Modern ES6+', difficulty: 'beginner',
    tags: ['JS', 'ES6', 'DOM'],
    units: [
      { title: 'أساسيات JavaScript', desc: 'Variables, types, operators', hours: 4 },
      { title: 'Functions & Scope', desc: 'Closures, hoisting, arrow fns', hours: 5 },
      { title: 'Arrays & Objects', desc: 'Methods, destructuring, spread', hours: 4 },
      { title: 'Async JavaScript', desc: 'Promises, async/await, fetch', hours: 6 },
      { title: 'DOM Manipulation', desc: 'Events, selectors, updates', hours: 4 },
      { title: 'ES Modules', desc: 'import/export, bundlers', hours: 3 },
      { title: 'مشروع تفاعلي', desc: 'Todo app or quiz app', hours: 6 },
    ],
  },
  {
    id: 'typescript', title: 'TypeScript', icon: '🔷',
    gradient: ['#3178C6', '#235A97'],
    tech: 'Type-safe JavaScript', difficulty: 'intermediate',
    tags: ['TypeScript', 'Types'],
    units: [
      { title: 'مقدمة TypeScript', desc: 'Why types, basic setup', hours: 3 },
      { title: 'Types & Interfaces', desc: 'Primitive types, object types', hours: 4 },
      { title: 'Generics', desc: 'Reusable type-safe code', hours: 5 },
      { title: 'Utility Types', desc: 'Partial, Pick, Omit, Record', hours: 4 },
      { title: 'Type Narrowing', desc: 'Type guards and discriminated unions', hours: 4 },
      { title: 'مشروع TypeScript', desc: 'Convert JS project to TS', hours: 5 },
    ],
  },
  {
    id: 'react', title: 'React', icon: '⚛️',
    gradient: ['#61DAFB', '#282C34'],
    tech: 'React & Hooks', difficulty: 'intermediate',
    tags: ['React', 'Hooks', 'JSX'],
    units: [
      { title: 'مقدمة React', desc: 'Components, JSX, Props', hours: 5 },
      { title: 'React Hooks', desc: 'useState, useEffect, useRef', hours: 5 },
      { title: 'Custom Hooks', desc: 'Extracting reusable logic', hours: 4 },
      { title: 'Context API', desc: 'Cross-tree state sharing', hours: 4 },
      { title: 'React Router', desc: 'Client-side routing', hours: 3 },
      { title: 'Performance', desc: 'memo, useMemo, useCallback', hours: 4 },
      { title: 'React Query', desc: 'Server state management', hours: 5 },
      { title: 'مشروع SPA', desc: 'Complete single-page app', hours: 10 },
    ],
  },
  {
    id: 'uiux-basics', title: 'UI/UX Basics', icon: '🎯',
    gradient: ['#FF6B9D', '#C4266B'],
    tech: 'Design fundamentals for developers', difficulty: 'beginner',
    tags: ['UX', 'UI', 'Design'],
    units: [
      { title: 'مبادئ التصميم', desc: 'Hierarchy, contrast, spacing', hours: 3 },
      { title: 'نظرية الألوان', desc: 'Palettes, accessibility, mood', hours: 3 },
      { title: 'Typography', desc: 'Type scales, readability, RTL', hours: 3 },
      { title: 'Design Systems', desc: 'Tokens, components, consistency', hours: 4 },
      { title: 'A/B Testing', desc: 'User-driven design decisions', hours: 3 },
    ],
  },

  // =========================
  // Back-end related
  // =========================
  {
    id: 'nodejs', title: 'Node.js', icon: '🟢',
    gradient: ['#339933', '#27632A'],
    tech: 'Node.js & Express', difficulty: 'intermediate',
    tags: ['Node', 'Express'],
    units: [
      { title: 'مقدمة Node.js', desc: 'Runtime and event loop', hours: 4 },
      { title: 'Express Framework', desc: 'Routes, middleware, MVC', hours: 5 },
      { title: 'REST APIs', desc: 'Design and best practices', hours: 5 },
      { title: 'File System & Streams', desc: 'fs, streams, buffers', hours: 4 },
      { title: 'Error Handling', desc: 'Async errors, middleware', hours: 3 },
      { title: 'مشروع API', desc: 'Full REST API with Express', hours: 8 },
    ],
  },
  {
    id: 'sql', title: 'قواعد البيانات SQL', icon: '🗄️',
    gradient: ['#336791', '#1F4068'],
    tech: 'PostgreSQL & Design', difficulty: 'intermediate',
    tags: ['SQL', 'PostgreSQL', 'Database'],
    units: [
      { title: 'مقدمة SQL', desc: 'SELECT, WHERE, ORDER BY', hours: 4 },
      { title: 'JOINs', desc: 'INNER, LEFT, RIGHT, OUTER joins', hours: 4 },
      { title: 'Aggregation', desc: 'GROUP BY, HAVING, window fns', hours: 4 },
      { title: 'Schema Design', desc: 'Normalization, relationships', hours: 5 },
      { title: 'Indexes & Performance', desc: 'EXPLAIN, query optimization', hours: 5 },
      { title: 'Transactions', desc: 'ACID, isolation levels', hours: 4 },
      { title: 'مشروع قاعدة بيانات', desc: 'Design and query a full schema', hours: 6 },
    ],
  },
  {
    id: 'rest-apis', title: 'REST APIs', icon: '🔌',
    gradient: ['#FF6B35', '#C14810'],
    tech: 'API Design Patterns', difficulty: 'intermediate',
    tags: ['REST', 'API', 'HTTP'],
    units: [
      { title: 'HTTP Fundamentals', desc: 'Methods, status codes, headers', hours: 3 },
      { title: 'REST Principles', desc: 'Resources, statelessness, versioning', hours: 4 },
      { title: 'API Documentation', desc: 'Swagger/OpenAPI', hours: 3 },
      { title: 'Rate Limiting', desc: 'Protecting your API', hours: 3 },
      { title: 'API Testing', desc: 'Postman, automated tests', hours: 4 },
    ],
  },
  {
    id: 'auth', title: 'المصادقة والتفويض', icon: '🔐',
    gradient: ['#8B5CF6', '#6D28D9'],
    tech: 'JWT, OAuth, Sessions', difficulty: 'intermediate',
    tags: ['JWT', 'OAuth', 'Security'],
    units: [
      { title: 'Sessions vs Tokens', desc: 'Trade-offs and use cases', hours: 3 },
      { title: 'JWT', desc: 'Structure, signing, verification', hours: 4 },
      { title: 'OAuth 2.0', desc: 'Authorization flows', hours: 5 },
      { title: 'Password Hashing', desc: 'bcrypt, argon2', hours: 3 },
      { title: 'Role-Based Access', desc: 'RBAC, permissions', hours: 4 },
    ],
  },
  {
    id: 'testing', title: 'اختبار البرمجيات', icon: '🧪',
    gradient: ['#10B981', '#047857'],
    tech: 'Jest & TDD', difficulty: 'intermediate',
    tags: ['Jest', 'TDD', 'Testing'],
    units: [
      { title: 'مقدمة الاختبار', desc: 'Why, unit vs integration', hours: 3 },
      { title: 'Jest Basics', desc: 'describe, it, expect, matchers', hours: 4 },
      { title: 'Mocking', desc: 'Mock functions, modules, timers', hours: 4 },
      { title: 'TDD', desc: 'Red-green-refactor cycle', hours: 4 },
      { title: 'E2E Testing', desc: 'Cypress or Playwright', hours: 5 },
    ],
  },

  // =========================
  // Mobile
  // =========================
  {
    id: 'react-native', title: 'React Native', icon: '📱',
    gradient: [Colors.opportunity.internship, Colors.primary.teal3],
    tech: 'React Native & Expo', difficulty: 'intermediate',
    tags: ['React Native', 'Expo', 'TypeScript'],
    units: [
      { title: 'مقدمة React Native', desc: 'Environment setup, JSX', hours: 4, tech: 'Expo' },
      { title: 'Core Components', desc: 'View, Text, Image, Touchable', hours: 4 },
      { title: 'التنقل بين الشاشات', desc: 'React Navigation v7', hours: 5 },
      { title: 'Styling', desc: 'StyleSheet, Flexbox on mobile', hours: 4 },
      { title: 'Lists & Forms', desc: 'FlatList, inputs, validation', hours: 5 },
      { title: 'مشروع تطبيق', desc: 'Complete mobile app', hours: 12 },
    ],
  },
  {
    id: 'native-apis', title: 'Native Device APIs', icon: '📲',
    gradient: ['#00C9FF', '#92FE9D'],
    tech: 'Camera, GPS, Storage', difficulty: 'intermediate',
    tags: ['Camera', 'Location', 'Storage'],
    units: [
      { title: 'إدارة الأذونات', desc: 'Permission requests and denial', hours: 3 },
      { title: 'الكاميرا ومسح QR', desc: 'expo-camera, barcodes', hours: 4 },
      { title: 'الموقع الجغرافي', desc: 'expo-location, maps', hours: 4 },
      { title: 'SQLite المحلي', desc: 'expo-sqlite, persistence', hours: 5 },
      { title: 'AsyncStorage', desc: 'Key-value persistence', hours: 3 },
    ],
  },
  {
    id: 'state-management', title: 'State Management', icon: '🧭',
    gradient: ['#764ABC', '#593B99'],
    tech: 'Context, Zustand, Redux', difficulty: 'intermediate',
    tags: ['Context', 'Zustand', 'Redux'],
    units: [
      { title: 'Local State', desc: 'useState, useReducer', hours: 3 },
      { title: 'Context API', desc: 'Provider patterns, pitfalls', hours: 4 },
      { title: 'Zustand', desc: 'Simple global state', hours: 4 },
      { title: 'Redux Toolkit', desc: 'Slices, async thunks', hours: 6 },
    ],
  },
  {
    id: 'mobile-ui', title: 'Mobile UI Patterns', icon: '📐',
    gradient: ['#F093FB', '#F5576C'],
    tech: 'iOS & Android patterns', difficulty: 'beginner',
    tags: ['UI', 'Animation', 'RTL'],
    units: [
      { title: 'Platform Differences', desc: 'iOS vs Android conventions', hours: 3 },
      { title: 'Animations', desc: 'Animated API, Reanimated', hours: 5 },
      { title: 'Gesture Handling', desc: 'Pan, pinch, long-press', hours: 4 },
      { title: 'RTL Support', desc: 'Arabic layouts in RN', hours: 3 },
    ],
  },
  {
    id: 'app-publishing', title: 'نشر التطبيقات', icon: '🚀',
    gradient: ['#4FACFE', '#00F2FE'],
    tech: 'App Store & Play Store', difficulty: 'advanced',
    tags: ['EAS', 'Publishing'],
    units: [
      { title: 'EAS Build', desc: 'Production builds with Expo', hours: 4 },
      { title: 'App Store Submission', desc: 'Apple review process', hours: 5 },
      { title: 'Play Store Submission', desc: 'Google review process', hours: 4 },
      { title: 'OTA Updates', desc: 'Expo updates without rebuild', hours: 3 },
    ],
  },

  // =========================
  // Data Science
  // =========================
  {
    id: 'python', title: 'Python', icon: '🐍',
    gradient: ['#3776AB', '#FFD43B'],
    tech: 'Python Essentials', difficulty: 'beginner',
    tags: ['Python', 'Basics'],
    units: [
      { title: 'أساسيات Python', desc: 'Variables, types, control flow', hours: 5 },
      { title: 'Functions & Modules', desc: 'def, imports, scope', hours: 4 },
      { title: 'Lists, Dicts, Sets', desc: 'Collections and comprehensions', hours: 4 },
      { title: 'OOP', desc: 'Classes, inheritance, dunders', hours: 5 },
      { title: 'File I/O', desc: 'Reading, writing, CSV, JSON', hours: 3 },
      { title: 'Error Handling', desc: 'try/except, custom exceptions', hours: 3 },
      { title: 'Virtual Environments', desc: 'venv, pip, requirements.txt', hours: 2 },
    ],
  },
  {
    id: 'statistics', title: 'الإحصاء', icon: '📈',
    gradient: ['#667EEA', '#764BA2'],
    tech: 'Statistics for Data', difficulty: 'intermediate',
    tags: ['Statistics', 'Probability'],
    units: [
      { title: 'الإحصاء الوصفي', desc: 'Mean, median, std, variance', hours: 4 },
      { title: 'التوزيعات', desc: 'Normal, binomial, Poisson', hours: 5 },
      { title: 'الاحتمالات', desc: 'Conditional, Bayes theorem', hours: 5 },
      { title: 'اختبار الفرضيات', desc: 't-tests, chi-square, p-values', hours: 6 },
      { title: 'الانحدار', desc: 'Linear and logistic regression', hours: 6 },
    ],
  },
  {
    id: 'pandas-numpy', title: 'Pandas & NumPy', icon: '🔢',
    gradient: ['#130654', '#4A148C'],
    tech: 'Data Manipulation', difficulty: 'intermediate',
    tags: ['Pandas', 'NumPy'],
    units: [
      { title: 'NumPy Arrays', desc: 'ndarrays, broadcasting, vectorization', hours: 4 },
      { title: 'Pandas Series & DataFrames', desc: 'Creation, indexing, selection', hours: 4 },
      { title: 'Data Cleaning', desc: 'Missing values, duplicates, types', hours: 5 },
      { title: 'GroupBy & Aggregation', desc: 'Split-apply-combine', hours: 4 },
      { title: 'Merging & Joining', desc: 'concat, merge, join', hours: 4 },
      { title: 'مشروع تنظيف بيانات', desc: 'Real-world messy dataset', hours: 6 },
    ],
  },
  {
    id: 'data-viz', title: 'تصور البيانات', icon: '📊',
    gradient: ['#FC466B', '#3F5EFB'],
    tech: 'Matplotlib, Seaborn, Plotly', difficulty: 'intermediate',
    tags: ['Matplotlib', 'Seaborn', 'Plotly'],
    units: [
      { title: 'مبادئ التصور', desc: 'Choosing the right chart', hours: 3 },
      { title: 'Matplotlib', desc: 'Basic charts, customization', hours: 4 },
      { title: 'Seaborn', desc: 'Statistical visualizations', hours: 4 },
      { title: 'Interactive Charts', desc: 'Plotly, Bokeh', hours: 4 },
      { title: 'Dashboards', desc: 'Streamlit, Dash basics', hours: 5 },
    ],
  },

  // =========================
  // AI / ML
  // =========================
  {
    id: 'machine-learning', title: 'تعلم الآلة', icon: '🎓',
    gradient: Colors.gradient.all,
    tech: 'Scikit-learn', difficulty: 'intermediate',
    tags: ['ML', 'Scikit-learn'],
    units: [
      { title: 'مقدمة ML', desc: 'Supervised vs unsupervised', hours: 3 },
      { title: 'الانحدار', desc: 'Linear and polynomial regression', hours: 5 },
      { title: 'التصنيف', desc: 'Logistic, SVM, decision trees', hours: 6 },
      { title: 'Clustering', desc: 'K-means, DBSCAN, hierarchical', hours: 5 },
      { title: 'Feature Engineering', desc: 'Scaling, encoding, selection', hours: 4 },
      { title: 'تقييم النموذج', desc: 'Cross-validation, metrics', hours: 4 },
      { title: 'مشروع ML', desc: 'End-to-end ML pipeline', hours: 8 },
    ],
  },
  {
    id: 'deep-learning', title: 'التعلم العميق', icon: '🧠',
    gradient: ['#FF0080', '#7928CA'],
    tech: 'TensorFlow & PyTorch', difficulty: 'advanced',
    tags: ['TensorFlow', 'PyTorch', 'Keras'],
    prerequisite: { requiredTrackId: 'machine-learning', unitsRequired: 3 },
    units: [
      { title: 'Neural Networks', desc: 'Perceptron, backprop basics', hours: 5 },
      { title: 'TensorFlow & Keras', desc: 'Building and training models', hours: 6 },
      { title: 'CNNs', desc: 'Convolutional networks for images', hours: 6 },
      { title: 'RNNs & Transformers', desc: 'Sequence models', hours: 7 },
      { title: 'Transfer Learning', desc: 'Fine-tuning pretrained models', hours: 5 },
    ],
  },
  {
    id: 'nlp', title: 'معالجة اللغة الطبيعية', icon: '💬',
    gradient: ['#06B6D4', '#0E7490'],
    tech: 'Text processing & LLMs', difficulty: 'advanced',
    tags: ['NLP', 'HuggingFace'],
    prerequisite: { requiredTrackId: 'machine-learning', unitsRequired: 3 },
    units: [
      { title: 'Text Preprocessing', desc: 'Tokenization, stemming, lemmatization', hours: 4 },
      { title: 'Word Embeddings', desc: 'Word2Vec, GloVe, contextualized', hours: 5 },
      { title: 'Transformers', desc: 'Attention, BERT, GPT', hours: 6 },
      { title: 'HuggingFace', desc: 'Fine-tuning pretrained models', hours: 5 },
      { title: 'Arabic NLP', desc: 'Challenges of Arabic language', hours: 4 },
    ],
  },
  {
    id: 'computer-vision', title: 'الرؤية الحاسوبية', icon: '👁️',
    gradient: ['#EC4899', '#8B5CF6'],
    tech: 'OpenCV & CNN', difficulty: 'advanced',
    tags: ['OpenCV', 'CNN'],
    prerequisite: { requiredTrackId: 'machine-learning', unitsRequired: 3 },
    units: [
      { title: 'Image Processing', desc: 'OpenCV basics', hours: 4 },
      { title: 'Feature Extraction', desc: 'Edges, corners, SIFT/ORB', hours: 5 },
      { title: 'Object Detection', desc: 'YOLO, R-CNN', hours: 6 },
      { title: 'Image Segmentation', desc: 'U-Net, Mask R-CNN', hours: 5 },
    ],
  },

  // =========================
  // Cybersecurity
  // =========================
  {
    id: 'networking', title: 'أساسيات الشبكات', icon: '🌐',
    gradient: ['#06B6D4', '#0891B2'],
    tech: 'TCP/IP & OSI', difficulty: 'intermediate',
    tags: ['Networking', 'TCP/IP'],
    units: [
      { title: 'OSI Model', desc: 'The 7 layers', hours: 3 },
      { title: 'TCP/IP', desc: 'IP, TCP, UDP, ports', hours: 4 },
      { title: 'DNS & DHCP', desc: 'How name resolution works', hours: 3 },
      { title: 'HTTP/HTTPS', desc: 'Request/response, TLS basics', hours: 4 },
      { title: 'Subnetting', desc: 'CIDR, network design', hours: 4 },
    ],
  },
  {
    id: 'cryptography', title: 'التشفير', icon: '🔐',
    gradient: ['#7C3AED', '#4C1D95'],
    tech: 'Symmetric & Asymmetric', difficulty: 'intermediate',
    tags: ['Crypto', 'Encryption'],
    units: [
      { title: 'التشفير المتماثل', desc: 'AES, DES, block ciphers', hours: 5 },
      { title: 'التشفير غير المتماثل', desc: 'RSA, ECC, key exchange', hours: 5 },
      { title: 'Hashing', desc: 'SHA, MD5, password hashing', hours: 4 },
      { title: 'Digital Signatures', desc: 'PKI, certificates', hours: 4 },
      { title: 'TLS Deep Dive', desc: 'Handshake, cipher suites', hours: 4 },
    ],
  },
  {
    id: 'ethical-hacking', title: 'الاختراق الأخلاقي', icon: '🕵️',
    gradient: ['#DC2626', '#7F1D1D'],
    tech: 'Kali Linux & Pentesting', difficulty: 'advanced',
    tags: ['Pentesting', 'Kali'],
    prerequisite: { requiredTrackId: 'networking', unitsRequired: 3 },
    units: [
      { title: 'Kali Linux Setup', desc: 'Tools and environment', hours: 3 },
      { title: 'Reconnaissance', desc: 'Nmap, enumeration', hours: 5 },
      { title: 'Exploitation', desc: 'Metasploit, buffer overflows', hours: 6 },
      { title: 'Post-Exploitation', desc: 'Privilege escalation, persistence', hours: 5 },
      { title: 'مشروع CTF', desc: 'Capture-the-flag challenge', hours: 8 },
    ],
  },
  {
    id: 'web-security', title: 'أمن تطبيقات الويب', icon: '🛡️',
    gradient: ['#EF4444', '#991B1B'],
    tech: 'OWASP Top 10', difficulty: 'intermediate',
    tags: ['OWASP', 'Web Security'],
    units: [
      { title: 'OWASP Top 10', desc: 'Most critical web vulnerabilities', hours: 4 },
      { title: 'SQL Injection', desc: 'Detection and prevention', hours: 4 },
      { title: 'XSS & CSRF', desc: 'Attacks and mitigations', hours: 4 },
      { title: 'Authentication Flaws', desc: 'Session hijacking, JWT issues', hours: 4 },
      { title: 'Security Headers', desc: 'CSP, HSTS, CORS', hours: 3 },
    ],
  },
  {
    id: 'forensics', title: 'التحقيق الرقمي', icon: '🔍',
    gradient: ['#1E293B', '#334155'],
    tech: 'Digital Forensics', difficulty: 'advanced',
    tags: ['Forensics', 'Incident Response'],
    units: [
      { title: 'مقدمة التحقيق', desc: 'Chain of custody, evidence', hours: 3 },
      { title: 'Disk Analysis', desc: 'File systems, recovery', hours: 5 },
      { title: 'Memory Forensics', desc: 'Volatility, process analysis', hours: 5 },
      { title: 'Network Forensics', desc: 'Wireshark, packet analysis', hours: 5 },
      { title: 'Incident Response', desc: 'IR lifecycle, reporting', hours: 4 },
    ],
  },

  // =========================
  // Cloud
  // =========================
  {
    id: 'aws', title: 'AWS Fundamentals', icon: '☁️',
    gradient: ['#FF9900', '#232F3E'],
    tech: 'AWS core services', difficulty: 'intermediate',
    tags: ['AWS', 'Cloud'],
    units: [
      { title: 'AWS Overview', desc: 'Regions, AZs, IAM', hours: 4 },
      { title: 'EC2', desc: 'Virtual machines, AMIs, scaling', hours: 5 },
      { title: 'S3', desc: 'Object storage, versioning, lifecycle', hours: 4 },
      { title: 'VPC', desc: 'Networking, subnets, security groups', hours: 5 },
      { title: 'RDS', desc: 'Managed databases', hours: 4 },
      { title: 'Lambda & API Gateway', desc: 'Serverless basics', hours: 5 },
    ],
  },
  {
    id: 'docker', title: 'Docker', icon: '🐳',
    gradient: ['#2496ED', '#0DB7ED'],
    tech: 'Containers', difficulty: 'intermediate',
    tags: ['Docker', 'Containers'],
    units: [
      { title: 'مقدمة Docker', desc: 'Containers vs VMs', hours: 3 },
      { title: 'Dockerfile', desc: 'Building images', hours: 4 },
      { title: 'Docker Compose', desc: 'Multi-container apps', hours: 4 },
      { title: 'Networking & Volumes', desc: 'Container networking, persistence', hours: 4 },
      { title: 'Image Registries', desc: 'Docker Hub, ECR', hours: 3 },
    ],
  },
  {
    id: 'kubernetes', title: 'Kubernetes', icon: '⎈',
    gradient: ['#326CE5', '#1A3A8C'],
    tech: 'Container Orchestration', difficulty: 'advanced',
    tags: ['K8s', 'Orchestration'],
    prerequisite: { requiredTrackId: 'docker', unitsRequired: 3 },
    units: [
      { title: 'K8s Architecture', desc: 'Master, nodes, pods', hours: 4 },
      { title: 'Deployments', desc: 'Rolling updates, replicas', hours: 5 },
      { title: 'Services & Ingress', desc: 'Networking in K8s', hours: 5 },
      { title: 'ConfigMaps & Secrets', desc: 'Configuration management', hours: 4 },
      { title: 'Helm', desc: 'Package manager for K8s', hours: 4 },
    ],
  },
  {
    id: 'cicd', title: 'CI/CD', icon: '🔄',
    gradient: ['#22C55E', '#15803D'],
    tech: 'GitHub Actions, Jenkins', difficulty: 'intermediate',
    tags: ['CI/CD', 'GitHub Actions'],
    units: [
      { title: 'مبادئ CI/CD', desc: 'Continuous integration vs delivery', hours: 3 },
      { title: 'GitHub Actions', desc: 'Workflows, jobs, steps', hours: 4 },
      { title: 'Automated Testing', desc: 'Running tests on every push', hours: 4 },
      { title: 'Automated Deployment', desc: 'Deploy on merge to main', hours: 5 },
      { title: 'Environments & Approvals', desc: 'Prod/staging gates', hours: 4 },
    ],
  },
  {
    id: 'serverless', title: 'Serverless', icon: '⚡',
    gradient: ['#FB923C', '#C2410C'],
    tech: 'Lambda & Functions', difficulty: 'intermediate',
    tags: ['Lambda', 'Serverless'],
    units: [
      { title: 'مقدمة Serverless', desc: 'FaaS vs containers', hours: 3 },
      { title: 'AWS Lambda', desc: 'Functions, triggers, layers', hours: 5 },
      { title: 'API Gateway', desc: 'HTTP APIs on top of Lambda', hours: 4 },
      { title: 'DynamoDB', desc: 'NoSQL for serverless', hours: 4 },
      { title: 'Serverless Framework', desc: 'IaC for serverless apps', hours: 4 },
    ],
  },

  // =========================
  // DevOps
  // =========================
  {
    id: 'linux', title: 'Linux', icon: '🐧',
    gradient: ['#FCC624', '#000000'],
    tech: 'Linux for developers', difficulty: 'beginner',
    tags: ['Linux', 'Shell'],
    units: [
      { title: 'Terminal Basics', desc: 'Navigation, files, permissions', hours: 3 },
      { title: 'Shell Scripting', desc: 'bash, variables, loops', hours: 5 },
      { title: 'Process Management', desc: 'ps, top, kill, systemd', hours: 4 },
      { title: 'Networking Tools', desc: 'curl, netstat, ss, iptables', hours: 4 },
      { title: 'Package Management', desc: 'apt, yum, pacman', hours: 3 },
    ],
  },
  {
    id: 'monitoring', title: 'المراقبة والتنبيه', icon: '📡',
    gradient: ['#10B981', '#065F46'],
    tech: 'Prometheus & Grafana', difficulty: 'intermediate',
    tags: ['Monitoring', 'Prometheus'],
    units: [
      { title: 'الملاحظة', desc: 'Logs, metrics, traces', hours: 4 },
      { title: 'Prometheus', desc: 'Metrics collection', hours: 5 },
      { title: 'Grafana', desc: 'Dashboards and alerts', hours: 4 },
      { title: 'Log Aggregation', desc: 'ELK stack, Loki', hours: 5 },
    ],
  },

  // =========================
  // UI/UX
  // =========================
  {
    id: 'design-principles', title: 'مبادئ التصميم', icon: '🎨',
    gradient: ['#F472B6', '#DB2777'],
    tech: 'Gestalt, hierarchy, balance', difficulty: 'beginner',
    tags: ['Design', 'Theory'],
    units: [
      { title: 'مبادئ Gestalt', desc: 'Proximity, similarity, closure', hours: 3 },
      { title: 'التسلسل البصري', desc: 'Visual hierarchy and flow', hours: 4 },
      { title: 'التباين والتوازن', desc: 'Contrast, symmetry, weight', hours: 3 },
      { title: 'نظرية الألوان', desc: 'Palettes, harmony, mood', hours: 4 },
      { title: 'Typography', desc: 'Type scales, pairing, RTL', hours: 4 },
    ],
  },
  {
    id: 'figma', title: 'Figma', icon: '🎭',
    gradient: ['#F24E1E', '#A259FF'],
    tech: 'UI design & collaboration', difficulty: 'beginner',
    tags: ['Figma', 'Tools'],
    units: [
      { title: 'Figma Basics', desc: 'Interface, frames, tools', hours: 3 },
      { title: 'Components', desc: 'Reusable components and variants', hours: 4 },
      { title: 'Auto Layout', desc: 'Responsive UI design', hours: 4 },
      { title: 'Design Systems', desc: 'Tokens, libraries, documentation', hours: 5 },
      { title: 'Plugins & Handoff', desc: 'Dev handoff, plugins', hours: 3 },
    ],
  },
  {
    id: 'prototyping', title: 'Prototyping', icon: '🧩',
    gradient: ['#A78BFA', '#6366F1'],
    tech: 'Interactive prototypes', difficulty: 'intermediate',
    tags: ['Prototype', 'Interaction'],
    units: [
      { title: 'Interactive Prototypes', desc: 'Flows, triggers, animations', hours: 4 },
      { title: 'Microinteractions', desc: 'Button states, feedback', hours: 3 },
      { title: 'User Flows', desc: 'Mapping journeys', hours: 4 },
      { title: 'Usability Testing', desc: 'Testing your prototypes', hours: 4 },
    ],
  },
  {
    id: 'user-research', title: 'أبحاث المستخدم', icon: '🔬',
    gradient: ['#14B8A6', '#0F766E'],
    tech: 'User interviews & testing', difficulty: 'intermediate',
    tags: ['Research', 'UX'],
    units: [
      { title: 'Research Methods', desc: 'Qualitative vs quantitative', hours: 3 },
      { title: 'User Interviews', desc: 'Planning, conducting, analysis', hours: 4 },
      { title: 'Personas & Journey Maps', desc: 'Representing users', hours: 4 },
      { title: 'Usability Testing', desc: 'Running tests, interpreting results', hours: 5 },
    ],
  },
  {
    id: 'accessibility', title: 'إمكانية الوصول', icon: '♿',
    gradient: ['#0EA5E9', '#0369A1'],
    tech: 'WCAG & inclusive design', difficulty: 'intermediate',
    tags: ['A11y', 'WCAG'],
    units: [
      { title: 'WCAG Principles', desc: 'POUR, conformance levels', hours: 3 },
      { title: 'ARIA', desc: 'Screen reader semantics', hours: 4 },
      { title: 'Keyboard Navigation', desc: 'Focus management, tabindex', hours: 3 },
      { title: 'Color & Contrast', desc: 'Accessible color palettes', hours: 3 },
      { title: 'Testing Accessibility', desc: 'Tools and audits', hours: 3 },
    ],
  },
];

/**
 * Career → skill track IDs.
 * Each user sees ~5 tracks relevant to their chosen career on their profile.
 * They can still access the full catalog via the "استكشاف" link.
 */
export const CAREER_TRACK_MAP: Record<CareerId, string[]> = {
  frontend:      ['html-css', 'javascript', 'react', 'typescript', 'uiux-basics'],
  backend:       ['nodejs', 'sql', 'rest-apis', 'auth', 'testing'],
  mobile:        ['react-native', 'native-apis', 'state-management', 'mobile-ui', 'app-publishing'],
  'data-science':['python', 'sql', 'statistics', 'data-viz', 'pandas-numpy'],
  ai:            ['python', 'machine-learning', 'deep-learning', 'nlp', 'computer-vision'],
  cybersecurity: ['networking', 'cryptography', 'ethical-hacking', 'web-security', 'forensics'],
  cloud:         ['aws', 'docker', 'kubernetes', 'cicd', 'serverless'],
  devops:        ['linux', 'docker', 'cicd', 'kubernetes', 'monitoring'],
  uiux:          ['design-principles', 'figma', 'prototyping', 'user-research', 'accessibility'],
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: Colors.status.success,
  intermediate: Colors.status.warning,
  advanced: Colors.status.error,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

export const XP_PER_UNIT = XP_VALUES.SKILL_MODULE_COMPLETE;

export function getTrackById(trackId: string): SkillTrack | undefined {
  return SKILL_TRACKS.find(t => t.id === trackId);
}

export function getCareerById(careerId: string | null | undefined): (typeof CAREERS)[0] | undefined {
  if (!careerId) return undefined;
  return CAREERS.find(c => c.id === careerId);
}

/** Returns the ordered list of skill tracks for a given career.
 *  Returns empty array if the career is unknown (caller decides fallback behavior). */
export function getTracksForCareer(careerId: CareerId | null | undefined): SkillTrack[] {
  if (!careerId) return [];
  const ids = CAREER_TRACK_MAP[careerId];
  if (!ids) return [];
  return ids
    .map(id => SKILL_TRACKS.find(t => t.id === id))
    .filter((t): t is SkillTrack => t !== undefined);
}
