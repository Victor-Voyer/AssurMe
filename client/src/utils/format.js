import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date) => {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(parsed)) return '—';
  return format(parsed, 'dd MMM yyyy', { locale: fr });
};

export const formatCurrency = (amount) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};
