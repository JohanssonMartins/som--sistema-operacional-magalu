import React, { useState, useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList
} from 'recharts';
import { Target, TrendingUp, TrendingDown, Minus, Layers, Award, Calendar } from 'lucide-react';
import { parseMesAno } from '../utils/appUtils';

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

const getBarColor = (value: number) => {
  if (value >= 85) return '#22a06b'; // Certificado S.O.M. (Verde)
  if (value >= 60) return '#f59e0b'; // Qualificado (Amarelo)
  return '#e34935';                  // Não Aderente (Vermelho)
};

const getStatusBadge = (value: number) => {
  if (value >= 85) return { label: 'Certificado S.O.M.', bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
  if (value >= 60) return { label: 'Qualificado', bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
  return { label: 'Não aderente', bg: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' };
};

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const [targetScore, setTargetScore] = useState<number>(85);
  const [selectedPilar, setSelectedPilar] = useState<string>('Geral');

  // Anos disponíveis nos dados do histórico
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    data.forEach(d => {
      const { ano } = parseMesAno(d.mesAno);
      if (ano) years.add(String(ano));
    });
    if (years.size === 0) years.add(String(new Date().getFullYear()));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [data]);

  const [selectedYear, setSelectedYear] = useState<string>('Todos');

  // Dados filtrados pelo ano selecionado
  const filteredData = useMemo(() => {
    if (selectedYear === 'Todos') return data;
    return data.filter(d => String(parseMesAno(d.mesAno).ano) === selectedYear);
  }, [data, selectedYear]);

  // Extrair apenas os pilares oficiais do SOM na ordem correta
  const availablePillars = useMemo(() => {
    const presentPillars = new Set<string>();
    filteredData.forEach(d => {
      if (d.pillars) {
        Object.keys(d.pillars).forEach(p => {
          if (p !== 'Outros') presentPillars.add(p);
        });
      }
    });

    const officialOrder = ['Pessoas', 'Segurança', 'Sustentabilidade', 'Cliente', 'Gestão', 'Armazém'];
    return officialOrder.filter(p => presentPillars.has(p));
  }, [filteredData]);

  // Preparar os dados calculando a variação mês a mês
  const processedData = useMemo(() => {
    return filteredData.map((d, index) => {
      const currentValue = selectedPilar === 'Geral' 
        ? d.performance 
        : (d.pillars?.[selectedPilar] ?? 0);

      const prevValue = index > 0
        ? (selectedPilar === 'Geral' 
            ? filteredData[index - 1].performance 
            : (filteredData[index - 1].pillars?.[selectedPilar] ?? 0))
        : null;

      const diff = prevValue !== null ? Math.round((currentValue - prevValue) * 10) / 10 : null;

      return {
        ...d,
        displayValue: currentValue,
        diff,
        color: getBarColor(currentValue)
      };
    });
  }, [filteredData, selectedPilar]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-gray-300 dark:border-zinc-800">
        <p className="text-gray-500 dark:text-zinc-500 text-sm">Sem dados históricos para exibir ainda.</p>
      </div>
    );
  }

  // Estatísticas de evolução geral
  const firstItem = processedData[0];
  const lastItem = processedData[processedData.length - 1];
  const totalEvolucao = processedData.length > 1
    ? Math.round((lastItem.displayValue - firstItem.displayValue) * 10) / 10
    : 0;

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Controles e Filtros do Gráfico */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-gray-200/80 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro de Ano */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold mr-1 shadow-sm">
              <Calendar size={13} className="text-blue-500" />
              <span className="text-gray-500 dark:text-zinc-400 font-normal">Ano:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent font-bold text-gray-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos os Anos</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-zinc-300 mr-1">
            <Layers size={14} className="text-blue-500" />
            <span>Visualização:</span>
          </div>

          <button
            onClick={() => setSelectedPilar('Geral')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedPilar === 'Geral'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
            }`}
          >
            Geral CD
          </button>

          {availablePillars.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPilar(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedPilar === p
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Ajuste de Meta e Evolução */}
        <div className="flex items-center gap-3">
          {processedData.length > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold">
              <span className="text-gray-500 dark:text-zinc-400 font-normal">Evolução do Período:</span>
              <span className={totalEvolucao > 0 ? 'text-emerald-600 flex items-center' : totalEvolucao < 0 ? 'text-red-500 flex items-center' : 'text-gray-500'}>
                {totalEvolucao > 0 && <TrendingUp size={13} className="mr-0.5" />}
                {totalEvolucao < 0 && <TrendingDown size={13} className="mr-0.5" />}
                {totalEvolucao > 0 ? `+${totalEvolucao}%` : `${totalEvolucao}%`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs">
            <Target size={14} className="text-emerald-500" />
            <span className="text-gray-600 dark:text-zinc-400 font-medium">Meta:</span>
            <select
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="bg-transparent font-bold text-gray-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value={85}>85% (Certificação S.O.M.)</option>
              <option value={70}>70%</option>
              <option value={80}>80%</option>
              <option value={90}>90% (Excelente)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Área do Gráfico de Barras */}
      <div className="h-[340px] w-full bg-white dark:bg-zinc-900/30 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm relative">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={processedData}
            margin={{ top: 25, right: 20, left: -10, bottom: 5 }}
            barCategoryGap="20%"
          >
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
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                const badge = getStatusBadge(d.displayValue);

                return (
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-xl text-xs space-y-2 min-w-[170px]">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                      <span className="font-bold text-gray-900 dark:text-zinc-100">{d.mesAno}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-zinc-400">Aderência:</span>
                        <span className="font-black text-gray-900 dark:text-zinc-100 text-sm">
                          {d.displayValue.toFixed(1).replace('.', ',')}%
                        </span>
                      </div>

                      {d.diff !== null && (
                        <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-zinc-800/80">
                          <span className="text-gray-500 dark:text-zinc-400">vs Mês Anterior:</span>
                          <span className={`font-bold flex items-center ${d.diff > 0 ? 'text-emerald-600' : d.diff < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                            {d.diff > 0 && <TrendingUp size={12} className="mr-0.5" />}
                            {d.diff < 0 && <TrendingDown size={12} className="mr-0.5" />}
                            {d.diff === 0 && <Minus size={12} className="mr-0.5" />}
                            {d.diff > 0 ? `+${d.diff}%` : `${d.diff}%`}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between pt-0.5">
                        <span className="text-gray-500 dark:text-zinc-400">Meta:</span>
                        <span className={`font-bold ${d.displayValue >= targetScore ? 'text-emerald-600' : 'text-red-500'}`}>
                          {d.displayValue >= targetScore ? 'Atingida ✓' : `${Math.round((d.displayValue - targetScore) * 10) / 10}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* Linha de Meta Corporativa */}
            <ReferenceLine 
              y={targetScore} 
              stroke="#22a06b" 
              strokeWidth={2}
              strokeDasharray="4 4" 
              label={{ 
                position: 'top', 
                value: `Meta: ${targetScore}%`, 
                fill: '#22a06b', 
                fontSize: 11, 
                fontWeight: 'bold' 
              }} 
            />

            {/* Barras de Desempenho */}
            <Bar 
              dataKey="displayValue" 
              radius={[6, 6, 0, 0]}
              animationDuration={1200}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList 
                dataKey="displayValue" 
                position="top" 
                formatter={(val: number) => `${Math.round(val)}%`} 
                style={{ fontSize: '11px', fontWeight: 'bold', fill: '#64748b' }} 
              />
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* Legendas e Comparativo Mês a Mês */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center gap-4 text-zinc-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#22a06b]"></div> ≥ 85% Certificado S.O.M.
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500"></div> 60% - 84% Qualificado
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#e34935]"></div> Abaixo de 60% Não Aderente
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t-2 border-emerald-500 border-dashed"></div> Meta ({targetScore}%)
          </div>
        </div>

        {/* Resumo rápido do último mês */}
        {lastItem && (
          <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-zinc-300">
            <span>Último mês ({lastItem.mesAno}):</span>
            <span className="font-extrabold text-blue-600 dark:text-blue-400">
              {lastItem.displayValue.toFixed(1).replace('.', ',')}%
            </span>
            {lastItem.diff !== null && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${
                lastItem.diff >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-red-50 text-red-500 dark:bg-red-950/40'
              }`}>
                {lastItem.diff >= 0 ? `+${lastItem.diff}%` : `${lastItem.diff}%`} vs mês anterior
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendChart;
