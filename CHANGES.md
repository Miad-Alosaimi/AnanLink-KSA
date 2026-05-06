# AnanLink — Fixes & Improvements

## 🆕 Round 11: Scroll-driven tab collapse + chip edge fades

**Edge-fade gradients on city chips (issue 1).** The chips at the left/right edges of the horizontal scroll were getting clipped by the screen, leaving partial text like "محافظة الـ..." that looked broken. Fix: wrapped the city chip ScrollView in a relative container with two `LinearGradient` overlays at the left/right edges fading from `Colors.background.app` solid → fully transparent over 28px. Also bumped the inner `paddingHorizontal` from 20 to 28 so partially-visible chips sit *under* the gradient (looking faded out, not clipped).

Visually: chips now appear to "fade off the edge" rather than getting cut. Signal to the user: "more chips here, scroll to see them."

`pointerEvents="none"` on the gradients so taps pass through to the chips underneath.

**Collapsing tabs on scroll (issue 2).** Added scroll-driven animation. As the user scrolls down through the opportunity list:
- Row 2 of segmented tabs (تدريب · تطوع) shrinks from 44px height to 0
- Row 2 opacity fades from 1 to 0
- The gap between rows shrinks from 8 to 0
- The outer top padding shrinks from 14 to 6

All driven by an `Animated.Value` interpolated from `scrollY` (0 → 80px scroll = full collapse). Reverses when scrolling back up. Uses `useNativeDriver: false` because we're animating layout properties (height/padding) — the JS-driven animation is fine for this size of UI.

**Trade-off discussed:** Could have collapsed *both* rows or shown a compact single-row with all 5 tabs when scrolled. Chose the current approach because:
1. Simpler implementation, more predictable behavior
2. Row 1 contains the most-common filters (الكل · معسكرات · مصدر مفتوح) — these stay always-accessible
3. Row 2's filters (تدريب · تطوع) are still reachable: just scroll back to the top

If active tab is in row 2, the user sees their selection until they scroll. After that, they need to scroll back up to reselect — a minor inconvenience that's worth the screen real estate.

**About page tech tags removed (issue 3).** Deleted the React Native / TypeScript / SQLite / Expo pill row from the team card. Also dropped the now-unused `tagsRow`, `tag`, `tagText` styles.

---

## 🆕 Round 10: Final Polish — RTL fix, profile errors, QR sharing, big logos

**RTL bug — biggest fix this round.**
The app was rendering left-to-right despite all the Arabic text. Cause: `I18nManager.forceRTL(true)` only takes effect on the **next** app launch (RN initializes the layout direction during native bridge boot, before JS runs). The flag was being set, but the running session was still LTR.

Fix: in `App.tsx`, check `I18nManager.isRTL` at startup. If false, trigger `DevSettings.reload()` (works in Expo Go and dev builds) which restarts the bridge so the new RTL flag takes effect immediately. After the reload, `isRTL === true` and the check no-ops on subsequent launches. This means users will see a one-time auto-reload the first time they open the app on a device that hadn't seen the RTL flag before. After that, every launch is instant and correctly RTL.

**Profile update error — root cause + safety net.**
The profile-edit error was caused by missing `avatarUri` and `isSuggestion` columns on installs where the schema migration didn't run cleanly (e.g. user re-installed but the previous version's `schema_meta.version = 4` survived in WAL, so the v3→v4 migration block didn't fire even though the columns weren't there).

Fix: extracted `ensureUserColumns()` to run idempotently on every launch — `ALTER TABLE ADD COLUMN` calls wrapped in try/catch. SQLite errors when adding an existing column, the catch silently swallows it. Net effect: missing columns get added on the next launch, regardless of recorded schema version.

Also: improved error messaging in EditProfileScreen — now shows the actual error to help diagnose future issues. Made `User.academicYear` accept `string | number` since we store it as TEXT in DB.

