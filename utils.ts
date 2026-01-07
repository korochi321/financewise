
export const formatCurrency = (amount: number): string => {
  const formatted = Math.abs(amount).toLocaleString('vi-VN');
  const sign = amount < 0 ? '-' : amount > 0 ? '+' : '';
  return `${sign}${formatted} ₫`;
};

export const formatNoSignCurrency = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')} ₫`;
};

export const parseDate = (dateStr: string): Date => {
  const now = new Date();
  
  if (dateStr.includes('Hôm nay')) {
    return now;
  }
  
  if (dateStr.includes('Hôm qua')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }

  if (dateStr.includes('Vừa xong')) {
    return now;
  }

  // Xử lý định dạng dd/mm/yyyy, HH:mm hoặc dd/mm/yyyy
  const datePart = dateStr.split(',')[0]; // Lấy dd/mm/yyyy
  const parts = datePart.split('/');
  if (parts.length >= 2) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parts.length === 3 ? parseInt(parts[2]) : now.getFullYear();
    return new Date(year, month, day);
  }

  return now;
};
