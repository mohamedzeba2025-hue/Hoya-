# HOYA — Language Learning

Hoya is a mobile-first language-learning app for English, Spanish and Italian, built with React, Vite and Capacitor.

## Current status

- The main branch contains the learning interface, lessons, exercises, XP and local progress storage.
- On the current main build, progress is stored on the device/browser. Account sign-in and cross-device cloud sync must not be considered available until their separate integration is merged and tested.
- Android debug APK builds are produced by GitHub Actions. A separate workflow prepares signed release APK and AAB files.

## Run locally

Requires Node.js 20 or later. The committed lockfile keeps dependency versions reproducible.

```bash
npm ci
npm run dev
```

## Build the web app

```bash
npm run build
```

## Android release signing

The workflow `.github/workflows/release-android.yml` creates a signed release APK and Android App Bundle (AAB). It requires these four GitHub Actions repository secrets:

- `ANDROID_KEYSTORE_BASE64`: the Base64-encoded release keystore file
- `ANDROID_KEYSTORE_PASSWORD`: the keystore password
- `ANDROID_KEY_ALIAS`: the alias chosen when the key was created
- `ANDROID_KEY_PASSWORD`: the key password

### Create the keystore on an Android phone with Termux

1. Install Termux from its official F-Droid or GitHub distribution, then open it.
2. Update packages and install an OpenJDK package that provides `keytool`:

   ```bash
   pkg update && pkg upgrade
   pkg search openjdk
   ```

   Install an available OpenJDK package (for example `openjdk-17`) and check that `keytool -help` works.
3. Generate the signing key in Termux's private home directory. Choose a strong, unique password and keep the alias exactly as `hoya`:

   ```bash
   keytool -genkeypair -v \
     -keystore "$HOME/hoya-release.jks" \
     -alias hoya \
     -keyalg RSA -keysize 4096 -validity 10000
   ```

4. Verify that the alias can be read:

   ```bash
   keytool -list -keystore "$HOME/hoya-release.jks" -alias hoya
   ```

5. Encode the keystore for the GitHub secret. This writes the encoded value to a local file instead of printing it in the terminal:

   ```bash
   base64 "$HOME/hoya-release.jks" | tr -d '\n' > "$HOME/hoya-release-base64.txt"
   ```

6. In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**. Add the four secrets listed above. Put the contents of `hoya-release-base64.txt` only in `ANDROID_KEYSTORE_BASE64`; enter the exact passwords and alias in their corresponding secrets. Never paste the keystore, encoded key or passwords into an issue, commit, chat or public file.
7. Keep at least one secure, encrypted backup of the original `hoya-release.jks` and its passwords outside the repository. Losing the signing key can prevent updates to APKs signed with it.

### Build a signed release

After the secrets are configured, open **Actions → Build Hoya Android Release → Run workflow**. The workflow checks that all four secrets exist, builds the web app, signs the APK and AAB, and uploads them as the `Hoya-Release` artifact. Pushing a version tag such as `v1.0.0` also runs the workflow and publishes the files as a GitHub Release.

A successful debug APK build is not proof that the signed release workflow works. Run and verify the signed workflow before distributing a publication build.

## Security notes

- Never commit `.jks`, `.keystore`, `.p12`, `.pfx`, Base64 key files or passwords.
- Only the Supabase publishable/anon key may be used in frontend configuration. Never expose a Supabase service-role key in the app.
- Test installation, sign-in, lesson completion, XP and progress restoration on a physical Android device before public distribution.
