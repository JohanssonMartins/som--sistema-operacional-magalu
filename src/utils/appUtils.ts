import { PILAR_ORDER, BLOCO_ORDER } from '../constants/appConstants';

export const formatBlocoName = (bloco: string | undefined) => {
  if (!bloco) return '';
  return bloco.split(/\s*-\s*Dono/i)[0].trim();
};


export const getPilarWeight = (pilar: string) => {
  const idx = PILAR_ORDER.indexOf(pilar);
  return idx === -1 ? 999 : idx;
};

export const getBlocoWeight = (bloco: string) => {
  const formatted = formatBlocoName(bloco);
  const idx = BLOCO_ORDER.indexOf(formatted);
  return idx === -1 ? 999 : idx;
};

export const getDueDateStatus = (prazo?: string) => {
  if (!prazo) return 'none';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = prazo.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'approaching';
  return 'ok';
};
export const getPerformanceStatus = (value: number) => {
  if (value >= 85) return { label: 'Certificado S.O.M.', color: 'emerald', bg: 'bg-[#22a06b]', text: 'text-emerald-600 dark:text-emerald-400' };
  if (value >= 60) return { label: 'Qualificado', color: 'amber', bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Não aderente', color: 'red', bg: 'bg-[#e34935]', text: 'text-red-600 dark:text-red-400' };
};

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const MONTH_ORDER: Record<string, number> = {
  'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3, 'Maio': 4, 'Junho': 5,
  'Julho': 6, 'Agosto': 7, 'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
};

export const parseMesAno = (mesAno: string) => {
  if (!mesAno) return { mes: '', ano: new Date().getFullYear(), mesIndex: -1 };
  const parts = mesAno.split('-');
  const mes = parts[0] || '';
  const ano = parseInt(parts[1], 10) || new Date().getFullYear();
  const mesIndex = MONTH_ORDER[mes] !== undefined ? MONTH_ORDER[mes] : -1;
  return { mes, ano, mesIndex };
};

export const sortMesesCronologico = (meses: string[]) => {
  return [...meses].sort((a, b) => {
    const tA = parseMesAno(a);
    const tB = parseMesAno(b);
    if (tA.ano !== tB.ano) return tA.ano - tB.ano;
    return tA.mesIndex - tB.mesIndex;
  });
};
