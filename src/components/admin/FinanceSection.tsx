import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, PieChart, Plus, FileDown } from 'lucide-react';
import { DataTable } from '../DataTable';
import { Expense, MedicalOrder } from '../../types';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { mockExpenses, mockMedicalOrders } from '../../data';
import { AddExpenseModal } from '../modals/AddExpenseModal';

export const FinanceSection: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<MedicalOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const storedExpenses = LocalStorageManager.get(MELENT_KEYS.EXPENSES) || mockExpenses;
    const storedOrders = LocalStorageManager.get(MELENT_KEYS.ORDERS) || mockMedicalOrders;
    setExpenses(storedExpenses);
    setOrders(storedOrders);
  }, []);

  const handleAddOrUpdate = (expense: Expense) => {
    const updated = editingExpense 
      ? expenses.map(e => e.id === expense.id ? expense : e)
      : [expense, ...expenses];
    
    setExpenses(updated);
    LocalStorageManager.save(MELENT_KEYS.EXPENSES, updated);
    setEditingExpense(null);
  };

  const handleDelete = (id: string, description: string) => {
    if (confirm(`هل أنت متأكد من حذف حركة المصاريف: "${description}"؟`)) {
      if (LocalStorageManager.softDelete(MELENT_KEYS.EXPENSES, id, 'EXPENSE', description)) {
        setExpenses(prev => prev.filter(e => e.id !== id));
      }
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(expenses, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "melent_expenses.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const totalRevenue = orders.filter(o => o.status === 'Delivered' || o.status === 'Completed' || o.status === 'Paid').reduce((acc, o) => acc + (o.financials?.total || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const columns = [
    { header: 'الوصف', accessor: (e: Expense) => e.description },
    { header: 'الفئة', accessor: (e: Expense) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{e.category}</span> },
    { header: 'التاريخ', accessor: (e: Expense) => new Date(e.date).toLocaleDateString('ar-EG') },
    { header: 'المبلغ', accessor: (e: Expense) => <span className="font-black text-red-500">-{e.amount.toLocaleString()} {e.currency || '$'}</span> },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-navy p-8 rounded-[3rem] text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
           <ArrowUpRight className="text-brand-cyan mb-4 relative z-10" size={32} />
           <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none mb-1.5 relative z-10">إجمالي الإيرادات المحصلة</p>
           <p className="text-3xl font-black tracking-tighter relative z-10">{totalRevenue.toLocaleString()} $</p>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 relative overflow-hidden group">
           <ArrowDownRight className="text-red-500 mb-4" size={32} />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">إجمالي المصاريف</p>
           <p className="text-3xl font-black text-brand-navy tracking-tighter">{totalExpenses.toLocaleString()} $</p>
        </div>
        <div className="bg-brand-green p-8 rounded-[3rem] text-white relative overflow-hidden group">
           <DollarSign className="text-white/40 mb-4" size={32} />
           <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none mb-1.5">صافي الربح التقديري</p>
           <p className="text-3xl font-black tracking-tighter">{netProfit.toLocaleString()} $</p>
        </div>
      </div>

      <div className="flex items-center justify-between pb-2 border-b border-slate-50">
        <div>
          <h3 className="text-xl font-black text-brand-navy">سجل العمليات المالية</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Transaction Ledger & Expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy transition-all"
          >
            <FileDown size={18} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-navy text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-navy/10 hover:bg-brand-green transition-all flex items-center gap-2"
          >
            <Plus size={16} className="text-brand-cyan" />
            إضافة مصروف جديد
          </button>
        </div>
      </div>

      <DataTable 
        data={expenses} 
        columns={columns} 
        onEdit={(e) => {
          setEditingExpense(e);
          setIsModalOpen(true);
        }}
        onDelete={(e) => handleDelete(e.id, e.description)}
        icon={<Wallet size={24} />} 
      />

      <AddExpenseModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onAdd={handleAddOrUpdate}
        expenseToEdit={editingExpense}
      />
    </div>
  );
};

