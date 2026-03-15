import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  Legend,
  ComposedChart
} from 'recharts';
import { TrendingUp, Target, Users, MapPin } from 'lucide-react';

interface HistoryData {
  mesAno: string;
  performance: number;
  score: number;
  maxScore: number;
  status: string;
  pillars?: Record<string, number>;
  networkAvg?: number;
}

interface TrendChartProps {
  data: HistoryData[];
}

const PILLAR_COLORS: Record<string, string> = {
  'Pessoas': '#a855f7', // Purple
  'Segurança': '#ef4444', // Red
  'Processos': '#10b981', // Green
  'Financeiro': '#f59e0b', // Amber
  'Qualidade': '#06b6d4', // Cyan
  'Outros': '#64748b'     // Slate
};

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const [showPillars, setShowPillars] = useState(false);
  const [showNetwork, setShowNetwork] = useState(true);
  const [showProjection, setShowProjection] = useState(true);

  // Calcular Projeção (Regressão Linear Simples)
  const chartDataWithProjection = useMemo(() => {
    if (data.length < 2) return data;

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    data.forEach((d, i) => {
      sumX += i;
      sumY += d.performance;
      sumXY += i * d.performance;
      sumX2 += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((d, i) => ({
      ...d,
      projection: Math.round((slope * i + intercept) * 10) / 10
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-gray-300 dark:border-zinc-800">
        <p className="text-gray-500 dark:text-zinc-500 text-sm">Sem dados históricos para exibir ainda.</p>
      </div>
    );
  }

  const allPillars = Array.from(new Set(data.flatMap(d => Object.keys(d.pillars || {}))));

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Controles do Gráfico */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
            <button 
                onClick={() => setShowPillars(!showPillars)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    showPillars 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800' 
                    : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 border border-transparent'
                }`}
            >
                <Users size={14} />
                Ver por Pilares
            </button>
            <button 
                onClick={() => setShowNetwork(!showNetwork)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    showNetwork 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                    : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 border border-transparent'
                }`}
            >
                <MapPin size={14} />
                Média da Rede
            </button>
            <button 
                onClick={() => setShowProjection(!showProjection)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    showProjection 
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800' 
                    : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 border border-transparent'
                }`}
            >
                <TrendingUp size={14} />
                Tendência
            </button>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
            <Target size={14} className="text-red-500" />
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Meta: 90%</span>
        </div>
      </div>
      <div className="h-[350px] w-full bg-white dark:bg-zinc-900/30 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm relative group">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartDataWithProjection}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
            <XAxis 
              dataKey="mesAno" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}
              itemStyle={{ fontSize: '12px', padding: '2px 0' }}
              itemSorter={(item) => {
                const order: Record<string, number> = {
                  'Geral': 1,
                  'Pessoas': 2,
                  'Segurança': 3,
                  'Processos': 4,
                  'Financeiro': 5,
                  'Qualidade': 6,
                  'Média Rede': 100,
                  'Tendência': 101,
                };
                return order[item.name as string] || 50;
              }}
            />
            
            {/* Meta */}
            <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'right', value: 'Meta', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />

            {/* Performance Principal (Geral) - Primeira na lista do Tooltip */}
            <Area
              type="monotone"
              dataKey="performance"
              name="Geral"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPerf)"
              animationDuration={1500}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
            />

            {/* Pilares */}
            {showPillars && allPillars.map(pillar => (
                <Line
                    key={pillar}
                    type="monotone"
                    dataKey={`pillars.${pillar}`}
                    name={pillar}
                    stroke={PILLAR_COLORS[pillar] || '#64748b'}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    animationDuration={1500}
                />
            ))}

            {/* Média da Rede */}
            {showNetwork && (
                <Line 
                    type="monotone" 
                    dataKey="networkAvg" 
                    name="Média Rede" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    strokeDasharray="4 4" 
                    dot={false}
                />
            )}

            {/* Tendência/Projeção */}
            {showProjection && (
                <Line 
                    type="monotone" 
                    dataKey="projection" 
                    name="Tendência" 
                    stroke="#f97316" 
                    strokeWidth={1} 
                    strokeDasharray="2 2" 
                    dot={false}
                    animationDuration={2000}
                />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 justify-center text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-500"></div> Performance Unidade</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-zinc-400 border-t border-dashed"></div> Média Geral Rede</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 border-t border-red-500 border-dashed"></div> Meta Corporativa</div>
      </div>
    </div>
  );
};

export default TrendChart;
