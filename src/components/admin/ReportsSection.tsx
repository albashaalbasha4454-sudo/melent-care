import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Filter, CircleDollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { MedicalOrder, Expense, Currency } from '../../types';
import { mockMedicalOrders, mockExpenses } from '../../data';

const ChartWrapper: React.FC<{ children: React.ReactNode; height: number | string }> = ({ children, height }) => {
  const [isReady, setIsReady] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ height, width: '100%', minWidth: 0, overflow: 'hidden' }}>
      {isReady && children}
    </div>
  );
};

export const ReportsSection: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'ALL'>('ALL');
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0 });

  // Fixed Exchange Rates for Local Logic (Reference)
  const EXCHANGE_RATES: Record<string, number> = {
    'USD': 1,
    'TRY': 1/32, // 1 TRY = 0.031 USD
    'EUR': 1.08  // 1 EUR = 1.08 USD
  };

  const convertToUSD = (amount: number, fromCurrency: string) => {
    const rate = EXCHANGE_RATES[fromCurrency] || 1;
    return amount * rate;
  };

  useEffect(() => {
    const rawOrders = LocalStorageManager.get(MELENT_KEYS.ORDERS);
    const rawExpenses = LocalStorageManager.get(MELENT_KEYS.EXPENSES);
    
    const orders: MedicalOrder[] = Array.isArray(rawOrders) ? rawOrders : mockMedicalOrders;
    const expenses: Expense[] = Array.isArray(rawExpenses) ? rawExpenses : (mockExpenses as any).map((e: any) => ({ ...e, currency: 'USD' }));

    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const monthlyAggregation = months.map((month, index) => {
      const monthOrders = orders.filter(o => new Date(o.date).getMonth() === index);
      const monthExpenses = expenses.filter(e => new Date(e.date).getMonth() === index);

      let revenue = 0;
      let expenseAmount = 0;

      if (selectedCurrency === 'ALL') {
        // Unified View: Convert everything to USD
        revenue = monthOrders.reduce((sum, o) => sum + convertToUSD(o.financials?.total || 0, o.financials?.currency || 'USD'), 0);
        expenseAmount = monthExpenses.reduce((sum, e) => sum + convertToUSD(e.amount || 0, e.currency || 'USD'), 0);
      } else {
        // Filtered View: Only specific currency
        revenue = monthOrders.filter(o => o.financials?.currency === selectedCurrency).reduce((sum, o) => sum + (o.financials?.total || 0), 0);
        expenseAmount = monthExpenses.filter(e => (e.currency || 'USD') === selectedCurrency).reduce((sum, e) => sum + (e.amount || 0), 0);
      }

      return {
        name: month,
        revenue,
        expenses: expenseAmount,
        profit: revenue - expenseAmount
      };
    });

    // Determine relevant time window
    let lastActiveMonth = 11;
    for (let i = monthlyAggregation.length - 1; i >= 0; i--) {
      if (monthlyAggregation[i].revenue > 0 || monthlyAggregation[i].expenses > 0) {
        lastActiveMonth = i;
        break;
      }
    }
    const finalData = monthlyAggregation.slice(Math.max(0, lastActiveMonth - 5), lastActiveMonth + 1);
    setChartData(finalData);

    // Global Stats Calculation
    let totalRev = 0;
    let totalExp = 0;

    if (selectedCurrency === 'ALL') {
      totalRev = orders.reduce((sum, o) => sum + convertToUSD(o.financials?.total || 0, o.financials?.currency || 'USD'), 0);
      totalExp = expenses.reduce((sum, e) => sum + convertToUSD(e.amount || 0, e.currency || 'USD'), 0);
    } else {
      totalRev = orders.filter(o => o.financials?.currency === selectedCurrency).reduce((sum, o) => sum + (o.financials?.total || 0), 0);
      totalExp = expenses.filter(e => (e.currency || 'USD') === selectedCurrency).reduce((sum, e) => sum + (e.amount || 0), 0);
    }
    
    setStats({
      revenue: totalRev,
      expenses: totalExp,
      profit: totalRev - totalExp
    });

  }, [selectedCurrency]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12 text-right" dir="rtl">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-brand-navy tracking-tighter uppercase">التحليل المالي الاستراتيجي</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">تجميع ذكي للبيانات عبر كافة العملات المسجلة</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button
            onClick={() => setSelectedCurrency('ALL')}
            className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              selectedCurrency === 'ALL' 
              ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' 
              : 'text-slate-400 hover:text-brand-navy'
            }`}
          >
            الموحد (USD)
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          {(['USD', 'TRY', 'EUR'] as Currency[]).map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
                selectedCurrency === curr 
                ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/20' 
                : 'text-slate-400 hover:text-brand-navy'
              }`}
            >
              {curr}
            </button>
          ))}
          <div className="mx-2 p-2 bg-white rounded-lg text-slate-300">
            <Filter size={14} />
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <ArrowUpCircle className="text-green-500 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">إجمالي الإيرادات</p>
          <p className="text-3xl font-black text-brand-navy tracking-tighter">{stats.revenue.toLocaleString()} <span className="text-sm opacity-40">{selectedCurrency === 'ALL' ? 'USD' : selectedCurrency}</span></p>
        </div>
        
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <ArrowDownCircle className="text-red-500 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">إجمالي المصاريف</p>
          <p className="text-3xl font-black text-brand-navy tracking-tighter">{stats.expenses.toLocaleString()} <span className="text-sm opacity-40">{selectedCurrency === 'ALL' ? 'USD' : selectedCurrency}</span></p>
        </div>

        <div className="bg-brand-navy p-8 rounded-[3rem] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <CircleDollarSign className="text-brand-cyan mb-4" size={32} />
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-2">صافي الأرباح</p>
          <p className="text-3xl font-black tracking-tighter">{stats.profit.toLocaleString()} <span className="text-sm opacity-40">{selectedCurrency === 'ALL' ? 'USD' : selectedCurrency}</span></p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-xl font-black text-brand-navy flex items-center gap-3 tracking-tighter">
            <TrendingUp size={24} className="text-brand-green" />
            تحليل الأداء المالي (إيرادات vs مصاريف)
          </h3>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-navy"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الإيرادات</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-cyan"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المصاريف</span>
             </div>
          </div>
        </div>

        <ChartWrapper height={450}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#122A44" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#122A44" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 11, fontWeight: 900, fill: '#94a3b8'}} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#cbd5e1'}}
                tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }}
                itemStyle={{ fontWeight: 900, fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="الإيرادات"
                stroke="#122A44" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorRev)" 
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                name="المصاريف"
                stroke="#00D4FF" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorExp)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Secondary Bar Chart */}
      <div className="bg-slate-50 p-10 rounded-[4rem] border border-slate-100 shadow-inner">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-lg font-black text-brand-navy flex items-center gap-3 tracking-tighter">
             <BarChart3 size={20} className="text-brand-navy" />
             حجم العمليات الشهري
           </h3>
        </div>
        <ChartWrapper height={256}>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
               <Tooltip cursor={{fill: '#f1f5f9'}} />
               <Bar dataKey="revenue" fill="#122A44" radius={[6, 6, 0, 0]} barSize={25} />
               <Bar dataKey="expenses" fill="#00D4FF10" stroke="#00D4FF" radius={[6, 6, 0, 0]} barSize={25} />
             </BarChart>
           </ResponsiveContainer>
        </ChartWrapper>
        <p className="text-center mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">جميع المبالغ المعروضة بالعملة المختارة كتحليل تقديري</p>
      </div>
    </div>
  );
};

