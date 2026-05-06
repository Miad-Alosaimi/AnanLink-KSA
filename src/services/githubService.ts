/**
 * GitHub integration for مصادر مفتوحة (open-source) opportunities.
 *
 * Strategy: hybrid (curated + live).
 *  - We maintain a curated list of beginner-friendly, well-maintained repos
 *    per career path (so the user always sees relevant, vetted recommendations).
 *  - On opening a repo's detail screen, we fetch live stats (stars, forks,
 *    open issues, primary language, license) from GitHub's public REST API.
 *  - Results are cached in memory for 1 hour to avoid hammering the API.
 *  - If the network is down, we fall back to the static metadata baked in here.
 *
 * GitHub public API limits:
 *  - 60 requests/hour per IP (no auth)
 *  - That's enough for our use: a user opens maybe 5-10 repos per session.
 */

import { CareerId } from '../constants/skillTracks';

export interface OpenSourceRepo {
  id: string;
  fullName: string;
  displayName: string;
  whyArabic: string;
  language: string;
  starsBaseline: number;
  forksBaseline: number;
  isBeginnerFriendly: boolean;
  license?: string;
}

export interface RepoLiveStats {
  stars: number;
  forks: number;
  openIssues: number;
  language: string;
  license: string | null;
  description: string;
  pushedAt: string;
  topics: string[];
}

