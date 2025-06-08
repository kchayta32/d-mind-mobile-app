
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UsabilityData {
  aspect: string;
  score: number;
  votes: number;
}

interface UsabilityChartProps {
  data: UsabilityData[];
  title: string;
}

export const UsabilityChart: React.FC<UsabilityChartProps> = ({ data, title }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="horizontal"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 5]} />
          <YAxis type="category" dataKey="aspect" width={120} />
          <Tooltip 
            formatter={(value, name) => [
              `${value}/5`, 
              name === 'score' ? 'คะแนนเฉลี่ย' : 'จำนวนโหวต'
            ]}
          />
          <Bar dataKey="score" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
