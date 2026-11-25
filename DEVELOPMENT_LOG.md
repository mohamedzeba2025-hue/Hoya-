## 2026-11-25
- Added defensive parsing for locally persisted learner state: course completion keys, exercise progress, awarded-exercise flags, activity dates, profile name and XP are validated before React state is initialized.
- Added Node tests for malformed/out-of-range storage values and wired them into Web CI, Android debug builds and signed Android release builds.
- GitHub Actions verification is pending for this commit. No local build or physical-device test was performed in this run.

# Hoya development log

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
