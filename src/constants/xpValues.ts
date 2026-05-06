// XP reward values per action — matches implementation guide section 7.2
export const XP_VALUES = {
  HACKATHON_JOIN: 300,
  HACKATHON_WIN_1ST: 400,    // bonus on top of join
  INTERNSHIP_COMPLETE: 500,
  VOLUNTEER_SCAN: 150,       // per QR check-in
  OPEN_SOURCE_PR: 50,
  SKILL_MODULE_COMPLETE: 30,
  BOOKMARK: 5,
  PROFILE_COMPLETE: 50,
  WELCOME_BONUS: 30,         // on register
} as const;

export type XpAction = keyof typeof XP_VALUES;
