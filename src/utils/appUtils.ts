import { PILAR_ORDER, BLOCO_ORDER } from '../constants/appConstants';

export const getPilarWeight = (pilar: string) => {
  const idx = PILAR_ORDER.indexOf(pilar);
  return idx === -1 ? 999 : idx;
};

export const getBlocoWeight = (bloco: string) => {
  const idx = BLOCO_ORDER.indexOf(bloco);
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
  if (value >= 70) return { label: 'Certificado', color: 'emerald', bg: 'bg-[#22a06b]', text: 'text-emerald-600 dark:text-emerald-400' };
  if (value >= 50) return { label: 'Qualificado', color: 'amber', bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Não aderente', color: 'red', bg: 'bg-[#e34935]', text: 'text-red-600 dark:text-red-400' };
};
