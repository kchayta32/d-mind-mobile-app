# Publishing D-MIND to Google Play Store

Since this is a modern Web Application, the recommended way to publish to the Play Store is as a **Trusted Web Activity (TWA)**. This wraps your PWA in a native Android shell without needing to rewrite code.

## 1. Prerequisites
I have already created the necessary web files for you:
- `public/manifest.json`: Defines the app name, icons, and colors.
- `public/.well-known/assetlinks.json`: A template for domain verification.

## 2. Generate the Android App (APK/AAB)
We will use Google's official tool called **compter-cli (Bubblewrap)**.

1.  **Install Node.js** (if not installed).
2.  **Open Terminal** and install the CLI:
    ```bash
    npm install -g @bubblewrap/cli
    ```
3.  **Create a folder** for the Android project (outside your web project):
    ```bash
    mkdir dmind-android
    cd dmind-android
    ```
4.  **Initialize the Project**:
    ```bash
    bubblewrap init --manifest https://your-deployed-url.com/manifest.json
    ```
    *Replace `https://your-deployed-url.com` with the actual URL where you host this website.*

5.  **Build the App**:
    ```bash
    bubblewrap build
    ```
    This will generate an `app-release-bundle.aab` file.

## 3. Verify Domain Ownership
During the build, Bubblewrap will give you a **SHA-256 Fingerprint**.
1.  Copy that SHA-256 string.
2.  Open `public/.well-known/assetlinks.json` in this project.
3.  Replace `REPLACE_WITH_YOUR_RELEASE_KEY_SHA256` with your actual fingerprint.
4.  **Deploy your website** again with this new file.

## 4. Upload to Play Console
1.  Go to [Google Play Console](https://play.google.com/console).
2.  Create a new app "D-MIND".
3.  Upload the `.aab` file generated in Step 2.
4.  Fill in store details, screenshots, and privacy policy.

**Note:** You must deploy this web project to a real HTTPS public URL (like Vercel, Netlify, or Firebase) before you can build the Android app, as Google needs to read the live `manifest.json`.
