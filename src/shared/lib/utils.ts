import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatLempiras = (amount: number): string =>
  `L. ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (date: string | Date): string =>
  new Intl.DateTimeFormat('es-HN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));

export const formatRtn = (rtn: string): string => {
  const digits = rtn.replace(/\D/g, '');
  if (digits.length >= 14) return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
  return rtn;
};