**Personal QR code (item 5).**
New "رمز QR الخاص بي" option in profile menu (between bookmarks and notifications). Shows a styled QR code containing the user's email + name as JSON: `{type:'ananlink-friend', email:..., name:...}`. The AddFriendsScreen scanner already handles this format. Decorative purple corner brackets, user's avatar overlay in the center, name and university below. Friends scan, get added.

Uses `react-native-qrcode-svg` (newly added dependency).

**Map legend cleanup (item 4).**
Removed "مصدر مفتوح" from the colored-dot legend at the bottom of the map view. Open-source projects don't have geographic locations so they were always missing from the actual pins anyway — having them in the legend was confusing.

**Universities list expanded (item 6).**
From 14 to 47 universities, organized into:
- Major government universities (KFUPM, KSU, KAU, KAUST, IMSIU, IAU, KKU, KFU, UQU, IU, etc.)
- Regional government universities (Taibah, Taif, Qassim, Hail, Jouf, Tabuk, Jazan, Najran, Baha, Shaqra, Northern Borders, Bisha, Prince Sattam, Majmaah, PNU, Jeddah, KSAU-HS)
- Applied & technical (KAU Civil Aviation, Technical College, SEU)
- Private universities (PSU, PMU, Al-Faisal, Dar Al-Uloom, Effat, Al-Yamamah, Al-Maarefa, Sulaiman Al-Rajhi, UBT, Al-Rayyan, Al-Farabi, etc.)
- Specialized colleges (Al-Batterjee, Ibn Sina, etc.)
- Plus "أخرى" fallback

**City filter chips — proper text-hugging (item 2).**
Bumped padding to 18×10, added `flexGrow: 0` and `alignSelf: 'flex-start'` so chips truly hug their text content without stretching. Bumped border-radius to 20 for a more pill-like shape. Set `lineHeight` to prevent vertical clipping with `includeFontPadding: false`. 3-word cities like "مكة المكرمة" now display fully with comfortable padding on all sides.

**Logos enlarged on ALL screens (item 3):**
| Screen | Tile (was → now) | Logo image (was → now) |
|---|---|---|
| Splash | 144 → **180** | 104 → **128** |
| Intro1 (welcome) | 144 → **180** | 104 → **128** |
| Login | 104 → **144** | 76 → **108** |
| About | 96 → **120** | 68 → **88** |

Shadows scaled proportionally so the logos still feel grounded.

**About page — heart color (item 7).**
Changed footer heart from red ❤️ to purple 💜 to match the brand palette.

**New dependencies:** `react-native-qrcode-svg` (for personal QR generation).

---

## 🆕 Round 9: Friends, Profile Editing, About Page, Polish

**Friend system + leaderboard rewrite.** The leaderboard was previously seeded with 8 mock users so it was never empty, which felt fake. Now:
- Mock users are flagged `isSuggestion = 1` and don't appear by default
- Empty leaderboard with CTA: "أضف أصدقاء لمشاهدة منافستك"
- New `friends` table tracks user→friend relationships (cascading delete)
- Three ways to add friends:
  1. **Suggestions** — list of suggested students (the previous mock users, now framed as "طلاب مقترحون لك")
  2. **Email** — search local DB by email; adds instantly if found
  3. **QR scan** — uses `expo-camera` to scan a friend's QR code (parses `{type:'ananlink-friend', email:'...'}` JSON or plain email)
- Leaderboard populates with the user + their friends ranked by XP, podium for top 3

**Edit Profile screen.** New screen accessible from menu. Edit:
- First/last name (auto-recomputes fullName)
- University, major
- Career path (picker with all 9 careers from CAREERS catalog)
- Academic year (1-5 / متخرج)
- Avatar — pick from camera, gallery, or remove (uses `expo-image-picker`, stores local URI)
- Avatar shown in profile hero, leaderboard, and add-friends suggestions list

**Profile menu modal redesigned:**
- Each row has a colored icon circle
- Edit profile → push EditProfileScreen
- Bookmarks → push BookmarksScreen (was missing before!)
- Notifications → **inline toggle switch** (no separate page; saved to AsyncStorage)
- About → push AboutScreen
- Logout → push handler (destructive style)

