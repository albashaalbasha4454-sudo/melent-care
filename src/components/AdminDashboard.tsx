import React, { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Briefcase, 
  History, 
  FileText, 
  Settings,
  X,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ShoppingCart,
  Truck,
  Filter,
  LogOut,
  Bell,
  Menu,
  CheckCircle2,
  Edit2,
  Printer,
  ChevronLeft,
  Database,
  ShieldCheck,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Logo } from './Logo';
import { AddOrderModal } from './AddOrderModal';
import { InvoiceModal } from './InvoiceModal';
import { AdminDashboardProps, MedicalOrder, Expense, Product } from '../types';
import { mockMedicalOrders, mockExpenses, mockProducts } from '../data';
import { ProductSection } from './admin/ProductSection';
import { UserSection } from './admin/UserSection';
import { SettingsSection } from './SettingsSection';
import { OrderSection } from './admin/OrderSection';
import { InventorySection } from './admin/InventorySection';
import { FinanceSection } from './admin/FinanceSection';
import { ContractSection } from './admin/ContractSection';
import { LogisticsSection } from './admin/LogisticsSection';
import { ReportsSection } from './admin/ReportsSection';
import { SystemManagementSection } from './admin/SystemManagementSection';
import { LocalDB, LocalStorageManager, MELENT_KEYS } from '../services/localStorageManager';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [orders, setOrders] = useState<MedicalOrder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Initialize System
  useEffect(() => {
    LocalDB.initialize();
  }, []);

  // Initialize Data from Local Storage or Mock
  useEffect(() => {
    const storedOrders = LocalStorageManager.get(MELENT_KEYS.ORDERS);
    const storedProducts = LocalStorageManager.get(MELENT_KEYS.PRODUCTS);
    const storedExpenses = LocalStorageManager.get(MELENT_KEYS.EXPENSES);
    
    if (storedOrders && storedOrders.length > 0) {
      setOrders(storedOrders);
    } else {
      setOrders(mockMedicalOrders);
      LocalStorageManager.save(MELENT_KEYS.ORDERS, mockMedicalOrders);
    }

    if (storedProducts && storedProducts.length > 0) {
      setProducts(storedProducts);
    } else {
      setProducts(mockProducts);
      LocalStorageManager.save(MELENT_KEYS.PRODUCTS, mockProducts);
    }

    if (storedExpenses && storedExpenses.length > 0) {
      setExpenses(storedExpenses);
    } else {
      setExpenses(mockExpenses);
      LocalStorageManager.save(MELENT_KEYS.EXPENSES, mockExpenses);
    }
  }, []);

  // Update Storage when state changes
  useEffect(() => {
    if (orders.length > 0) {
      LocalStorageManager.save(MELENT_KEYS.ORDERS, orders);
    }
  }, [orders]);

  useEffect(() => {
    if (expenses.length > 0) {
      LocalStorageManager.save(MELENT_KEYS.EXPENSES, expenses);
    }
  }, [expenses]);

  // Modal States
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<MedicalOrder | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<MedicalOrder | null>(null);

  const chartRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`melent-weekly-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('حدث خطأ أثناء إنشاء التقرير');
    }
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + (o.financials?.total || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const totalOrderValue = orders.reduce((acc, o) => acc + (o.financials?.total || 0), 0);
    const activeContracts = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Delivered').length;

    const margin = totalOrderValue > 0 ? ((totalOrderValue - totalExpenses) / totalOrderValue) * 100 : 0;

    return { totalRevenue, totalExpenses, activeContracts, margin };
  }, [orders, expenses]);

  // Weekly Chart Data
  const weeklyChartData = useMemo(() => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().split('T')[0],
        dayName: days[d.getDay()],
        count: 0
      };
    });

    orders.forEach(order => {
      const orderDate = order.date.split('T')[0];
      const foundDay = last7Days.find(d => d.dateStr === orderDate);
      if (foundDay) {
        foundDay.count += 1;
      }
    });

    return last7Days;
  }, [orders]);

  const handleAddOrder = (order: MedicalOrder) => {
    setOrders(prev => {
      const exists = prev.find(o => o.id === order.id);
      if (exists) return prev.map(o => o.id === order.id ? order : o);
      return [order, ...prev];
    });
    setEditingOrder(null);
    setIsAddOrderOpen(false);
  };

  const openAddOrder = () => {
    setEditingOrder(null);
    setIsAddOrderOpen(true);
  };

  const openEditOrder = (order: MedicalOrder) => {
    setEditingOrder(order);
    setIsAddOrderOpen(true);
  };

  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { id: 'Clients', icon: Users, label: 'العملاء' },
    { id: 'Suppliers', icon: Briefcase, label: 'الموردين' },
    { id: 'Products', icon: Package, label: 'المنتجات' },
    { id: 'Inventory', icon: History, label: 'المخزون' },
    { id: 'Orders', icon: ShoppingCart, label: 'الطلبات' },
    { id: 'Contracts', icon: FileText, label: 'العقود' },
    { id: 'Logistics', icon: Truck, label: 'اللوجستيات' },
    { id: 'Finance', icon: ArrowUpRight, label: 'المالية' },
    { id: 'Reports', icon: CheckCircle2, label: 'التقارير' },
    { id: 'Settings', icon: Settings, label: 'الإعدادات' },
    { id: 'System', icon: Database, label: 'إدارة النظام' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: 280 }} animate={{ x: 0 }} exit={{ x: 280 }}
            className="w-72 bg-white h-screen border-l border-slate-100 flex flex-col relative z-50 shrink-0 shadow-2xl"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-10">
                <Logo className="h-10" />
                <div>
                   <h2 className="text-xl font-black text-brand-navy leading-none tracking-tighter">ميلنت</h2>
                   <p className="text-[10px] font-black text-brand-green uppercase tracking-widest mt-1">لوحة الإدارة</p>
                </div>
              </div>

              <div className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                      activeTab === item.id 
                        ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/10' 
                        : 'text-slate-400 hover:bg-slate-50 hover:text-brand-navy'
                    }`}
                  >
                    <item.icon size={18} className={activeTab === item.id ? 'text-brand-cyan' : ''} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto p-8 pt-0 space-y-4">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-brand-navy uppercase tracking-widest">نمط التخزين</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse"></div>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 italic">محلي (هذا المتصفح فقط)</p>
               </div>
               
               <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
                 <LogOut size={18} />
                 <span>تسجيل الخروج</span>
               </button>
               <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-black">A</div>
                  <div>
                    <p className="text-xs font-black text-brand-navy">المدير العام</p>
                    <p className="text-[10px] font-bold text-slate-400">admin@melent.care</p>
                  </div>
               </div>
               <div className="mt-4 p-4 bg-brand-navy/5 rounded-2xl border border-brand-navy/5">
                   <p className="text-[10px] font-bold text-brand-navy leading-relaxed">
                     إذا تعسر عليك إجراء أي عملية تقنية، يرجى التواصل مع المهندس المطور: <span className="font-black underline decoration-brand-cyan underline-offset-4" dir="ltr">0096340392619</span>
                   </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-navy transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative w-96 hidden lg:block">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن العقود، المشاريع، أو السجلات المالية..." 
                className="w-full bg-slate-50 border-transparent rounded-xl py-2.5 pr-12 pl-4 text-sm font-bold focus:bg-white focus:border-brand-navy/10 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-brand-navy uppercase tracking-widest leading-none">وضع التخزين: محلي</p>
                  <p className="text-[8px] font-bold text-slate-400 mt-1">تشفير متصفح نشط</p>
               </div>
             </div>
             <button onClick={openAddOrder} className="bg-brand-navy border-2 border-brand-navy text-white px-6 py-2.5 rounded-2xl flex items-center gap-3 hover:bg-brand-green hover:border-brand-green transition-all shadow-xl shadow-slate-200">
                <Plus size={18} className="text-brand-cyan" />
                <span className="text-sm font-bold">معاملة جديدة</span>
              </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'Dashboard' ? (
              <>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <p className="text-[10px] font-black uppercase text-brand-green tracking-[0.3em] mb-1">الذكاء الإداري</p>
                    <h2 className="text-3xl font-black text-brand-navy tracking-tighter uppercase">لوحة تحكم العمليات</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {[
                    { label: 'إجمالي الإيرادات', value: stats.totalRevenue.toLocaleString() + ' $', color: 'bg-brand-navy', icon: ArrowUpRight, trend: '+12.5%' },
                    { label: 'إجمالي المصاريف', value: stats.totalExpenses.toLocaleString() + ' $', color: 'bg-brand-green', icon: ArrowDownRight, trend: '-2.4%' },
                    { label: 'العقود النشطة', value: stats.activeContracts, color: 'bg-brand-cyan', icon: FileText, trend: '+4' },
                    { label: 'هامش الربح', value: stats.margin.toFixed(1) + '%', color: 'bg-brand-gold', icon: Briefcase, trend: '+1.2%' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
                       <div className="flex items-start justify-between">
                          <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                            <stat.icon size={26} />
                          </div>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${i === 1 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                            {stat.trend}
                          </span>
                       </div>
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                         <p className="text-2xl font-black text-brand-navy tracking-tighter">{stat.value}</p>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Financial Insights Chart */}
                <div ref={chartRef} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm mb-10 overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-navy flex items-center justify-center text-brand-cyan">
                           <TrendingUp size={24} />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-brand-navy tracking-tighter">حجم الطلبات اليومي</h3>
                           <p className="text-[10px] font-black text-brand-green uppercase tracking-widest mt-0.5">تحليل النشاط الأسبوعي</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400">
                           <Calendar size={14} className="text-brand-navy" />
                           <span>الأسبوع الحالي</span>
                        </div>
                        <button 
                          onClick={handleDownloadPDF}
                          className="flex items-center gap-3 px-4 py-2 bg-brand-navy text-brand-cyan rounded-xl border border-brand-navy/10 text-[10px] font-black hover:bg-brand-green hover:text-white transition-all shadow-lg"
                        >
                          <Printer size={14} />
                          <span>تصدير PDF</span>
                        </button>
                     </div>
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0F172A" />
                            <stop offset="100%" stopColor="#2DD4BF" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                          dataKey="dayName" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
                          dy={10} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#F8FAFC' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-brand-navy p-4 rounded-2xl border border-slate-800 shadow-2xl">
                                  <p className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-1">{payload[0].payload.dayName}</p>
                                  <p className="text-lg font-black text-white">{payload[0].value} طلب مالي</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          radius={[10, 10, 10, 10]} 
                          barSize={40}
                        >
                          {weeklyChartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill="url(#barGradient)" 
                              fillOpacity={entry.count > 0 ? 1 : 0.1}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-xl font-black text-brand-navy flex items-center gap-3 tracking-tighter uppercase">العقود الأخيرة</h3>
                       <button onClick={() => setActiveTab('Contracts')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-navy">عرض جميع الاتفاقيات</button>
                    </div>
                    <div className="space-y-4">
                       {orders.slice(0, 5).map(order => (
                         <div key={order.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200 transition-all cursor-pointer group">
                            <div className="flex flex-col sm:flex-row items-center gap-5">
                              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-navy shrink-0 group-hover:bg-brand-navy group-hover:text-white transition-colors">
                                <Briefcase size={28} />
                              </div>
                              <div className="grow w-full text-center sm:text-left">
                                <h4 className="font-black text-brand-navy text-lg">{order.clientName}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">مسار {order.category}</p>
                              </div>
                              <div className="text-right flex items-center gap-6">
                                <p className="text-xl font-black text-brand-navy tracking-tighter">{(order.financials?.total || 0).toLocaleString()} $</p>
                                <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-navy" onClick={() => openEditOrder(order)}><Edit2 size={16} /></button>
                              </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-brand-navy mb-6 tracking-tighter uppercase">اللوجستيات العالمية</h3>
                    <div className="bg-brand-navy rounded-[3rem] p-8 text-white relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                       <Truck className="mb-6 text-brand-cyan" size={42} />
                       <h4 className="text-2xl font-black mb-3">تتبع الشحن</h4>
                       <p className="text-white/60 text-xs font-bold leading-relaxed mb-6 italic">إدارة آمنة للشحن الدولي والتخليص الجمركي.</p>
                       <button onClick={() => setActiveTab('Logistics')} className="w-full bg-white text-brand-navy py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-green hover:text-white transition-all shadow-xl">لوحة الشحن</button>
                    </div>
                  </div>
                </div>
              </>
            ) : activeTab === 'Products' ? (
              <ProductSection />
            ) : activeTab === 'Clients' || activeTab === 'Suppliers' ? (
              <UserSection type={activeTab} />
            ) : activeTab === 'Orders' ? (
              <OrderSection />
            ) : activeTab === 'Inventory' ? (
              <InventorySection />
            ) : activeTab === 'Finance' ? (
              <FinanceSection />
            ) : activeTab === 'Contracts' ? (
              <ContractSection />
            ) : activeTab === 'Logistics' ? (
              <LogisticsSection />
            ) : activeTab === 'Reports' ? (
              <ReportsSection />
            ) : activeTab === 'System' ? (
              <SystemManagementSection />
            ) : activeTab === 'Settings' ? (
              <SettingsSection />
            ) : (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 min-h-[600px] flex items-center justify-center p-12 text-center text-slate-300">
                <div>
                   <Package size={64} className="mx-auto mb-6 opacity-20" />
                   <h3 className="text-2xl font-black text-brand-navy tracking-tighter">النظام يعمل محلياً</h3>
                   <p className="font-bold text-sm max-w-sm mx-auto mt-2 italic">وحدة {activeTab} مخزنة بأمان داخل متصفحك (Local Storage).</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <AddOrderModal isOpen={isAddOrderOpen} onClose={() => { setIsAddOrderOpen(false); setEditingOrder(null); }} onAdd={handleAddOrder} orderToEdit={editingOrder} />
      <InvoiceModal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} order={selectedInvoice!} />
    </div>
  );
};
