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

const numberFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export default function UsageChart({ data, height = 300 }: UsageChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">No usage data yet</div>;
  }

  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formattedData} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke="#222427" strokeDasharray="3 6" />
        <XAxis
          dataKey="displayDate"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#85868b', fontSize: 11 }}
          tickMargin={12}
          minTickGap={18}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#85868b', fontSize: 11 }}
          tickFormatter={(value: number) => numberFormat.format(value)}
          width={48}
        />
        <Tooltip
          cursor={{ stroke: '#3a3c40', strokeDasharray: '4 4' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="min-w-40 rounded-xl border border-[#2a2b2f] bg-[#111214] px-3.5 py-3 shadow-2xl shadow-black/50">
                <p className="mb-2 text-xs font-medium text-gray-400">{label}</p>
                <div className="space-y-1.5">
                  {payload.map((item) => (
                    <div key={String(item.dataKey)} className="flex items-center justify-between gap-5 text-xs">
                      <span className="flex items-center gap-2 text-gray-300"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                      <span className="font-semibold tabular-nums text-white">{Number(item.value).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
        />
        <Legend
          verticalAlign="bottom"
          align="left"
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ paddingTop: 12, fontSize: '11px', color: '#a0a1a6' }}
        />
        <Line type="monotone" dataKey="total" name="Total" stroke="#a394ff" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#a394ff', stroke: '#0e0f11', strokeWidth: 2 }} />
        <Line type="monotone" dataKey="success" name="Successful" stroke="#41d6a3" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#41d6a3', stroke: '#0e0f11', strokeWidth: 2 }} />
        <Line type="monotone" dataKey="errors" name="Errors" stroke="#ff707d" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#ff707d', stroke: '#0e0f11', strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