export const RECOMMENDED_REPOS_BY_CAREER: Record<CareerId, OpenSourceRepo[]> = {
  frontend: [
    { id: 'vercel-next.js', fullName: 'vercel/next.js', displayName: 'Next.js', whyArabic: 'إطار React الأكثر استخداماً للإنتاج. مجتمع نشط وكثير من good-first-issues.', language: 'TypeScript', starsBaseline: 124000, forksBaseline: 26500, isBeginnerFriendly: true, license: 'MIT' },
    { id: 'facebook-react', fullName: 'facebook/react', displayName: 'React', whyArabic: 'مكتبة الواجهات الأكثر شعبية. فرص للمساهمة في الوثائق والاختبارات.', language: 'JavaScript', starsBaseline: 228000, forksBaseline: 46500, isBeginnerFriendly: false, license: 'MIT' },
    { id: 'tailwindlabs-tailwindcss', fullName: 'tailwindlabs/tailwindcss', displayName: 'Tailwind CSS', whyArabic: 'إطار CSS الأكثر استخداماً. فرص جيدة للمبتدئين في الأمثلة.', language: 'JavaScript', starsBaseline: 82000, forksBaseline: 4200, isBeginnerFriendly: true, license: 'MIT' },
    { id: 'shadcn-ui-ui', fullName: 'shadcn-ui/ui', displayName: 'shadcn/ui', whyArabic: 'مكتبة مكونات واجهات حديثة.', language: 'TypeScript', starsBaseline: 75000, forksBaseline: 4800, isBeginnerFriendly: true, license: 'MIT' },
    { id: 'sveltejs-svelte', fullName: 'sveltejs/svelte', displayName: 'Svelte', whyArabic: 'إطار صاعد بسرعة. مجتمع ودود.', language: 'TypeScript', starsBaseline: 79000, forksBaseline: 4200, isBeginnerFriendly: true, license: 'MIT' },
  ],
  backend: [
    { id: 'expressjs-express', fullName: 'expressjs/express', displayName: 'Express', whyArabic: 'إطار Node.js الأكثر شعبية. وثائق ممتازة للمبتدئين.', language: 'JavaScript', starsBaseline: 64500, forksBaseline: 15200, isBeginnerFriendly: true, license: 'MIT' },
    { id: 'nestjs-nest', fullName: 'nestjs/nest', displayName: 'NestJS', whyArabic: 'إطار Node.js للأنظمة المؤسسية.', language: 'TypeScript', starsBaseline: 65000, forksBaseline: 7700, isBeginnerFriendly: true, license: 'MIT' },
    { id: 'prisma-prisma', fullName: 'prisma/prisma', displayName: 'Prisma', whyArabic: 'أداة ORM حديثة.', language: 'TypeScript', starsBaseline: 38000, forksBaseline: 1500, isBeginnerFriendly: true, license: 'Apache-2.0' },
    { id: 'fastify-fastify', fullName: 'fastify/fastify', displayName: 'Fastify', whyArabic: 'إطار Node.js سريع.', language: 'JavaScript', starsBaseline: 32000, forksBaseline: 2300, isBeginnerFriendly: true, license: 'MIT' },
    { id: 'strapi-strapi', fullName: 'strapi/strapi', displayName: 'Strapi', whyArabic: 'CMS مفتوح المصدر متكامل.', language: 'JavaScript', starsBaseline: 64000, forksBaseline: 8000, isBeginnerFriendly: true, license: 'MIT' },
  ],
  mobile: [
    { id: 'expo-expo', fullName: 'expo/expo', displayName: 'Expo', whyArabic: 'منصة تطوير React Native الأشهر.', language: 'TypeScript', starsBaseline: 33000, forksBaseline: 5600, isBeginnerFriendly: true, license: 'MIT' },
    { id: 'facebook-react-native', fullName: 'facebook/react-native', displayName: 'React Native', whyArabic: 'إطار بناء تطبيقات الجوال الأصيلة باستخدام React.', language: 'C++', starsBaseline: 118000, forksBaseline: 24300, isBeginnerFriendly: false, license: 'MIT' },
    { id: 'flutter-flutter', fullName: 'flutter/flutter', displayName: 'Flutter', whyArabic: 'إطار Google لتطوير التطبيقات.', language: 'Dart', starsBaseline: 165000, forksBaseline: 27500, isBeginnerFriendly: false, license: 'BSD-3-Clause' },
    { id: 'react-navigation', fullName: 'react-navigation/react-navigation', displayName: 'React Navigation', whyArabic: 'مكتبة التنقل القياسية لـ React Native.', language: 'TypeScript', starsBaseline: 23000, forksBaseline: 5000, isBeginnerFriendly: true, license: 'MIT' },
    { id: 'reanimated', fullName: 'software-mansion/react-native-reanimated', displayName: 'Reanimated', whyArabic: 'مكتبة الحركات الأكثر استخداماً في RN.', language: 'C++', starsBaseline: 9000, forksBaseline: 1300, isBeginnerFriendly: true, license: 'MIT' },
  ],
  'data-science': [
    { id: 'pandas-pandas', fullName: 'pandas-dev/pandas', displayName: 'Pandas', whyArabic: 'مكتبة معالجة البيانات الأكثر شعبية في Python.', language: 'Python', starsBaseline: 43000, forksBaseline: 17500, isBeginnerFriendly: true, license: 'BSD-3-Clause' },
    { id: 'numpy-numpy', fullName: 'numpy/numpy', displayName: 'NumPy', whyArabic: 'أساس الحوسبة العلمية في Python.', language: 'Python', starsBaseline: 27000, forksBaseline: 9700, isBeginnerFriendly: true, license: 'BSD-3-Clause' },
    { id: 'matplotlib-matplotlib', fullName: 'matplotlib/matplotlib', displayName: 'Matplotlib', whyArabic: 'أداة الرسم البياني الكلاسيكية.', language: 'Python', starsBaseline: 19500, forksBaseline: 7600, isBeginnerFriendly: true, license: 'PSF-2.0' },
    { id: 'streamlit-streamlit', fullName: 'streamlit/streamlit', displayName: 'Streamlit', whyArabic: 'أسرع طريقة لبناء واجهات تطبيقات البيانات.', language: 'Python', starsBaseline: 33000, forksBaseline: 2900, isBeginnerFriendly: true, license: 'Apache-2.0' },
    { id: 'plotly-py', fullName: 'plotly/plotly.py', displayName: 'Plotly Python', whyArabic: 'مكتبة الرسم البياني التفاعلي.', language: 'Python', starsBaseline: 16000, forksBaseline: 2500, isBeginnerFriendly: true, license: 'MIT' },
  ],
  ai: [
    { id: 'huggingface-transformers', fullName: 'huggingface/transformers', displayName: 'Transformers', whyArabic: 'مكتبة نماذج اللغة الأكثر استخداماً في العالم.', language: 'Python', starsBaseline: 132000, forksBaseline: 26300, isBeginnerFriendly: true, license: 'Apache-2.0' },
    { id: 'tensorflow-tensorflow', fullName: 'tensorflow/tensorflow', displayName: 'TensorFlow', whyArabic: 'إطار Google للتعلم الآلي والشبكات العصبية.', language: 'C++', starsBaseline: 184000, forksBaseline: 74000, isBeginnerFriendly: false, license: 'Apache-2.0' },
    { id: 'pytorch-pytorch', fullName: 'pytorch/pytorch', displayName: 'PyTorch', whyArabic: 'إطار Meta للتعلم العميق.', language: 'Python', starsBaseline: 81000, forksBaseline: 21900, isBeginnerFriendly: false, license: 'BSD-3-Clause' },
    { id: 'scikit-learn-scikit-learn', fullName: 'scikit-learn/scikit-learn', displayName: 'scikit-learn', whyArabic: 'مكتبة تعلم الآلة الكلاسيكية في Python.', language: 'Python', starsBaseline: 59000, forksBaseline: 25200, isBeginnerFriendly: true, license: 'BSD-3-Clause' },
    { id: 'langchain-langchain', fullName: 'langchain-ai/langchain', displayName: 'LangChain', whyArabic: 'إطار بناء تطبيقات LLM.', language: 'Python', starsBaseline: 92000, forksBaseline: 14800, isBeginnerFriendly: true, license: 'MIT' },
  ],
  cybersecurity: [
    { id: 'OWASP-CheatSheetSeries', fullName: 'OWASP/CheatSheetSeries', displayName: 'OWASP Cheat Sheets', whyArabic: 'مرجع OWASP لأمن التطبيقات.', language: 'Markdown', starsBaseline: 28500, forksBaseline: 3700, isBeginnerFriendly: true, license: 'CC-BY-SA-4.0' },
    { id: 'metasploit-framework', fullName: 'rapid7/metasploit-framework', displayName: 'Metasploit Framework', whyArabic: 'إطار اختبار الاختراق الأشهر.', language: 'Ruby', starsBaseline: 33000, forksBaseline: 13900, isBeginnerFriendly: false, license: 'BSD-3-Clause' },
    { id: 'sqlmap', fullName: 'sqlmapproject/sqlmap', displayName: 'sqlmap', whyArabic: 'أداة كشف ثغرات SQL Injection.', language: 'Python', starsBaseline: 32000, forksBaseline: 5700, isBeginnerFriendly: false, license: 'GPL-2.0' },
    { id: 'wireshark-wireshark', fullName: 'wireshark/wireshark', displayName: 'Wireshark', whyArabic: 'أداة تحليل حزم الشبكة الأشهر.', language: 'C', starsBaseline: 7300, forksBaseline: 1900, isBeginnerFriendly: false, license: 'GPL-2.0' },
    { id: 'mitre-attack-website', fullName: 'mitre-attack/attack-website', displayName: 'MITRE ATT&CK', whyArabic: 'قاعدة بيانات تكتيكات وتقنيات الهجوم.', language: 'HTML', starsBaseline: 1900, forksBaseline: 380, isBeginnerFriendly: true, license: 'Apache-2.0' },
  ],
  cloud: [
    { id: 'kubernetes-kubernetes', fullName: 'kubernetes/kubernetes', displayName: 'Kubernetes', whyArabic: 'منصة تنسيق الحاويات. مجتمع ضخم.', language: 'Go', starsBaseline: 110000, forksBaseline: 39600, isBeginnerFriendly: true, license: 'Apache-2.0' },
    { id: 'docker-compose', fullName: 'docker/compose', displayName: 'Docker Compose', whyArabic: 'أداة تشغيل تطبيقات Docker متعددة الحاويات.', language: 'Go', starsBaseline: 33500, forksBaseline: 5300, isBeginnerFriendly: true, license: 'Apache-2.0' },
    { id: 'aws-amplify-js', fullName: 'aws-amplify/amplify-js', displayName: 'AWS Amplify JS', whyArabic: 'مكتبة AWS الرسمية لبناء تطبيقات سحابية.', language: 'TypeScript', starsBaseline: 9500, forksBaseline: 2200, isBeginnerFriendly: true, license: 'Apache-2.0' },
    { id: 'hashicorp-terraform', fullName: 'hashicorp/terraform', displayName: 'Terraform', whyArabic: 'أداة Infrastructure as Code الأكثر استخداماً.', language: 'Go', starsBaseline: 42000, forksBaseline: 9700, isBeginnerFriendly: false, license: 'BUSL-1.1' },
    { id: 'serverless', fullName: 'serverless/serverless', displayName: 'Serverless Framework', whyArabic: 'إطار بناء تطبيقات Serverless.', language: 'JavaScript', starsBaseline: 46000, forksBaseline: 5700, isBeginnerFriendly: true, license: 'MIT' },
  ],
  devops: [
    { id: 'ansible-ansible', fullName: 'ansible/ansible', displayName: 'Ansible', whyArabic: 'أداة أتمتة البنية التحتية.', language: 'Python', starsBaseline: 62000, forksBaseline: 23800, isBeginnerFriendly: true, license: 'GPL-3.0' },
    { id: 'prometheus-prometheus', fullName: 'prometheus/prometheus', displayName: 'Prometheus', whyArabic: 'نظام مراقبة وتنبيه.', language: 'Go', starsBaseline: 54000, forksBaseline: 9000, isBeginnerFriendly: false, license: 'Apache-2.0' },
    { id: 'grafana-grafana', fullName: 'grafana/grafana', displayName: 'Grafana', whyArabic: 'أداة تصور بيانات المراقبة.', language: 'TypeScript', starsBaseline: 63000, forksBaseline: 11700, isBeginnerFriendly: true, license: 'AGPL-3.0' },
    { id: 'jenkinsci-jenkins', fullName: 'jenkinsci/jenkins', displayName: 'Jenkins', whyArabic: 'منصة CI/CD مفتوحة المصدر.', language: 'Java', starsBaseline: 23000, forksBaseline: 8800, isBeginnerFriendly: true, license: 'MIT' },
    { id: 'argo-cd', fullName: 'argoproj/argo-cd', displayName: 'Argo CD', whyArabic: 'GitOps لـ Kubernetes.', language: 'Go', starsBaseline: 17500, forksBaseline: 5300, isBeginnerFriendly: true, license: 'Apache-2.0' },
  ],
  uiux: [
    { id: 'penpot-penpot', fullName: 'penpot/penpot', displayName: 'Penpot', whyArabic: 'بديل Figma مفتوح المصدر.', language: 'Clojure', starsBaseline: 33000, forksBaseline: 1700, isBeginnerFriendly: true, license: 'MPL-2.0' },
    { id: 'storybook', fullName: 'storybookjs/storybook', displayName: 'Storybook', whyArabic: 'أداة بناء وتوثيق المكونات.', language: 'TypeScript', starsBaseline: 84000, forksBaseline: 9300, isBeginnerFriendly: true, license: 'MIT' },
    { id: 'animate-css', fullName: 'animate-css/animate.css', displayName: 'Animate.css', whyArabic: 'مكتبة الحركات CSS الأشهر.', language: 'CSS', starsBaseline: 80000, forksBaseline: 16500, isBeginnerFriendly: true, license: 'MIT' },
    { id: 'lucide', fullName: 'lucide-icons/lucide', displayName: 'Lucide Icons', whyArabic: 'مكتبة أيقونات حديثة وجميلة.', language: 'TypeScript', starsBaseline: 11000, forksBaseline: 770, isBeginnerFriendly: true, license: 'ISC' },
    { id: 'tabler', fullName: 'tabler/tabler', displayName: 'Tabler', whyArabic: 'مكتبة قوالب لوحات التحكم.', language: 'JavaScript', starsBaseline: 38000, forksBaseline: 4000, isBeginnerFriendly: true, license: 'MIT' },
  ],
};

