import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { format } from 'date-fns';

const CHART_STYLE = {
  tick: { fill: '#94a3b8', fontSize: 11, fontFamily: 'Inter' },
  line: '#e2e8f0',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = Number(payload[0].value);
  const formatted = v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : v.toLocaleString();
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
      <div style={{ color: '#94a3b8', marginBottom: 4, fontFamily: 'inherit', fontSize: 11 }}>{label}</div>
      <div style={{ color: '#7c3aed', fontWeight: 700 }}>Vol: {formatted}</div>
    </div>
  );
};

export default function VolumeBarChart({ data, type = 'bar', height = 180 }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const formatted = data.map((d) => ({
    ...d,
    volume: parseFloat(d.volume_24h),
    time: format(new Date(d.timestamp), 'HH:mm'),
  }));

  const margin = {
    top: 5,
    right: isMobile ? 2 : 10,
    left: isMobile ? -24 : 10,
    bottom: 5
  };

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={formatted} margin={margin}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="rgba(124,58,237,0.4)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="rgba(124,58,237,0)"   stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
          <XAxis
            dataKey="time"
            tick={CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={{ stroke: CHART_STYLE.line }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 9 } : CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={{ stroke: CHART_STYLE.line }}
            tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v}
            width={isMobile ? 38 : 60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="rgba(124,58,237,0.7)"
            strokeWidth={2}
            fill="url(#volumeGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#7c3aed', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formatted} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
          <XAxis
            dataKey="time"
            tick={CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={{ stroke: CHART_STYLE.line }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 9 } : CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={{ stroke: CHART_STYLE.line }}
            tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v}
            width={isMobile ? 38 : 60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="volume"
            stroke="rgba(124,58,237,0.8)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#7c3aed', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Default: Bar Chart
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={formatted} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
        <XAxis
          dataKey="time"
          tick={CHART_STYLE.tick}
          axisLine={{ stroke: CHART_STYLE.line }}
          tickLine={{ stroke: CHART_STYLE.line }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 9 } : CHART_STYLE.tick}
          axisLine={{ stroke: CHART_STYLE.line }}
          tickLine={{ stroke: CHART_STYLE.line }}
          tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v}
          width={isMobile ? 38 : 60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="volume" fill="rgba(124,58,237,0.40)" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
