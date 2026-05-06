export type OpportunityType = 'bootcamp' | 'internship' | 'opensource' | 'volunteer';
export type OpportunityStatus = 'open' | 'upcoming' | 'closed';
export type FilterStatus = 'all' | 'open' | 'upcoming' | 'closed';

export interface Opportunity {
  id: number;
  extId: string | null;
  title: string;
  subtitle: string | null;
  type: OpportunityType;
  organization: string;
  description: string;
  deadline: string | null;
  startDate: string | null;
  endDate: string | null;
  seats: number | null;
  location: string;
  city: string | null;
  region: string | null;
  category: string | null;
  jobType: string | null;
  level: string | null;
  durationWeeks: number | null;
  latitude: number | null;
  longitude: number | null;
  xpReward: number;
  registrationLink: string;
  imageUrl: string | null;
  isActive: number;
  createdAt: string;
  // Computed
  status?: OpportunityStatus;
  isBookmarked?: boolean;
  // Open-source-specific (live from GitHub API)
  githubUrl?: string;
  stars?: number;
  forks?: number;
  language?: string;
  isBeginnerFriendly?: boolean;
  // Legacy / hackathon-style (kept optional for compatibility)
  participants?: number;
  teams?: number;
  prize?: string;
  salary?: string;
  duration?: string;
  volunteerSpots?: number;
  volunteerFilled?: number;
}

export interface Bookmark {
  id: number;
  userId: number;
  opportunityId: number;
  createdAt: string;
  opportunity?: Opportunity;
}

export interface QRCheckIn {
  id: number;
  userId: number;
  opportunityId: number | null;
  eventName: string;
  scannedAt: string;
  xpEarned?: number;
}

export interface QRPayload {
  eventId: string;
  eventName: string;
  opportunityId?: number;
  xpReward: number;
}
