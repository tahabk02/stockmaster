export const formatCurrency = (amount: number, currency: string = "MAD") => {
  return `${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${currency}`;
};

export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getStatusColor = (status: string, theme: any) => {
  switch (status.toUpperCase()) {
    case 'PENDING': return theme.colors.warning;
    case 'PROCESSING': return theme.colors.primary;
    case 'SHIPPED': return theme.colors.warning;
    case 'DELIVERED': return theme.colors.accent;
    case 'CANCELLED': return theme.colors.danger;
    default: return theme.colors.textLight;
  }
};
