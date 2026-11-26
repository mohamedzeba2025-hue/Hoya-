## 2026-11-25
- Added defensive parsing for locally persisted learner state in `src/storage.js`: validates course-completion keys, exercise progress, awarded-exercise flags, activity dates, profile name and XP before React state is initialized; storage access failures now fall back safely.
- Added `npm run test:storage` and wired it into Web CI, Android debug builds and signed Android release builds.
- GitHub Actions initially caught three defects in the new test/sanitizer implementation (a non-JSON fixture, over-escaped validation regexes, and clamping out-of-range exercise values). Each was corrected; the final run passed.
- Final verification on commit `fbb13d3`: Web CI #33 passed course/exercise validation, progress tests, storage tests and Vite build; Android APK #68 passed the same checks plus Capacitor sync, Gradle debug APK compilation and artifact upload (3.46 MB).
- No local build, signed release build, or physical-device test was performed.
- `npm install` reports 7 dependency vulnerabilities (4 moderate, 2 high, 1 critical); package-level audit and safe remediation remain outstanding.
- Supabase advisor still flags leaked-password protection as disabled. PR #2 remains open and non-mergeable; keep it isolated until its account-sync changes are reconciled with current main and verified end-to-end.

## 2026-11-24 (suite)
- Updated Web CI path filters so changes to `package-lock.json`, the Android debug workflow, or the signed Android release workflow also trigger validation and a web build.
- Confirmed after the workflow changes: Android debug build run #45379829395 succeeded, including course/exercise validation, Vite build, Capacitor sync, Gradle APK build, and artifact upload.
- Confirmed Web CI run #45380001100 succeeded, including course/exercise validation and Vite build.
- Debug APK workflow no longer publishes a version-tag release; signed APK/AAB publication remains owned by `release-android.yml`.
- No physical-device test or signed release build was performed in this run.

## 2026-11-24
- Removed the debug APK workflow's version-tag trigger and GitHub Release publishing step. The signed release workflow is now the sole workflow that publishes version-tag releases, preventing a race where a debug APK and signed APK/AAB both attempt to create the same GitHub Release.
- Reduced debug-build workflow permissions from `contents: write` to `contents: read`; artifact upload does not require repository write access.
- Verified before the change: latest main Web CI and Android debug APK runs both succeeded on commit `5bf0132`.
- Post-change validation: pending GitHub Actions runs. No physical-device test was performed.

## 2026-11-23
- Extracted the five-question exercise banks for English, Spanish and Italian into `src/exercises.js` to make them independently testable.
- Added `validate:exercises`: checks exact question count, nonempty prompts/choices, four choices per question, duplicate prompts/choices, and valid correct-answer indices.
- Added exercise validation to Web CI, Android debug builds and signed-release workflow. Android debug CI now also triggers on script changes.
- Local Node 22 validation passed for all three exercise banks (5 questions each, 4 unique options, correct-answer index in range). This is structural validation, not a linguistic or end-to-end test.

## 2026-11-22
- Fixed stale React state updates in lesson completion, lesson XP, exercise score, and exercise XP using functional setters.
- Reset the selected lesson and mini-quiz state when switching languages from either home or profile.
- Added a read-only GitHub Actions web CI workflow for PRs and main pushes: course-content validation + Vite build.
- Closed PR #3 as superseded; its progression fixes are now on main.
- Verified: Android debug APK workflow #57 succeeded; web CI #20 succeeded.
- Remaining: review/integrate the account-auth/progress-sync PR #2 carefully; configure leaked-password protection in Supabase Auth; perform real-device tests before release.

## 2026-11-21
- Course validator and Spanish lesson sequence improvements: web/Android build workflows #55 and #56 succeeded.
- Account/authentication and cloud-progress sync work remains in PR #2; its web CI #19 and Android build #2 succeeded on that branch, but it is not merged into main.

## 2026-11-26
- Fixed a streak-tracking bug: previously, a completed lesson or exercise only counted as an activity day when its one-time XP reward was awarded. Repeating already-completed learning now still records the day without granting duplicate XP.
- Added `recordActivityDay` in `src/progress.js`: validates the date-key shape, prevents same-day duplicates, and keeps at most 365 activity days.
- Added unit coverage in `scripts/test-progress.js` for first activity, same-day idempotency, invalid date input, and 365-day retention.
- Updated `src/main.jsx` to record activity on every successful lesson and completed exercise, independently of whether XP is awarded.
- Commits: `4ef2882` (activity helper), `1841ef3` (tests), `d763ff2` (app integration), `7ee0bc3` (date-regex correction).
- Two intermediate CI attempts failed because the initial date regex was over-escaped; corrected in `7ee0bc3`. Final Web CI run #45805546378 passed all content, exercise, progress, storage tests and Vite build. Final Android run #45805546475 passed the same checks, Capacitor sync, Gradle debug APK build and artifact upload (3,458,498 bytes).
- Supabase advisor check: no health findings; leaked-password protection remains disabled (security WARN); performance advisor reports 7 tables with multiple permissive RLS policies and 9 currently unused indexes. No database policy or index was changed in this run.
- PR #1 is 4 commits ahead / 28 behind main; PR #2 is 24 ahead / 28 behind. Both remain divergent and were not merged.
- No local build, signed release build, or physical-device test was performed.
- Next: audit dependency vulnerabilities, reconcile account-sync/auth branches with current main, and enable leaked-password protection after confirming the Auth configuration impact.


## 2026-11-26 (Actions runtime maintenance)
- Migrated GitHub Actions to current Node 24-compatible major releases: checkout v7, setup-node v7, setup-java v6, and upload-artifact v7.
- The previous successful CI logs showed Node.js 20 deprecation warnings for the old action majors; the updated action.yml files explicitly use Node 24.
- The Web CI and Android APK build will verify compatibility on this commit. No signed release was triggered.

## 2026-11-26 (Capacitor configuration cleanup)
- Removed the deprecated `bundledWebRuntime` option from `capacitor.config.json`; Capacitor 6 reports that the option is obsolete and safe to remove.
- Web CI and Android debug builds will verify the configuration change. The remaining Gradle flatDir and Android SDK XML warnings are upstream/toolchain warnings and were not altered here.
