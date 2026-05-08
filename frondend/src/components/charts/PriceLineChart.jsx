import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
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
      <div style={{ color: '#7c3aed', fontWeight: 700 }}>
        ${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
};

export default function PriceLineChart({ data, type = 'area', height = 300 }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const formatted = data.map((d) => ({
    ...d,
    price: parseFloat(d.price),
    time: format(new Date(d.timestamp), 'HH:mm'),
  }));

  const margin = {
    top: 5,
    right: isMobile ? 2 : 10,
    left: isMobile ? -24 : 10,
    bottom: 5
  };

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formatted} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis
            dataKey="time"
            tick={CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={{ stroke: CHART_STYLE.line }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 9 } : CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={{ stroke: CHART_STYLE.line }}
            tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
            width={isMobile ? 55 : 80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={formatted} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis
            dataKey="time"
            tick={CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={{ stroke: CHART_STYLE.line }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 9 } : CHART_STYLE.tick}
            axisLine={{ stroke: CHART_STYLE.line }}
            tickLine={{ stroke: CHART_STYLE.line }}
            tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
            width={isMobile ? 55 : 80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="price" fill="rgba(124,58,237,0.75)" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Default: Area Layout
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={margin}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
        <XAxis
          dataKey="time"
          tick={CHART_STYLE.tick}
          axisLine={{ stroke: CHART_STYLE.line }}
          tickLine={{ stroke: CHART_STYLE.line }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={['auto', 'auto']}
          tick={isMobile ? { ...CHART_STYLE.tick, fontSize: 9 } : CHART_STYLE.tick}
          axisLine={{ stroke: CHART_STYLE.line }}
          tickLine={{ stroke: CHART_STYLE.line }}
          tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
          width={isMobile ? 55 : 80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#7c3aed"
          strokeWidth={2}
          fill="url(#priceGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#7c3aed', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
