
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { GISTDAHotspot } from '../useGISTDAData';

interface WildfireRegionChartProps {
  hotspots: GISTDAHotspot[];
}

const WildfireRegionChart: React.FC<WildfireRegionChartProps> = ({ hotspots }) => {
  const generateRegionData = () => {
    const regionCounts: Record<string, number> = {};
    
    hotspots.forEach(hotspot => {
      const region = hotspot.properties.changwat || 'ไม่ระบุ';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
    
    return Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
  };

  const regionData = generateRegionData();
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={regionData}
          cx="50%"
          cy="50%"
          outerRadius={60}
          fill="#8884d8"
          dataKey="count"
          label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
          fontSize={10}
        >
          {regionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default WildfireRegionChart;
