export type OpportunityType = 'hackathon' | 'internship' | 'opensource' | 'volunteer';

export interface Opportunity {
  id: number;
  title: string;
  type: OpportunityType;
  organization: string;
  description: string;
  deadline: string | null;
  location: string;
  registrationLink: string;
  isActive: number;
  createdAt: string;
}

export interface User {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  major: string;
  academicYear: number;
  createdAt: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  major: string;
  academicYear: number;
  password: string;
}

// Navigation types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type OpportunitiesStackParamList = {
  OpportunityList: undefined;
  OpportunityDetail: { opportunityId: number; type: OpportunityType };
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  OpportunitiesTab: undefined;
  ProfileTab: undefined;
};
