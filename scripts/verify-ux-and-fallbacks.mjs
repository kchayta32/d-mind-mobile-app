import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const appDir = path.join(androidDir, 'app');

console.log('=== UX/UI and Fallback Resilience Verification ===');
let errors = [];
let warnings = [];

// 1. Check IoT Station decoupling and fallback in Android
const repoPath = path.join(appDir, 'src/main/kotlin/com/dmind/app/data/repository/DefaultDisasterRepository.kt');
if (fs.existsSync(repoPath)) {
  const repoContent = fs.readFileSync(repoPath, 'utf8');
  if (repoContent.includes('private fun monitoringStations(): List<MonitoringStation>') &&
      repoContent.includes('Station and sensor-style data are available locally')) {
    console.log('  ✓ Android app provides clean local monitoring station fallbacks when IoT sensor API is pending');
  } else {
    warnings.push('DefaultDisasterRepository does not have explicit offline monitoringStations fallback');
  }
} else {
  errors.push(`DefaultDisasterRepository.kt not found at ${repoPath}`);
}

// 2. Check AppRoute coverage in DMindApp.kt
const appRoutePath = path.join(appDir, 'src/main/kotlin/com/dmind/app/ui/navigation/AppRoute.kt');
const dmindAppPath = path.join(appDir, 'src/main/kotlin/com/dmind/app/ui/DMindApp.kt');

if (fs.existsSync(appRoutePath) && fs.existsSync(dmindAppPath)) {
  const routeContent = fs.readFileSync(appRoutePath, 'utf8');
  const dmindAppContent = fs.readFileSync(dmindAppPath, 'utf8');

  // Extract routes
  const routeMatches = routeContent.match(/([A-Z][a-zA-Z0-9]+)\(R\.string\./g) || [];
  const routes = routeMatches.map(m => m.split('(')[0]);
  console.log(`[Navigation] Found ${routes.length} declared AppRoute destinations: ${routes.join(', ')}`);

  for (const r of routes) {
    if (!dmindAppContent.includes(`AppRoute.${r}`)) {
      errors.push(`Route AppRoute.${r} is declared in AppRoute.kt but not handled in DMindApp.kt navigation structure`);
    }
  }
  console.log('  ✓ All AppRoute destinations are mapped in DMindApp composable');
}

// 2.1 Check Coming Soon status on unreleased feature shortcut cards
const dashboardPath = path.join(appDir, 'src/main/kotlin/com/dmind/app/ui/screens/dashboard/DashboardScreen.kt');
if (fs.existsSync(dashboardPath)) {
  const dashContent = fs.readFileSync(dashboardPath, 'utf8');
  const victimMatch = /AppRoute\.VictimReports[\s\S]*?enabled\s*=\s*(false|true)/.exec(dashContent);
  const analyticsMatch = /AppRoute\.Analytics[\s\S]*?enabled\s*=\s*(false|true)/.exec(dashContent);
  const damageMatch = /AppRoute\.Damage[\s\S]*?enabled\s*=\s*(false|true)/.exec(dashContent);

  if (victimMatch && victimMatch[1] === 'false' &&
      analyticsMatch && analyticsMatch[1] === 'false' &&
      damageMatch && damageMatch[1] === 'false') {
    console.log('  ✓ Unreleased shortcut cards (VictimReports, Analytics, Damage) are configured as "เร็วๆ นี้" (enabled = false)');
  } else {
    errors.push('Unreleased shortcut cards (VictimReports, Analytics, Damage) must be set to enabled = false');
  }
}

// 3. Check Web RiskZone fallback
const webRiskPath = path.join(rootDir, 'src/hooks/useRiskZoneData.ts');
if (fs.existsSync(webRiskPath)) {
  const webRisk = fs.readFileSync(webRiskPath, 'utf8');
  if (webRisk.includes('MOCK_RISK_ZONES')) {
    console.log('  ✓ Web application has resilient MOCK_RISK_ZONES fallback for hazard mapping');
  }
}

// 4. Check Chatbot Screen Voice Lifecycle
const chatbotPath = path.join(appDir, 'src/main/kotlin/com/dmind/app/ui/screens/chatbot/ChatbotScreen.kt');
if (fs.existsSync(chatbotPath)) {
  const chatContent = fs.readFileSync(chatbotPath, 'utf8');
  if (chatContent.includes('voiceManager.destroy()') && chatContent.includes('DisposableEffect(voiceManager)')) {
    console.log('  ✓ Chatbot VoiceManager resources are safely released in DisposableEffect');
  } else {
    warnings.push('ChatbotScreen might leak VoiceManager or TTS resources upon dispose');
  }
}

// 5. Check MapLibre Lifecycle in Android
const mapLibrePath = path.join(appDir, 'src/main/kotlin/com/dmind/app/ui/screens/map/MapLibreView.kt');
if (fs.existsSync(mapLibrePath)) {
  const mapContent = fs.readFileSync(mapLibrePath, 'utf8');
  if (mapContent.includes('mapView.onDestroy()') && mapContent.includes('DisposableEffect(lifecycle, mapView)')) {
    console.log('  ✓ MapLibre MapView lifecycle is properly bounded to prevent memory leaks and GL crashes');
  } else {
    warnings.push('MapLibreView lifecycle management might be incomplete');
  }
}

console.log('\n--- UX & Fallbacks Summary ---');
if (warnings.length > 0) {
  warnings.forEach(w => console.log(`  [WARN] ${w}`));
}
if (errors.length > 0) {
  errors.forEach(e => console.log(`  [FAIL] ${e}`));
  process.exit(1);
} else {
  console.log('\nUX AUDIT AND FALLBACKS VERIFIED');
  process.exit(0);
}
