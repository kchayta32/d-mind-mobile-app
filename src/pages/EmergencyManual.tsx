
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const EmergencyManual: React.FC = () => {
  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => window.history.back()} className="mr-2 p-2">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Emergency Manual</h1>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-2">Flood Safety</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Move to higher ground immediately if flooding occurs</li>
              <li>Do not walk, swim, or drive through flood waters</li>
              <li>Stay off bridges over fast-moving water</li>
              <li>Evacuate if told to do so</li>
              <li>Return home only when authorities say it is safe</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-2">Earthquake Response</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Drop, Cover, and Hold On during shaking</li>
              <li>If indoors, stay away from windows and exterior walls</li>
              <li>If outdoors, move to a clear area away from buildings</li>
              <li>After shaking stops, check for injuries and damage</li>
              <li>Be prepared for aftershocks</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-2">Fire Safety</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Evacuate immediately if you smell smoke or see fire</li>
              <li>Use the back of your hand to check for heat before opening doors</li>
              <li>Stay low to the ground to avoid smoke inhalation</li>
              <li>Once outside, call for help and do not re-enter</li>
              <li>If trapped, seal doors and windows with wet cloths</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyManual;
