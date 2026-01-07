
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header.tsx';
import TimeframeSelector from './components/TimeframeSelector.tsx';
import BalanceCard from './components/BalanceCard.tsx';
import StatsRow from './components/StatsRow.tsx';
import SpendingChart from './components/SpendingChart.tsx';
import TransactionList from './components/TransactionList.tsx';
import BottomNav from './components/BottomNav.tsx';
import AddTransaction from './components/AddTransaction.tsx';
import ExpenseReport from './components/ExpenseReport.tsx';
import BudgetView from './components/BudgetView.tsx';
import AccountView from './components/AccountView.tsx';
import AllTransactions from './components/AllTransactions.tsx';
import FilterSettingsModal from './components/FilterSettingsModal.tsx';
import SecurityView from './components/SecurityView.tsx';
import NotificationView, { NotificationItem } from './components/NotificationView.tsx';
import { Transaction, TransactionCategory } from './types.ts';
import { parseDate, formatNoSignCurrency } from './utils.ts';
import { translations } from './translations.ts';

const STORAGE_KEYS = {
  TRANSACTIONS: 'financewise_transactions',
  BUDGETS: 'financewise_budgets',
  SETTINGS: 'financewise_settings',
  LANG: 'financewise_lang',
  NOTIFS: 'financewise_notifications',
  USER_DATA: 'financewise_user_data'
};

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'add' | 'report' | 'budget' | 'all_transactions' | 'account' | 'security' | 'notifications'>('dashboard');
  const [timeframe, setTimeframe] = useState<'month' | 'prev_month' | 'week'>('month');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [langCode, setLangCode] = useState(() => localStorage.getItem(STORAGE_KEYS.LANG) || 'vi');
  const t = translations[langCode] || translations.vi;

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return saved ? JSON.parse(saved) : { name: "Minh Nguyễn", avatar: "https://picsum.photos/seed/user123/200/200" };
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : { hideBalance: false, sortBy: 'latest', isDarkMode: false };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [budgetLimits, setBudgetLimits] = useState<{ id: string; category: TransactionCategory; limit: number }[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgetLimits));
    checkBudgetAlerts();
  }, [budgetLimits, transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, langCode);
  }, [langCode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const addNotification = useCallback((data: { title: string; description: string; type: 'warning' | 'info' | 'success' | 'danger' }) => {
    const newNotif: NotificationItem = {
      id: Date.now().toString(),
      ...data,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const checkBudgetAlerts = useCallback(() => {
    const now = new Date();
    budgetLimits.forEach(budget => {
      const spent = transactions
        .filter(tx => tx.type === 'expense' && tx.category === budget.category && parseDate(tx.date).getMonth() === now.getMonth())
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const percent = (spent / budget.limit) * 100;
      
      if (percent >= 100) {
        const title = t.notif_budget_exceeded;
        const exists = notifications.some(n => n.title === title && n.description.includes(budget.category) && !n.isRead);
        if (!exists) {
          addNotification({
            title,
            description: t.notif_budget_desc.replace('{percent}', Math.round(percent).toString()).replace('{category}', budget.category),
            type: 'danger'
          });
        }
      } else if (percent >= 90) {
        const title = t.notif_budget_warning;
        const exists = notifications.some(n => n.title === title && n.description.includes(budget.category) && !n.isRead);
        if (!exists) {
          addNotification({
            title,
            description: t.notif_budget_desc.replace('{percent}', Math.round(percent).toString()).replace('{category}', budget.category),
            type: 'warning'
          });
        }
      }
    });
  }, [budgetLimits, transactions, t, notifications, addNotification]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const handleResetData = useCallback(() => {
    setTransactions([]);
    setBudgetLimits([]);
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFS);
  }, []);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let list = transactions.filter(tx => {
      const txDate = parseDate(tx.date);
      if (timeframe === 'month') return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      if (timeframe === 'prev_month') {
        const lastMonth = new Date(); lastMonth.setMonth(now.getMonth() - 1);
        return txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
      }
      if (timeframe === 'week') {
        const startOfWeek = new Date(); const day = now.getDay(); 
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff); startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); endOfWeek.setHours(23, 59, 59, 999);
        return txDate >= startOfWeek && txDate <= endOfWeek;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (settings.sortBy === 'latest') return parseDate(b.date).getTime() - parseDate(a.date).getTime();
      if (settings.sortBy === 'oldest') return parseDate(a.date).getTime() - parseDate(b.date).getTime();
      if (settings.sortBy === 'high') return b.amount - a.amount;
      if (settings.sortBy === 'low') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, timeframe, settings.sortBy]);

  const { balance, income, expense, stats } = useMemo(() => {
    let totalIncome = 0; let totalExpense = 0;
    const categoryStats: Record<string, number> = {};
    filteredTransactions.forEach(tx => {
      if (tx.type === 'income') totalIncome += tx.amount;
      else {
        totalExpense += tx.amount;
        categoryStats[tx.category] = (categoryStats[tx.category] || 0) + tx.amount;
      }
    });
    return {
      income: totalIncome, expense: totalExpense, balance: totalIncome - totalExpense,
      stats: Object.entries(categoryStats).map(([cat, amt]) => ({
        category: cat as TransactionCategory, amount: amt, color: '#197fe6'
      }))
    };
  }, [filteredTransactions]);

  const handleAddTransaction = (newTx: any) => {
    const id = Date.now().toString();
    const amountNum = parseInt(newTx.amount) || 0;
    const tx: Transaction = {
      id, 
      title: newTx.note || newTx.category, 
      amount: amountNum,
      date: newTx.date || t.today, 
      category: newTx.category as TransactionCategory, 
      type: newTx.type,
    };
    
    setTransactions(prev => [tx, ...prev]);

    addNotification({
      title: tx.type === 'income' ? t.notif_new_income : t.notif_new_expense,
      description: t.notif_transaction_desc
        .replace('{amount}', formatNoSignCurrency(tx.amount))
        .replace('{category}', tx.category),
      type: tx.type === 'income' ? 'success' : 'info'
    });

    setView('dashboard');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(current => current.filter(t => t.id !== id));
  };

  const handleClearAllTransactions = () => {
    setTransactions([]);
  };

  const handleUpdateProfile = (name: string, avatar: string) => {
    setUserData({ name, avatar });
  };

  if (view === 'add') return <AddTransaction t={t} onCancel={() => setView('dashboard')} onSave={handleAddTransaction} />;
  
  if (view === 'report') return <ExpenseReport t={t} onBack={() => setView('dashboard')} income={income} expense={expense} transactions={transactions} />;
  
  if (view === 'all_transactions') return (
    <AllTransactions 
      t={t}
      transactions={transactions} 
      onBack={() => setView('dashboard')} 
      onDelete={handleDeleteTransaction}
      onClearAll={handleClearAllTransactions}
    />
  );

  if (view === 'security') return <SecurityView t={t} onBack={() => setView('account')} />;

  if (view === 'notifications') return (
    <NotificationView 
      t={t} 
      notifications={notifications} 
      onBack={() => setView('dashboard')}
      onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
      onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
      onClearAll={() => setNotifications([])}
    />
  );

  const mainNav = <BottomNav t={t} onAddClick={() => setView('add')} onReportClick={() => setView('report')} onDashboardClick={() => setView('dashboard')} onBudgetClick={() => setView('budget')} onAccountClick={() => setView('account')} activeView={view} />;
  const modal = <FilterSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdateSettings={setSettings} onResetData={handleResetData} t={t} />;

  if (view === 'budget') return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
      <BudgetView t={t} transactions={transactions} budgetLimits={budgetLimits} onUpdateBudgets={setBudgetLimits} onSettingsClick={() => setIsSettingsOpen(true)} />
      {mainNav}
      {modal}
    </div>
  );

  if (view === 'account') return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
      <AccountView 
        t={t} 
        onLanguageChange={setLangCode} 
        currentLangCode={langCode} 
        onSettingsClick={() => setIsSettingsOpen(true)} 
        onSecurityClick={() => setView('security')} 
        onUpdateProfile={handleUpdateProfile}
        userName={userData.name}
        userAvatar={userData.avatar}
      />
      {mainNav}
      {modal}
    </div>
  );

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
      <Header 
        t={t} 
        onSettingsClick={() => setIsSettingsOpen(true)} 
        onNotificationClick={() => setView('notifications')} 
        unreadNotificationsCount={unreadCount} 
        userName={userData.name}
        userAvatar={userData.avatar}
      />
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <TimeframeSelector t={t} active={timeframe} onTimeframeChange={setTimeframe} />
        <div className="flex flex-col px-4 py-4 gap-4">
          <BalanceCard t={t} balance={balance} percentageChange={0} hideAmount={settings.hideBalance} />
          <StatsRow t={t} income={income} expense={expense} hideAmount={settings.hideBalance} />
        </div>
        <SpendingChart t={t} totalSpending={expense} stats={stats} />
        <TransactionList 
          t={t}
          transactions={filteredTransactions.slice(0, 5)} 
          onSeeAll={() => setView('all_transactions')} 
        />
      </main>
      {mainNav}
      {modal}
    </div>
  );
};

export default App;
