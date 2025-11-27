import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface RadialScoreProps {
  score: number;
}

const RadialScore: React.FC<RadialScoreProps> = ({ score }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Empty', value: 100 - score },
  ];

  let color = '#10b981'; // emerald-500
  if (score < 50) color = '#ef4444'; // red-500
  else if (score < 80) color = '#eab308'; // yellow-500

  return (
    <div className="relative h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="score" fill={color} cornerRadius={10} />
            <Cell key="empty" fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-4">
        <span className="text-sm text-slate-400 uppercase tracking-widest">Safe Score</span>
        <div className="text-6xl font-bold text-white transition-all duration-500">
          {score}
        </div>
      </div>
    </div>
  );
};

export default RadialScore;