**About screen.** Full Arabic copy explaining the app:
- Hero with app logo + version
- "قصة التطبيق" — explains we built this as IAU CS students for fellow Saudi students
- "ماذا يقدّم التطبيق؟" — 5 features with icons
- "الفريق" — story of the 2-student team + tech stack tags
- "هدفنا" — mission with stats (127 opportunities, 9 paths, 45 OSS projects)
- Contact email + footer

**Map fixes** (item 1):
- Removed "مصدر مفتوح" from filter chips on map (GitHub repos aren't location-bound)
- Always filters out opensource type before rendering markers

**Location chip improvements** (item 2):
- Bigger padding (14px horizontal, 8px vertical)
- `flexShrink: 0` so 3-word city names don't truncate
- Font upgraded to `sm` size for readability

**Schema migration v4:**
- Added `avatarUri TEXT` column to users
- Added `isSuggestion INTEGER NOT NULL DEFAULT 0` column to users
- Added `friends` table (`userId`, `friendId`, `addedAt`, UNIQUE constraint, CASCADE deletes)
- Migration uses `ALTER TABLE ADD COLUMN` (non-destructive — existing user data preserved)
- Existing seeded mock users get auto-flagged as suggestions via UPDATE

**New utility:** `src/utils/userPreferences.ts` — AsyncStorage-backed preferences with `useNotificationsPref()` hook for the menu toggle.

**Dependencies:** added `expo-image-picker ~17.0.7` for avatar uploads.

---

## 🆕 Round 7: Real Opportunities + GitHub Integration

**127 real Saudi opportunities** replace the mock data:
- **36 bootcamps** (معسكرات) from أكاديمية طويق — real names, dates, durations, URLs, images
- **60 volunteer opportunities** from منصة العمل التطوعي NVG — real events across Riyadh + remote with real seats, dates, categories
- **31 tech internships** from Career Saudi — filtered from the 50 total to keep only tech-relevant categories (software, data, design, QA, product)

**Tab renamed:** "هاكاثونات" → "معسكرات" (honest labeling — the Tuwaiq data is bootcamps, not hackathons). `OpportunityType` enum: `hackathon` → `bootcamp`.

**GitHub live integration:**
- `src/services/githubService.ts` — 45 curated beginner-friendly repos (5 per career × 9 careers) covering React, TensorFlow, Kubernetes, Flutter, Pandas, OWASP, Penpot, etc.
- `fetchRepoStats(fullName)` hits `https://api.github.com/repos/{fullName}` live on detail open
- **1-hour in-memory cache** so re-opening is instant and we stay under GitHub's 60 req/hr unauthenticated limit
- **Graceful offline fallback** — if fetch fails, we show baseline stats + "offline" banner
- Recommendations filter by user's career (picked at signup). Fallback to curated mix for users without a career set.

**Schema v3 migration:**
- Added `schema_meta` table for version tracking
- On launch, if user's DB is pre-v3, we DROP + recreate `opportunities` and `bookmarks` (CHECK constraint changed from `hackathon` to `bootcamp`, many new columns added)
- Bookmarks reset on migration (acceptable — users don't have many yet)
- User data, achievements, XP, skill progress all preserved
- 18 new opportunity columns: `extId`, `subtitle`, `startDate`, `endDate`, `seats`, `city`, `region`, `category`, `jobType`, `level`, `durationWeeks`

**New screens:**
- Completely rewritten `OpportunityListScreen` — gradient hero that changes color per filter, search bar with dynamic placeholder, type chip tabs, rich cards that show type-specific meta (durationWeeks for bootcamps, seats+endDate for volunteer, jobType+city for internships, stars+forks+language for opensource)
- 4 type-specific detail screens in `src/screens/opportunities/details/`:
  - `BootcampDetailScreen` — duration pill, start date banner if ≤14 days, full Tuwaiq metadata
  - `InternshipDetailScreen` — company, city, jobType, category fields; full job description
  - `VolunteerDetailScreen` — startDate/endDate, seats, level, urgent banner if ≤7 days left
  - `OpenSourceDetailScreen` — lives fetches from GitHub API; displays stars/forks/issues/license/last-push/topics; loading and offline banners
- `DetailLayout.tsx` shared component — gradient hero, floating stats strip, info rows, about section, bottom action bar with bookmark + primary CTA + XP earn label

**Dropped mock services:** `devpostService`, `hackathonService`, `internshipService`, `jadaratService`, `remotiveService`. Previously these generated fake data; now we have real data in the DB and real GitHub API calls.

**Navigation:**
- Route `HackathonDetail` → `BootcampDetail`
- Each type routes to its own detail screen (was 1 generic screen for all 4)
- Home tab's `OpportunityDetail` route now dispatches to the right opportunities-tab screen based on type

---

## 🆕 Round 6: Career-Based Skill Track Filtering

The "مساراتك" section on the profile now shows only skill tracks relevant to the user's **chosen career path** — not a generic list for everyone.

**How it works:**
- During registration (step 1, "المسار التقني" picker), user picks one of 9 careers:
  Front-end, Back-end, Mobile, Data Science, AI, Cybersecurity, Cloud, DevOps, UI/UX
- On the profile, the "مساراتك" section filters the catalog to **just the ~5 tracks relevant to that career**
- The "استكشاف →" link opens the full catalog of **37 tracks** where users can complete anything they want
- Off-path track completions still count toward XP and achievements; they just don't clutter the profile view (hybrid model)

**Career → track mapping:**
| Career | Profile tracks |
|---|---|
| Front-end | HTML/CSS, JavaScript, React, TypeScript, UI/UX Basics |
| Back-end | Node.js, SQL, REST APIs, Auth, Testing |
| Mobile | React Native, Native APIs, State Mgmt, Mobile UI, Publishing |
| Data Science | Python, SQL, Statistics, Data Viz, Pandas/NumPy |
| AI | Python, ML, Deep Learning, NLP, Computer Vision |
| Cybersecurity | Networking, Cryptography, Ethical Hacking, Web Security, Forensics |
| Cloud | AWS, Docker, Kubernetes, CI/CD, Serverless |
| DevOps | Linux, Docker, CI/CD, Kubernetes, Monitoring |
| UI/UX | Design Principles, Figma, Prototyping, User Research, Accessibility |

Some tracks appear under multiple careers (Python for Data Science + AI; Docker for Cloud + DevOps) — intentional, matches real-world overlap.

**Unlock prerequisites:**
- Deep Learning requires 3 units of Machine Learning
- NLP, Computer Vision require 3 units of ML
- Kubernetes requires 3 units of Docker
- Ethical Hacking requires 3 units of Networking

**Data storage:**
- No schema migration needed — career ID is stored in the existing `specialty` TEXT column (e.g. `"data-science"`)
- Old users with free-text specialty values see ALL 37 tracks as fallback (non-destructive)

**Files changed:**
- `src/constants/skillTracks.ts` — full rewrite. 37 tracks organized by topic, `CAREERS`, `CAREER_TRACK_MAP`, `getTracksForCareer(careerId)`, `getCareerById(careerId)` helpers
- `src/constants/index.ts` — new exports
- `src/hooks/useSkillProgress.ts` — returns `careerTracks` (filtered) and `allTracks` (full catalog)
- `src/screens/auth/RegisterStep1Screen.tsx` — `PickerModal` extended to accept `{value, label, icon}` options; wired to `CAREERS` array
- `src/screens/profile/UserProfileScreen.tsx` — renders `careerTracks` from hook
- `src/screens/profile/SkillPathListScreen.tsx` — still uses full `SKILL_TRACKS` (the "explore" view)

---

This document lists everything that changed since you uploaded `AnanLink.zip`.

## 🆕 Round 5: Real Skill Progress System

Replaced fake/hardcoded skill completion numbers with a real per-user progress system backed by SQLite.

**New database table** `user_skill_progress`:
- Columns: `(userId, trackId, unitIndex, completedAt)`
- UNIQUE constraint on `(userId, trackId, unitIndex)` so completions are idempotent
- Cascades on user delete

**New file `src/database/queries/skillQueries.ts`:**
- `completeUnit(userId, trackId, unitIndex)` — returns `true` if newly completed (caller awards XP)
- `uncompleteUnit(...)` — returns `true` if deleted (caller deducts XP)
- `getUserProgress(userId)` — all completions
- `getCompletedUnitsForTrack(userId, trackId)` — indices for one track (used by detail screen)
- `getCompletionCountsByTrack(userId)` — `{ trackId: count }` map for list/profile screens
- `getTotalCompletedUnits(userId)` — grand total
- `isTrackUnlocked(userId, trackId)` — evaluates prerequisites
- `getAllUnlockStates(userId)` — batch version for rendering the whole catalog

**Unlock rules** (declared in the track catalog):
- Cybersecurity (`security`) locks until the user completes 5 total units in any other track
- Other tracks are unlocked by default
- Rules are declarative — each track can declare `prerequisite: { requiredTrackId?, unitsRequired }` in `skillTracks.ts`

**XP integration:**
- Checking a unit adds `+30 XP` (from `XP_VALUES.SKILL_MODULE_COMPLETE`)
- Unchecking deducts `-30 XP`
- `updateUserXP` now clamps at 0 (can never go negative) and re-evaluates level on every update
- All XP changes refresh the UserContext so the profile XP bar updates immediately

**New hook `src/hooks/useSkillProgress.ts`:**
- `useAllSkillProgress()` — returns `{ counts, unlockStates, totalUnits, refresh }` for the profile + list screens
- `useTrackProgress(trackId)` — returns `{ completed, toggle, refresh }` for the detail screen, with `toggle` that handles DB + XP + local state in one call

**`SKILL_TRACKS` refactored to pure catalog:**
- Removed hardcoded `completed` field — that's now per-user state in SQLite
- Added full `units` arrays inline (12 units for ML, 10 for mobile/security, 12 for backend, 9 for frontend, 6 for cloud) — previously these lived in `SkillPathDetailScreen` as a Record<string, ...> with only 2 tracks populated
- Each unit can optionally declare a `tech` string (shown as a chip under the unit title)

**`SkillTrackCard` refactored:**
- Takes `completed` + `unlocked` as props (was hardcoded)
- Locked state shows lock icon, greyed card, no progress bar, non-tappable
- Locked state label auto-generates from the prerequisite (e.g. "مقفل — أكمل 5 وحدات أولاً")

**`SkillPathDetailScreen` fully rewritten:**
- Tappable unit cards that toggle real completion in SQLite
- Haptic feedback on check/uncheck
- Gradient header using the track's own color, with live progress bar and "X/Y" chip
- Completion banner appears at the bottom when all units are done, showing total XP earned
- Units show their tech tags and realistic +30 XP per unit

**`UserProfileScreen` + `SkillPathListScreen`:**
- Use `useAllSkillProgress()` to render each card with real per-user progress
- Auto-refresh on focus (returns to this screen with updated counts after user toggles units in the detail screen)

---

## 🆕 Round 4: Profile Screen Redesign

Built a new profile page matching the design reference: purple hero with avatar, floating stats strip (hackathons / volunteer hours / contributions), XP progress card with purple→gold gradient bar, achievements list with XP badges, contributions list from QR check-ins, inline skill tracks showing up to 6 paths, and a ⋯ menu icon top-left that opens a bottom-sheet with logout, edit profile, notifications, and about.

Level rank titles added (1=مبتدئ, 2=متعلّم, …, 7=مستكشف, 8=خبير).

## 🆕 Round 3: Home Screen Adjustments

- Recent Opportunities list is now horizontal-scroll (using compact card variant, RTL-correct with `inverted`)
- New "الفعاليات القريبة منك" map preview section below it with teal gradient, decorative dots, and floating pill markers

## 🆕 Round 2: Intro Flow (4 new screens before login)

Added a brand-intro flow that shows **once per install** before reaching the existing onboarding/login. Matches the design PDF exactly.

**New files:**
- `src/screens/intro/IntroScreen1.tsx` — Splash-hero with real logo tile, app name, tagline, "ابدأ رحلتك التقنية" CTA, "لديك حساب؟ سجّل دخولك" link, 4 feature emojis (🏆💼🌟🤝). Decorative pink/purple and teal background blobs. Spring-in animation for logo, fade-in for content.
- `src/screens/intro/IntroScreen2.tsx` — Trophy icon tile with "+300 XP" chip and notification dot. "اكتشف الفرص التقنية في مكان واحد".
- `src/screens/intro/IntroScreen3.tsx` — Star icon tile with "المستوى 7" + "#24 على لوحة الصدارة" chips. Includes React Native (75%) and Python (62%) skill progress bars in a white card below the subtitle.
- `src/screens/intro/IntroScreen4.tsx` — Map icon tile with "5 فعاليات قريبة" + "تسجيل QR سريع" chips. Final screen with stacked CTAs: primary "إنشاء حساب جديد" (deep-links to register) and secondary "لدي حساب — سجّل دخولك" (goes to login). Both mark onboarding as seen.
- `src/screens/intro/_shared/IntroLayout.tsx` — Shared layout for screens 2–4: decorative double-ring background, centered gradient icon tile, floating top/side badges, pagination dots (wide active pill), flexible CTA bar (inline skip+next or stacked primary+secondary).

**Logo bundled:** your uploaded `ananlink_logo.png` is now at `assets/logo.png` (black background removed → transparent PNG). Also regenerated `icon.png`, `splash-icon.png`, and `android-icon-foreground.png` using the real logo.

**Wiring:**
- `RootStackParamList` extended: `Intro1 | Intro2 | Intro3 | Intro4` added
- `RootNavigator.tsx` renders Intro1→4 → Onboarding → Auth when `hasSeenOnboarding` is false
- On install: user sees Intro1 → tapping "ابدأ" advances through Intro2, 3, 4 → lands in Auth
- On reopen after first install: skips straight to Auth (common pattern, doesn't annoy returning users)
- `slide_from_left` animation (RTL-correct slide direction)

**Strings:** `Strings.intro.*` added with all Arabic copy.

**Placeholders replaced:** the ✦ star placeholder in `SplashScreen` and `LoginScreen` now uses the real logo image.

---

## 🐛 Round 1: Critical Bugs Fixed

### 1. QR Scanner — React Hooks violation (crash bug)
**File:** `src/screens/qr/QRScannerScreen.tsx`

The old code called `useCameraPermissions()` conditionally inside a `try/catch`, which violates the Rules of Hooks and would crash in dev. Rewrote with static imports from `expo-camera`. Added animated laser line, flash toggle, and achievement-unlock popup on successful scan.

### 2. Level calculation was linear (wrong)
**Files:** `src/database/queries/userQueries.ts`, `src/utils/levelCalc.ts` (new)

Old formula: `level = xp / 100 + 1` — meant level 10 at 900 XP, level 100 at 9900 XP. That's linear forever.
New formula (per implementation guide §7.3): progressive thresholds **0 / 100 / 300 / 600 / 1000 / 1500 / 2200 / 3000**, maxing at level 8. Encoded both in SQL (CASE expression in `updateUserXP`) and in TypeScript (`getLevel`, `levelProgress`, `xpToNextLevel`, `xpAtNextLevel`).

### 3. Colors didn't match design PDF
**File:** `src/constants/colors.ts`

Old gradient: 2-stop `#7B2FBE → #00B8D9` (generic purple→cyan).
New gradient: **3-stop `#8f1eae → #725b98 → #5c7a89`** (purple→muted purple→slate-teal — matches the design PDF exactly).

Also updated ink/canvas colors, volunteer color (orange → teal, matching volunteer screens in the PDF), and added `Colors.gradient.tealAll` for volunteer/skill-path accents.

All 15 files using `[Colors.gradient.start, Colors.gradient.end]` were bulk-updated to `Colors.gradient.all`.

## ✨ New Features Added

### 1. XP & Achievement system
**New files:** `src/constants/xpValues.ts`, `src/utils/achievements.ts`

XP constants per guide §7.2:
- `HACKATHON_JOIN: 300`, `HACKATHON_WIN_1ST: 400` (bonus)
- `INTERNSHIP_COMPLETE: 500`
- `VOLUNTEER_SCAN: 150`
- `OPEN_SOURCE_PR: 50`
- `SKILL_MODULE_COMPLETE: 30`
- `BOOKMARK: 5`, `PROFILE_COMPLETE: 50`, `WELCOME_BONUS: 30`

Auto-unlocking achievements:
- **ROCKET** — on register (🚀 انطلاقة رائعة)
- **FIRST_SCAN** — first QR scan (📱 أول مسح QR)
- **FIVE_SCANS** — 5 check-ins (🎗️ متطوع نشط)
- **FIRST_BOOKMARK** — first saved opportunity (🔖 جامع الفرص)
- **TEN_BOOKMARKS** — 10 saved (📚 مكتشف محترف)
- **LEVEL_5** — reach level 5 (🏆 على الطريق الصحيح)

Triggers fire at the UI call sites (`OpportunityListScreen`, `OpportunityDetailScreen`, `QRScannerScreen`) to avoid circular imports in the data layer.

### 2. Active Event Banner on HomeScreen
**New file:** `src/components/home/ActiveEventBanner.tsx`

Shows the nearest upcoming volunteer event with:
- Teal 3-stop gradient
- **LIVE** badge (red) when the event is today
- Days-until countdown badge otherwise
- Prominent "سجّل حضورك بـ QR" button that jumps to the QR tab

### 3. HomeScreen — real stats
**File:** `src/screens/home/HomeScreen.tsx`

Old version hardcoded stats to `'0'`. New version:
- Live counts from SQLite: bookmarks, check-ins, total XP
- Proper level-progress math (uses `levelCalc` utils)
- Skill-path quick-access card (teal gradient)
- Auto-refreshes via `useFocusEffect` when you return from another screen
- Pull-to-refresh

### 4. HomeMapScreen — proper map
**File:** `src/screens/home/HomeMapScreen.tsx`

- Static imports of `react-native-maps` and `expo-location`
- Requests location permission and centers on user (falls back to Riyadh)
- Colored markers per opportunity type (purple/teal/green/blue)
- Interactive callouts with navigation to detail screens
- Floating legend showing total count + color key
- Filter chips to narrow by type

### 5. Profile screen — correct math
**File:** `src/screens/profile/UserProfileScreen.tsx`

Now displays `{xp} / {nextThreshold}` and uses real `levelProgress()` instead of broken `(xp % 100) / 100`.

## 📦 New Dependency

Added `expo-location@~19.0.7` to `package.json` — required by the map screen for user positioning.

## 🎨 Visual Updates

- All gradient-using screens now show the PDF-accurate purple→slate-teal gradient
- Mock leaderboard users had their levels recalibrated to the new progressive thresholds (was level 12 at 1240 XP — impossible under new caps of level 8 max)
- Onboarding slide gradients updated to use palette colors instead of hardcoded hex

## ✅ Type-safety

`npx tsc --noEmit --skipLibCheck` passes with **zero errors**.

---

## How to run

```bash
cd ~/Desktop
# Optional: back up your current work
mv AnanLink AnanLink-backup
unzip AnanLink-final.zip
cd AnanLink
npm install
npx expo start
```

Then scan the QR in Expo Go on your physical device (iOS Simulator can't use the camera).

### To test QR scanning

Generate a QR code at [qr-code-generator.com](https://www.qr-code-generator.com/) containing this JSON:

```json
{"eventId":"v001","eventName":"منتدى رؤية 2030","opportunityId":7,"xpReward":150}
```

Scan it from the QR tab → success screen shows XP earned + any newly-unlocked achievements → DB persists the check-in → Profile screen reflects the new count on return.
