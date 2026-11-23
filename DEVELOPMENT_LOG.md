# Hoya development log

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

## 2026-11-23
- Extracted the five-question exercise banks for English, Spanish and Italian into `src/exercises.js` to make them independently testable.
- Added `validate:exercises`: checks exact question count, nonempty prompts/choices, four choices per question, duplicate prompts/choices, and valid correct-answer indices.
- Added exercise validation to Web CI, Android debug builds and signed-release workflow. Android debug CI now also triggers on script changes.
- Local Node 22 validation passed for all three exercise banks (5 questions each, 4 unique options, correct-answer index in range). This is structural validation, not a linguistic or end-to-end test.
