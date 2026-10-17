'use client';

import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const numberFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

function getTierColor(tier: string) {
  switch (tier) {
    case 'enterprise': return '#a394ff';
    case 'premium': return '#64b5ff';
    case 'free': return '#43d6a5';
    default: return '#9b9da3';
  }
}

export default function TopKeysChart({ data, height = 300 }: TopKeysChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">No key usage data yet</div>;
  }

  const formattedData = data.map(item => ({
    ...item,
    displayName: item.name.length > 17 ? `${item.name.slice(0, 16)}…` : item.name,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={formattedData} layout="vertical" margin={{ top: 6, right: 12, left: 4, bottom: 4 }} barCategoryGap={12}>
        <CartesianGrid horizontal={false} stroke="#222427" strokeDasharray="3 6" />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#85868b', fontSize: 11 }}
          tickFormatter={(value: number) => numberFormat.format(value)}
        />
        <YAxis
          type="category"
          dataKey="displayName"
          width={112}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#b9bac0', fontSize: 11 }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.035)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0].payload as TopKey;
            return (
              <div className="min-w-40 rounded-xl border border-[#2a2b2f] bg-[#111214] px-3.5 py-3 shadow-2xl shadow-black/50">
                <p className="mb-1 truncate text-sm font-semibold text-white">{item.name}</p>
                <p className="mb-2 text-xs capitalize text-gray-500">{item.tier} tier</p>
                <p className="text-sm font-semibold tabular-nums text-gray-100">{item.request_count.toLocaleString()} <span className="font-normal text-gray-500">requests</span></p>
              </div>
            );
          }}
        />
        <Bar dataKey="request_count" name="Requests" radius={[0, 6, 6, 0]} maxBarSize={24}>
          {formattedData.map((item) => <Cell key={item.id} fill={getTierColor(item.tier)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