export function getDefaultRecommendations(): OpenSourceRepo[] {
  return Object.values(RECOMMENDED_REPOS_BY_CAREER).map(repos => repos[0]);
}

export function getRecommendedRepos(careerId: CareerId | undefined | null): OpenSourceRepo[] {
  if (!careerId) return getDefaultRecommendations();
  return RECOMMENDED_REPOS_BY_CAREER[careerId] ?? getDefaultRecommendations();
}

interface CacheEntry { fetchedAt: number; data: RepoLiveStats }
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, CacheEntry>();

export async function fetchRepoStats(fullName: string): Promise<RepoLiveStats | null> {
  const cached = cache.get(fullName);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.data;

  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) {
      console.warn(`[GitHub] ${fullName} returned ${res.status}`);
      return null;
    }
    const json: any = await res.json();
    const stats: RepoLiveStats = {
      stars: json.stargazers_count ?? 0,
      forks: json.forks_count ?? 0,
      openIssues: json.open_issues_count ?? 0,
      language: json.language ?? '',
      license: json.license?.spdx_id ?? null,
      description: json.description ?? '',
      pushedAt: json.pushed_at ?? '',
      topics: json.topics ?? [],
    };
    cache.set(fullName, { fetchedAt: Date.now(), data: stats });
    return stats;
  } catch (err) {
    console.warn(`[GitHub] fetch failed for ${fullName}`, err);
    return null;
  }
}

export function clearGithubCache(): void { cache.clear(); }
