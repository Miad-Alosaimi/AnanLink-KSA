// Design-system colors — matches AnanLink_Design_System.pdf
// Brand gradient: purple → muted purple → slate-teal (3-stop)
export const Colors = {
  primary: {
    purple: '#8f1eae',       // deep brand purple (design PDF)
    purpleMid: '#725b98',    // muted bridge purple
    teal: '#5c7a89',         // slate teal (anchor of hero gradients)
    teal2: '#43b1a3',        // accent teal (volunteer, success-ish)
    teal3: '#54bbc5',        // lighter teal
    blue: '#6fcbff',         // sky blue accent
    purpleLight: '#A855C7',
    tealLight: '#7AD0C5',
  },
  background: {
    app: '#F0EBF8',          // canvas — warm lavender (design PDF)
    card: '#FFFFFF',
    surface2: '#F5F0FC',
    modal: 'rgba(0,0,0,0.5)',
  },
  text: {
    primary: '#1A0F2E',      // ink (design PDF)
    secondary: '#4A3B6A',    // ink2
    muted: '#9480B8',        // ink3
    white: '#FFFFFF',
  },
  status: {
    success: '#00C853',
    error: '#FF4B6E',        // danger (design PDF)
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  xp: {
    gold: '#FFD700',         // gold (design PDF)
    goldLight: '#FFF3C0',
    silver: '#B8C5D0',
    bronze: '#D97706',
  },
  // 3-stop gradient — use .all for LinearGradient colors prop
  gradient: {
    start: '#8f1eae',
    mid: '#725b98',
    end: '#5c7a89',
    all: ['#8f1eae', '#725b98', '#5c7a89'] as [string, string, string],
    // Teal variant for volunteer / teal hero screens
    tealAll: ['#43b1a3', '#54bbc5', '#6fcbff'] as [string, string, string],
    // Mixed (purple→teal) for accents
    mixed: ['#725b98', '#43b1a3'] as [string, string],
  },
  opportunity: {
    hackathon: '#8f1eae',
    hackathonLight: '#F0E4F7',
    internship: '#6fcbff',
    internshipLight: '#E0F2FE',
    opensource: '#43b1a3',
    opensourceLight: '#DCFCE7',
    volunteer: '#54bbc5',        // teal (design PDF volunteer screens)
    volunteerLight: '#E0F7FA',
  },
  ui: {
    border: '#E2D9F3',
    divider: '#F3EEFA',
    disabled: '#D1CCE0',
    placeholder: '#9480B8',
    inputBg: '#F9F6FC',
    tabBar: '#FFFFFF',
    shadow: 'rgba(143, 30, 174, 0.08)',
  },
  leaderboard: {
    gold: '#FFD700',
    goldBg: '#FFFBEB',
    silver: '#B8C5D0',
    silverBg: '#F9FAFB',
    bronze: '#D97706',
    bronzeBg: '#FFF7ED',
  },
};
