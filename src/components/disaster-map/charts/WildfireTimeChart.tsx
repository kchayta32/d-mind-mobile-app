
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GISTDAHotspot } from '../useGISTDAData';

interface WildfireTimeChartProps {
  hotspots: GISTDAHotspot[];
}

const WildfireTimeChart: React.FC<WildfireTimeChartProps> = ({ hotspots }) => {
  // Generate time-based data for the last 7 days
  const generateTimeData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayHotspots = hotspots.filter(h => (h.properties?.acq_date || h.ACQ_DATE) === dateStr);
      
      days.push({
        date: date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
        hotspots: dayHotspots.length,
        modis: dayHotspots.filter(h => (h.properties?.instrument || 'MODIS') === 'MODIS').length,
        viirs: dayHotspots.filter(h => (h.properties?.instrument || 'VIIRS') === 'VIIRS').length
      });
    }
    return days;
  };

  const timeData = generateTimeData();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={timeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={10} />
        <YAxis fontSize={10} />
        <Tooltip />
        <Bar dataKey="modis" stackId="a" fill="#ef4444" name="MODIS" />
        <Bar dataKey="viirs" stackId="a" fill="#f97316" name="VIIRS" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WildfireTimeChart;
