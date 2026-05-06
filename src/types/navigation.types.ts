import { RegisterStep1Data } from './user.types';
import { OpportunityType } from './opportunity.types';

export type RootStackParamList = {
  Splash: undefined;
  Intro1: undefined;
  Intro2: undefined;
  Intro3: undefined;
  Intro4: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  RegisterStep1: undefined;
  RegisterStep2: { step1Data: RegisterStep1Data };
  OTPVerify: { email: string };
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  OpportunitiesTab: { type?: OpportunityType } | undefined;
  QRTab: undefined;
  LeaderboardTab: undefined;
  ProfileTab: undefined;
};

export type LeaderboardStackParamList = {
  Leaderboard: undefined;
  AddFriends: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  HomeMap: undefined;
  OpportunityDetail: { opportunityId: number; type: OpportunityType };
};

export type OpportunitiesStackParamList = {
  OpportunityList: { type?: OpportunityType };
  BootcampDetail: { id: number };
  InternshipDetail: { id: number };
  OpenSourceDetail: { id: number };
  VolunteerDetail: { id: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Bookmarks: undefined;
  SkillPathList: undefined;
  SkillPathDetail: { trackId: string };
  EditProfile: undefined;
  About: undefined;
  MyQR: undefined;
};
