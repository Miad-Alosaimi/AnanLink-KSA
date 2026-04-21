export interface User {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  major: string;
  specialty: string;
  academicYear: number;
  xp: number;
  level: number;
  avatar: string | null;
  createdAt: string;
}

export interface UserSkill {
  id: number;
  userId: number;
  skillName: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface Achievement {
  id: number;
  userId: number;
  badgeIcon: string;
  title: string;
  description: string;
  earnedAt: string;
}

export interface RegisterStep1Data {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  major: string;
  specialty: string;
}

export interface RegisterData extends RegisterStep1Data {
  password: string;
  academicYear: number;
  skills: string[];
}

export interface LeaderboardEntry {
  id: number;
  fullName: string;
  university: string;
  xp: number;
  level: number;
  rank: number;
  avatar: string | null;
}
