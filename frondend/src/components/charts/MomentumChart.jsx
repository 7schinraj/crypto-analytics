import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const CHART_STYLE = {
  tick: { fill: '#94a3b8', fontSize: 11, fontFamily: 'Inter' },
  line: '#e2e8f0',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: '10px 14px',
      color: '#0f172a',
      fontFamily: 'Inter',
      fontSize: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4, fontFamily: 'inherit', fontSize: 11 }}>{payload[0]?.payload?.symbol}</div>
      <div style={{ color: parseFloat(payload[0].value) >= 0 ? '#059669' : '#dc2626', fontWeight: 700 }}>
        Score: {Number(payload[0].value).toFixed(2)}
      </div>
    </div>
  );
};

export default function MomentumChart({ data, type = 'horizontal', height = 280 }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const formatted = [...data]
    .sort((a, b) => a.rank - b.rank)
    .map((d) => ({
      symbol: d.symbol.replace('USDT', ''),
      score: parseFloat(d.momentum_score),
    }));

  if (type === 'vertical') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={formatted}
          margin={{
            top: 10,
            right: isMobile ? 12 : 20,
            left: isMobile ? -20 : -10,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
          <XAxis
            dataKey="symbol"
            interval={0}
            tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 8.5 } : CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={false}
          />
          <YAxis
            tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 8.5 } : CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={{ stroke: CHART_STYLE.line }}
            width={isMobile ? 32 : 46}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {formatted.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={entry.score >= 0 ? '#059669' : '#dc2626'}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={formatted}
          margin={{
            top: 10,
            right: isMobile ? 12 : 20,
            left: isMobile ? -20 : -10,
            bottom: 5
          }}
        >
          <defs>
            <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
          <XAxis
            dataKey="symbol"
            interval={0}
            tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 8.5 } : CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={false}
          />
          <YAxis
            tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 8.5 } : CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={{ stroke: CHART_STYLE.line }}
            width={isMobile ? 32 : 46}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#momentumGradient)"
            dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: 'var(--primary)', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Default: horizontal bar layout
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={formatted}
        margin={{
          top: 5,
          right: isMobile ? 8 : 24,
          left: isMobile ? -20 : 10,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
        <XAxis
          type="number"
          tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 8.5 } : CHART_STYLE.tick}
          axisLine={{ stroke: CHART_STYLE.line }}
          tickLine={{ stroke: CHART_STYLE.line }}
          tickFormatter={(v) => v.toFixed(1)}
        />
        <YAxis
          type="category"
          dataKey="symbol"
          interval={0}
          tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 8.5 } : CHART_STYLE.tick}
          axisLine={{ stroke: CHART_STYLE.line }}
          tickLine={false}
          width={isMobile ? 28 : 46}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {formatted.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={entry.score >= 0 ? '#059669' : '#dc2626'}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
