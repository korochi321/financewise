
import { TransactionCategory } from './types';

export const CATEGORY_CONFIG: Record<TransactionCategory, { icon: string; bgColor: string; iconColor: string; barColor: string }> = {
  [TransactionCategory.FOOD]: {
    icon: 'restaurant',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    barColor: '#197fe6'
  },
  [TransactionCategory.TRANSPORT]: {
    icon: 'directions_car',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    barColor: '#197fe6' 
  },
  [TransactionCategory.SHOPPING]: {
    icon: 'shopping_bag',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    barColor: '#197fe6'
  },
  [TransactionCategory.BILLS]: {
    icon: 'receipt_long',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    barColor: '#197fe6'
  },
  [TransactionCategory.ENTERTAINMENT]: {
    icon: 'tv',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    barColor: '#197fe6'
  },
  [TransactionCategory.CLOTHING]: {
    icon: 'checkroom',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    barColor: '#197fe6'
  },
  [TransactionCategory.EDUCATION]: {
    icon: 'school',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
    barColor: '#197fe6'
  },
  [TransactionCategory.INCOME]: {
    icon: 'account_balance_wallet',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    barColor: '#10b981'
  },
  [TransactionCategory.OTHER]: {
    icon: 'category',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
    barColor: '#94a3b8'
  }
};
