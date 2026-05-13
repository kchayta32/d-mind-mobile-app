import React, { useEffect, useState } from 'react';
import { BatteryCharging, BellRing, MapPin, Play, RefreshCw, Satellite, Server, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  hasDndAccess,
  getNativeReliabilityStatus,
  isAndroid,
  isIgnoringBatteryOptimizations,
  NativeReliabilityStatus,
  openNativeAppSettings,
  openBatteryOptimizationSettings,
  openDndSettings,
  refreshNativeFcmToken,
  startDisasterMonitoring,
  stopDisasterMonitoring,
} from '@/utils/native';

export const NativeReliabilityPanel: React.FC = () => {
  const [batteryAllowed, setBatteryAllowed] = useState<boolean | null>(null);
  const [dndAllowed, setDndAllowed] = useState<boolean | null>(null);
  const [status, setStatus] = useState<NativeReliabilityStatus | null>(null);
  const [monitoring, setMonitoring] = useState(false);

  const refresh = async () => {
    setBatteryAllowed(await isIgnoringBatteryOptimizations());
    setDndAllowed(await hasDndAccess());
    const reliability = await getNativeReliabilityStatus();
    setStatus(reliability);
    setMonitoring(reliability.monitoring);
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!isAndroid()) {
    return null;
  }

  const toggleMonitoring = async () => {
    if (monitoring) {
      await stopDisasterMonitoring();
      setMonitoring(false);
      await refresh();
      return;
    }

    const result = await startDisasterMonitoring();
    setMonitoring(result.started);
    await refresh();
  };

  const refreshFcm = async () => {
    await refreshNativeFcmToken();
    await refresh();
  };

  const readyForMonitoring = Boolean(status?.locationGranted && status?.notificationGranted);

  return (
    <Card className="mx-auto mt-4 max-w-md border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Android Reliability</CardTitle>
          <Button size="icon" variant="ghost" onClick={refresh} aria-label="Refresh Android reliability status">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Configure background monitoring, battery exemption, and critical alert access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3">
          <div className="flex items-center gap-3">
            <BatteryCharging className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Battery optimization bypass</p>
              <p className="text-xs text-muted-foreground">Keeps alerts reliable in the background.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={openBatteryOptimizationSettings}>
            {batteryAllowed ? 'Allowed' : 'Open'}
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-sky-50 p-3">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-sky-600" />
            <div>
              <p className="text-sm font-medium">Location permissions</p>
              <p className="text-xs text-muted-foreground">
                Foreground and background location are required for monitoring after app close.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={openNativeAppSettings}>
            {status?.locationGranted && status?.backgroundLocationGranted ? 'Ready' : 'Open'}
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-orange-50 p-3">
          <div className="flex items-center gap-3">
            <BellRing className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Do Not Disturb bypass</p>
              <p className="text-xs text-muted-foreground">Allows critical disaster channels to break through DND.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={openDndSettings}>
            {dndAllowed ? 'Allowed' : 'Open'}
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
          <div className="flex items-center gap-3">
            <Satellite className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium">FCM device token</p>
              <p className="text-xs text-muted-foreground">Refreshes and stores the token for backend registration.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={refreshFcm}>
            {status?.fcmTokenAvailable ? 'Ready' : 'Refresh'}
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-slate-600" />
            <div>
              <p className="text-sm font-medium">Backend endpoints</p>
              <p className="text-xs text-muted-foreground">SOS and FCM token endpoints must be configured for production.</p>
            </div>
          </div>
          <Badge variant={status?.sosEndpointConfigured && status?.fcmTokenEndpointConfigured ? 'default' : 'secondary'}>
            {status?.sosEndpointConfigured && status?.fcmTokenEndpointConfigured ? 'configured' : 'pending'}
          </Badge>
        </div>

        <Button className="w-full" variant={monitoring ? 'secondary' : 'default'} onClick={toggleMonitoring} disabled={!monitoring && !readyForMonitoring}>
          {monitoring ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {monitoring ? 'Stop monitoring' : 'Start monitoring'}
        </Button>

        <div className="flex gap-2">
          <Badge variant={batteryAllowed ? 'default' : 'secondary'}>
            Battery: {batteryAllowed ? 'ready' : 'needs setup'}
          </Badge>
          <Badge variant={dndAllowed ? 'default' : 'secondary'}>
            DND: {dndAllowed ? 'ready' : 'needs setup'}
          </Badge>
          <Badge variant={status?.backgroundLocationGranted ? 'default' : 'secondary'}>
            Background: {status?.backgroundLocationGranted ? 'ready' : 'needs setup'}
          </Badge>
          <Badge variant={status?.pendingSOSCount ? 'secondary' : 'default'}>
            SOS queue: {status?.pendingSOSCount ?? 0}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default NativeReliabilityPanel;
