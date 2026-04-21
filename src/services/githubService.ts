import { Opportunity } from '../types';

const GITHUB_API = 'https://api.github.com';

export async function fetchOpenSourceRepos(language = 'javascript'): Promise<Opportunity[]> {
  const query = `good-first-issues:>0 language:${language} stars:>50`;
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=20`;
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error('GitHub API failed');
  const data = await res.json();
  return data.items.map((repo: any): Opportunity => ({
    id: repo.id,
    title: repo.name,
    type: 'opensource',
    organization: repo.owner.login,
    description: repo.description || 'No description provided.',
    deadline: null,
    location: 'Remote',
    latitude: null,
    longitude: null,
    xpReward: 30,
    registrationLink: repo.html_url,
    imageUrl: repo.owner.avatar_url,
    isActive: 1,
    createdAt: repo.created_at,
    status: 'open',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    isBeginnerFriendly: true,
    githubUrl: repo.html_url,
  }));
}
