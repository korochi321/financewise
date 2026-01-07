
export enum TransactionCategory {
  FOOD = 'Ăn uống',
  TRANSPORT = 'Di chuyển',
  SHOPPING = 'Mua sắm',
  BILLS = 'Hóa đơn',
  ENTERTAINMENT = 'Giải trí',
  CLOTHING = 'Quần áo',
  EDUCATION = 'Giáo dục',
  INCOME = 'Thu nhập',
  OTHER = 'Khác'
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: TransactionCategory;
  type: 'income' | 'expense';
}

export interface SpendingStats {
  category: TransactionCategory;
  amount: number;
  color: string;
}
