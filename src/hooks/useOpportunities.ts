import { useState, useEffect, useCallback } from 'react';
import { Opportunity, OpportunityType } from '../types';
import {
  getOpportunities,
  getRecentOpportunities,
  getOpportunityById,
} from '../database/queries';
import { getCachedEvents, saveCachedEvents } from '../database/queries/cacheQueries';
import {
  fetchOpenSourceRepos,
  fetchDevpostHackathons,
  fetchRemotiveJobs,
  fetchJadaratOpportunities,
} from '../services';

export const useOpportunities = (type?: OpportunityType) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getOpportunities(type);
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
  | 'hackathon'
  | 'internship'
  | 'volunteer';

const CACHE_SOURCE = 'all_opportunities';

export const useAllOpportunities = (filter: OpportunityFilter = 'all') => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyFilter = (all: Opportunity[]) =>
    filter === 'all' ? all : all.filter(o => o.type === filter);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // 1. Try the local cache first — serve immediately if fresh
    try {
      const cached = await getCachedEvents(CACHE_SOURCE);
      if (cached?.isFresh) {
        setOpportunities(applyFilter(cached.data));
        setIsLoading(false);
        return;
      }
    } catch { /* cache read failure is non-fatal */ }

    // 2. Fetch from all API sources in parallel
    try {
      const [github, devpost, remotive, jadarat, volunteers] = await Promise.all([
        fetchOpenSourceRepos().catch(() => [] as Opportunity[]),
        fetchDevpostHackathons().catch(() => [] as Opportunity[]),
        fetchRemotiveJobs().catch(() => [] as Opportunity[]),
        fetchJadaratOpportunities().catch(() => [] as Opportunity[]),
        getOpportunities('volunteer').catch(() => [] as Opportunity[]),
      ]);

      const all: Opportunity[] = [...github, ...devpost, ...remotive, ...jadarat, ...volunteers];

      // 3. Persist to cache for offline use
      try {
        await saveCachedEvents(CACHE_SOURCE, all);
      } catch { /* cache write failure is non-fatal */ }

      setOpportunities(applyFilter(all));
    } catch {
      setError('فشل تحميل الفرص');

      // 4. Network failure — serve stale cache if available
      try {
        const stale = await getCachedEvents(CACHE_SOURCE);
        if (stale) {
          setOpportunities(applyFilter(stale.data));
        }
      } catch { /* nothing to serve */ }
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return { opportunities, isLoading, error, refetch: load };
};
