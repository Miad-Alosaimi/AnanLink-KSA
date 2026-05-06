import { useState, useEffect, useCallback, useMemo } from 'react';
import { Opportunity, OpportunityType } from '../types';
import {
  getOpportunities,
  getRecentOpportunities,
  getOpportunityById,
} from '../database/queries';
import {
  getRecommendedRepos,
  OpenSourceRepo,
} from '../services/githubService';
import { useUser } from '../context';
import { CareerId } from '../constants/skillTracks';

export const useOpportunities = (type?: OpportunityType) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getOpportunities(type, 500);
      setOpportunities(data);
    } catch {
      setError('فشل تحميل الفرص. حاول مجدداً.');
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);
  return { opportunities, isLoading, error, refetch: fetchOpportunities };
};

export const useRecentOpportunities = (limit = 6) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRecentOpportunities(limit)
      .then(setOpportunities)
      .catch(() => setOpportunities([]))
      .finally(() => setIsLoading(false));
  }, [limit]);

  return { opportunities, isLoading };
};

export const useOpportunityDetail = (id: number) => {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getOpportunityById(id)
      .then(setOpportunity)
      .catch(() => setError('فشل تحميل التفاصيل'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { opportunity, isLoading, error };
};

export type OpportunityFilter =
  | 'all'
  | 'opensource'
  | 'bootcamp'
  | 'internship'
  | 'volunteer';

/**
 * Synthesize a fake "Opportunity" record from a curated GitHub repo.
 * IDs are negative to avoid colliding with real DB rows.
 */
function repoToOpportunity(repo: OpenSourceRepo, idx: number): Opportunity {
  return {
    id: -(idx + 1),
    extId: repo.id,
    type: 'opensource',
    title: repo.displayName,
    subtitle: repo.fullName,
    organization: repo.fullName.split('/')[0],
    description: repo.whyArabic,
    deadline: null,
    startDate: null,
    endDate: null,
    seats: null,
    location: 'GitHub',
    city: null,
    region: null,
    category: repo.language,
    jobType: null,
    level: repo.isBeginnerFriendly ? 'مناسب للمبتدئين' : 'متقدم',
    durationWeeks: null,
    latitude: null,
    longitude: null,
    xpReward: 50,
    registrationLink: `https://github.com/${repo.fullName}`,
    imageUrl: null,
    isActive: 1,
    createdAt: new Date().toISOString(),
    githubUrl: `https://github.com/${repo.fullName}`,
    stars: repo.starsBaseline,
    forks: repo.forksBaseline,
    language: repo.language,
    isBeginnerFriendly: repo.isBeginnerFriendly,
  };
}

/**
 * Combined opportunities: SQLite for bootcamp/internship/volunteer + curated
 * GitHub recommendations (synthesized as Opportunity records) for opensource.
 */
export const useAllOpportunities = (filter: OpportunityFilter = 'all') => {
  const { user } = useUser();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const careerId = (user?.specialty as CareerId | undefined) || undefined;

  // Memoized curated repos — these only change if user changes career
  const opensourceList = useMemo<Opportunity[]>(
    () => getRecommendedRepos(careerId).map(repoToOpportunity),
    [careerId]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all opportunities from DB — bump limit to cover the full catalog
      // (36 bootcamps + 60 volunteer + 31 internships = 127 real items).
      // The old default limit of 50 caused internships/volunteers to be truncated,
      // which made the تدريب tab appear empty.
      const fromDb = await getOpportunities(undefined, 500);
      const all = [...fromDb, ...opensourceList];
      const filtered = filter === 'all' ? all : all.filter(o => o.type === filter);
      setOpportunities(filtered);
    } catch {
      setError('فشل تحميل الفرص');
    } finally {
      setIsLoading(false);
    }
  }, [filter, opensourceList]);

  useEffect(() => { load(); }, [load]);

  return { opportunities, isLoading, error, refetch: load };
};
