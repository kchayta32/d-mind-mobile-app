import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const appDir = path.join(androidDir, 'app');

console.log('=== Google Play Store Readiness Verification ===');
let errors = [];
let warnings = [];

// 1. Check build.gradle
const buildGradlePath = path.join(appDir, 'build.gradle');
if (!fs.existsSync(buildGradlePath)) {
  errors.push(`build.gradle not found at ${buildGradlePath}`);
} else {
  const content = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Check SDK versions from variables.gradle or build.gradle
  const varsPath = path.join(androidDir, 'variables.gradle');
  if (fs.existsSync(varsPath)) {
    const vars = fs.readFileSync(varsPath, 'utf8');
    const compileSdkMatch = vars.match(/compileSdkVersion\s*=\s*(\d+)/);
    const targetSdkMatch = vars.match(/targetSdkVersion\s*=\s*(\d+)/);
    const minSdkMatch = vars.match(/minSdkVersion\s*=\s*(\d+)/);
    
    const compileSdk = compileSdkMatch ? parseInt(compileSdkMatch[1]) : 0;
    const targetSdk = targetSdkMatch ? parseInt(targetSdkMatch[1]) : 0;
    const minSdk = minSdkMatch ? parseInt(minSdkMatch[1]) : 0;
    
    console.log(`[SDK Config] compileSdk: ${compileSdk}, targetSdk: ${targetSdk}, minSdk: ${minSdk}`);
    
    if (targetSdk < 34) {
      errors.push(`targetSdkVersion (${targetSdk}) is below Google Play Store requirement (minimum 34 for new apps/updates)`);
    } else {
      console.log(`  ✓ targetSdkVersion ${targetSdk} meets Google Play Store standard (Android 14/15)`);
    }
    
    if (minSdk < 21) {
      warnings.push(`minSdkVersion (${minSdk}) is quite low; consider 23+ for modern TLS & security`);
    } else {
      console.log(`  ✓ minSdkVersion ${minSdk} is safe for modern Android features`);
    }
  }

  // Check versioning
  const versionCodeMatch = content.match(/versionCode\s+(\d+)/);
  const versionNameMatch = content.match(/versionName\s+["']([^"']+)["']/);
  
  if (!versionCodeMatch || parseInt(versionCodeMatch[1]) <= 0) {
    errors.push('versionCode must be a positive integer');
  } else {
    console.log(`  ✓ versionCode: ${versionCodeMatch[1]}`);
  }
  
  if (!versionNameMatch) {
    errors.push('versionName must be defined');
  } else {
    console.log(`  ✓ versionName: ${versionNameMatch[1]}`);
  }

  // Check Proguard and Minification in release
  if (content.includes('minifyEnabled true') && content.includes('shrinkResources true')) {
    console.log('  ✓ Release build enables R8 minification and resource shrinking');
  } else {
    warnings.push('Release build does not have both minifyEnabled and shrinkResources enabled');
  }
}

// 2. Check AndroidManifest.xml
const manifestPath = path.join(appDir, 'src/main/AndroidManifest.xml');
if (!fs.existsSync(manifestPath)) {
  errors.push(`AndroidManifest.xml not found at ${manifestPath}`);
} else {
  const manifest = fs.readFileSync(manifestPath, 'utf8');

  // Check exported tags on components
  const components = manifest.match(/<(activity|service|receiver|provider)[^>]*>/g) || [];
  let unexported = [];
  for (const comp of components) {
    const hasIntentFilter = comp.includes('android:exported=');
    const nameMatch = comp.match(/android:name="([^"]+)"/);
    const compName = nameMatch ? nameMatch[1] : 'Unknown';
    if (!comp.includes('android:exported=')) {
      unexported.push(compName);
    }
  }

  if (unexported.length > 0) {
    errors.push(`Android 12+ requires explicit android:exported on components: ${unexported.join(', ')}`);
  } else {
    console.log(`  ✓ All ${components.length} components have explicit android:exported declaration`);
  }

  // Check sensitive permissions
  if (manifest.includes('android.permission.FOREGROUND_SERVICE_SPECIAL_USE')) {
    warnings.push('android.permission.FOREGROUND_SERVICE_SPECIAL_USE is declared in Manifest. In Android 14+, Google Play requires PROPERTY_SPECIAL_USE_FGS_SUBTYPE inside the service tag and manual policy review. If not strictly required, remove it.');
  }

  if (manifest.includes('android:networkSecurityConfig')) {
    console.log('  ✓ networkSecurityConfig is declared in AndroidManifest.xml');
  } else {
    warnings.push('networkSecurityConfig is missing from <application> tag');
  }
}

// 3. Check network_security_config.xml
const netSecPath = path.join(appDir, 'src/main/res/xml/network_security_config.xml');
if (fs.existsSync(netSecPath)) {
  const netSec = fs.readFileSync(netSecPath, 'utf8');
  if (netSec.includes('<base-config cleartextTrafficPermitted="false">')) {
    console.log('  ✓ base-config enforces cleartextTrafficPermitted="false" (HTTPS only)');
  } else {
    warnings.push('network_security_config base-config does not explicitly enforce cleartextTrafficPermitted="false"');
  }
}

// 4. Check Proguard rules
const proguardPath = path.join(appDir, 'proguard-rules.pro');
if (fs.existsSync(proguardPath)) {
  const pg = fs.readFileSync(proguardPath, 'utf8');
  console.log('  ✓ proguard-rules.pro exists');
  if (pg.includes('org.maplibre')) {
    console.log('  ✓ MapLibre ProGuard keep rules present');
  }
  if (pg.includes('com.google.firebase')) {
    console.log('  ✓ Firebase ProGuard keep rules present');
  }
} else {
  errors.push('proguard-rules.pro not found');
}

// 5. Check App Launcher Icons
const mipmaps = ['mipmap-hdpi', 'mipmap-mdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
let missingIcons = [];
for (const m of mipmaps) {
  const iconPath = path.join(appDir, 'src/main/res', m, 'ic_launcher.png');
  const roundIconPath = path.join(appDir, 'src/main/res', m, 'ic_launcher_round.png');
  if (!fs.existsSync(iconPath)) missingIcons.push(`${m}/ic_launcher.png`);
  if (!fs.existsSync(roundIconPath)) missingIcons.push(`${m}/ic_launcher_round.png`);
}

if (missingIcons.length > 0) {
  warnings.push(`Missing launcher icons: ${missingIcons.join(', ')}`);
} else {
  console.log(`  ✓ All ${mipmaps.length * 2} standard and round launcher icons are present`);
}

// Summary
console.log('\n--- Store Readiness Audit Summary ---');
if (warnings.length > 0) {
  console.log('Warnings:');
  warnings.forEach(w => console.log(`  [WARN] ${w}`));
}

if (errors.length > 0) {
  console.log('Errors:');
  errors.forEach(e => console.log(`  [FAIL] ${e}`));
  process.exit(1);
} else {
  console.log('\nSTORE READINESS VERIFIED');
  process.exit(0);
}
