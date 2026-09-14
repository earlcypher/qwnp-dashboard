'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RequestsByDay {
  date: string;
  total: number;
  success: number;
  errors: number;
}

interface UsageChartProps {
  data: RequestsByDay[];
  height?: number;
}

export default function UsageChart({ data, height = 300 }: UsageChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No data available
      </div>
    );
  }

  // Format date for display (e.g., "Jan 15")
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis
          dataKey="displayDate"
          stroke="#888"
          style={{ fontSize: '12px' }}
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
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: '#888' }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#6366f1"
          strokeWidth={2}
          name="Total Requests"
          dot={{ fill: '#6366f1', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="success"
          stroke="#10b981"
          strokeWidth={2}
          name="Successful"
          dot={{ fill: '#10b981', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="errors"
          stroke="#ef4444"
          strokeWidth={2}
          name="Errors"
          dot={{ fill: '#ef4444', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
