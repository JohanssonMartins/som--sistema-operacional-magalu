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
