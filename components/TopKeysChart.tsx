'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopKey {
  id: string;
  name: string;
  tier: string;
  request_count: number;
}

interface TopKeysChartProps {
  data: TopKey[];
  height?: number;
}

export default function TopKeysChart({ data, height = 300 }: TopKeysChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No data available
      </div>
    );
  }

  // Truncate long key names for display
  const formattedData = data.map(item => ({
    ...item,
    displayName: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name
  }));

  // Color by tier
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return '#a855f7'; // purple
      case 'premium': return '#3b82f6'; // blue
      case 'free': return '#6b7280'; // gray
      default: return '#6366f1'; // indigo
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis
          dataKey="displayName"
          stroke="#888"
          style={{ fontSize: '12px' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          stroke="#888"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff'
          }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as TopKey;
              return (
                <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3">
                  <p className="text-white font-medium mb-1">{data.name}</p>
                  <p className="text-gray-400 text-sm mb-1">
                    <span className={`badge ${
                      data.tier === 'enterprise' ? 'bg-purple-900/30 text-purple-400 border-purple-800' :
                      data.tier === 'premium' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                      'bg-gray-700/30 text-gray-400 border-gray-700'
                    }`}>
                      {data.tier}
                    </span>
                  </p>
                  <p className="text-indigo-400 font-medium">
                    {data.request_count} requests
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar
          dataKey="request_count"
          fill="#6366f1"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
