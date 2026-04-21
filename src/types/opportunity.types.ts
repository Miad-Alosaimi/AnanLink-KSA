export type OpportunityType = 'hackathon' | 'internship' | 'opensource' | 'volunteer';
export type OpportunityStatus = 'open' | 'upcoming' | 'closed';
export type FilterStatus = 'all' | 'open' | 'upcoming' | 'closed';

export interface Opportunity {
  id: number;
  title: string;
  type: OpportunityType;
  organization: string;
  description: string;
  deadline: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  xpReward: number;
  registrationLink: string;
  imageUrl: string | null;
  isActive: number;
  createdAt: string;
  // Computed fields
  status?: OpportunityStatus;
  // Extended fields (joined from other tables)
  isBookmarked?: boolean;
  // Type-specific fields (can be added as needed)
  participants?: number;
  teams?: number;
  prize?: string;
  salary?: string;
  duration?: string;
  volunteerSpots?: number;
  volunteerFilled?: number;
  githubUrl?: string;
  stars?: number;
  forks?: number;
  language?: string;
  isBeginnerFriendly?: boolean;
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
  /** Optional: opportunity type used as event_type in scan_logs */
  eventType?: string;
}
