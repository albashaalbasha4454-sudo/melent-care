import { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { Logo } from './components/Logo';
import { InvoiceModal } from './components/InvoiceModal';
import { 
  LayoutDashboard, 
  Hospital, 
  Package, 
  FileText, 
  Wallet, 
  BarChart3, 
  Menu, 
  X, 
  Plus, 
  Search,
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  Stethoscope,
  Globe,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Infinity as InfinityIcon,
  Truck,
  ChevronLeft,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { View, Client, MedicalProduct, MedicalOrder, Expense, Revenue } from './types';
import { mockClients, mockProducts, mockMedicalOrders, mockExpenses, mockRevenue, mockMonthlyData } from './data';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State with LocalStorage Persistence
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('melent_clients');
      return saved ? JSON.parse(saved) : mockClients;
    } catch (e) {
      return mockClients;
    }
  });

  const [orders, setOrders] = useState<MedicalOrder[]>(() => {
    try {
      const saved = localStorage.getItem('melent_orders');
      return saved ? JSON.parse(saved) : mockMedicalOrders;
    } catch (e) {
      return mockMedicalOrders;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('melent_expenses');
      return saved ? JSON.parse(saved) : mockExpenses;
    } catch (e) {
      return mockExpenses;
    }
  });

  // Invoice State
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<MedicalOrder | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem('melent_clients', JSON.stringify(clients));
    } catch (e) {
      console.error('Storage limit reached', e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('melent_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Storage limit reached', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('melent_expenses', JSON.stringify(expenses));
    } catch (e) {
      console.error('Storage limit reached', e);
    }
  }, [expenses]);

  // Professional Data Management: Export/Import
  const exportAllData = () => {
    const data = {
      clients,
      orders,
      expenses,
      exportedAt: new Date().toISOString(),
      app: 'Melent Care'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melent_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAllData = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.app === 'Melent Care') {
          if (json.clients) setClients(json.clients);
          if (json.orders) setOrders(json.orders);
          if (json.expenses) setExpenses(json.expenses);
          alert('تم استيراد البيانات بنجاح');
        } else {
          alert('ملف غير صالح');
        }
      } catch (err) {
        alert('خطأ في قراءة الملف');
      }
    };
    reader.readAsText(file);
  };

  const stats = useMemo(() => {
    const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + o.total, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalOrderValue = orders.reduce((acc, o) => acc + o.total, 0);
    const activeContracts = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Delivered').length;

    const margin = totalOrderValue > 0 ? ((totalOrderValue - totalExpenses) / totalOrderValue) * 100 : 0;

    return { totalRevenue, totalExpenses, totalOrderValue, activeContracts, margin };
  }, [orders, expenses]);

  const openInvoice = (order: MedicalOrder) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceOpen(true);
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        if (window.innerWidth < 1024) setIsMobileSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
        currentView === view 
          ? 'bg-brand-navy/5 text-brand-navy font-bold' 
          : 'text-slate-500 hover:text-brand-navy hover:bg-slate-50'
      }`}
    >
      {currentView === view && (
        <motion.div 
          layoutId="nav-active"
          className="absolute left-0 w-1.5 h-6 bg-brand-green rounded-full shadow-[0_0_10px_rgba(0,208,132,0.4)]"
        />
      )}
      <Icon size={20} className={currentView === view ? 'text-brand-green' : 'group-hover:scale-110 transition-transform'} />
      <span className={`text-sm tracking-tight ${!isSidebarOpen && 'lg:hidden'}`}>{label}</span>
    </button>
  );

  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ 
    clientName: '', 
    clientPhone: '', 
    clientAddress: '', 
    total: 0, 
    status: 'Pending', 
    type: 'International',
    deliveryMethod: 'Shipping',
    isTurkeyBased: false,
    paymentMethod: 'BankTransfer'
  });

  const handleAddOrder = () => {
    if (!newOrder.clientName || !newOrder.clientPhone) return;
    const order: MedicalOrder = {
      id: `ML-${Math.floor(Math.random() * 10000)}`,
      clientId: `CLI-${Math.floor(Math.random() * 1000)}`,
      clientName: newOrder.clientName,
      clientPhone: newOrder.clientPhone,
      clientAddress: newOrder.clientAddress,
      items: [],
      total: Number(newOrder.total),
      status: newOrder.status as any,
      date: new Date().toISOString(),
      type: newOrder.type as any,
      deliveryMethod: newOrder.deliveryMethod as any,
      isTurkeyBased: newOrder.isTurkeyBased,
      paymentMethod: newOrder.paymentMethod as any
    };
    setOrders([order, ...orders]);
    setIsAddOrderOpen(false);
    setNewOrder({ 
      clientName: '', 
      clientPhone: '', 
      clientAddress: '', 
      total: 0, 
      status: 'Pending', 
      type: 'International',
      deliveryMethod: 'Shipping',
      isTurkeyBased: false,
      paymentMethod: 'BankTransfer'
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex" dir="rtl">
      {/* Modal for Adding Order */}
      <AnimatePresence>
        {isAddOrderOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddOrderOpen(false)} className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
               <div className="p-8 lg:p-12 overflow-y-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-brand-navy">إنشاء عقد توريد جديد</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Detailed Purchase Agreement</p>
                    </div>
                    <button onClick={() => setIsAddOrderOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-300 hover:text-brand-navy"><X /></button>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Customer Section */}
                    <div className="space-y-5">
                      <h4 className="text-[10px] font-black uppercase text-brand-green tracking-[0.3em] border-b border-slate-100 pb-2">بيانات العميل (Customer Details)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">الاسم الثلاثي الكامل</label>
                          <input type="text" value={newOrder.clientName} onChange={e => setNewOrder({...newOrder, clientName: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-green/20 transition-all font-bold text-sm" placeholder="الاسم كما في الهوية" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">رقم الهاتف الجوال</label>
                          <input type="tel" dir="ltr" value={newOrder.clientPhone} onChange={e => setNewOrder({...newOrder, clientPhone: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-green/20 transition-all font-bold text-sm text-right" placeholder="+966 5x xxx xxxx" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">عنوان السكن / المقر</label>
                        <input type="text" value={newOrder.clientAddress} onChange={e => setNewOrder({...newOrder, clientAddress: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-green/20 transition-all font-bold text-sm" placeholder="المدينة، الحي، الشارع، رقم المبنى" />
                      </div>
                    </div>

                    {/* Logistics Section */}
                    <div className="space-y-5">
                      <h4 className="text-[10px] font-black uppercase text-brand-cyan tracking-[0.3em] border-b border-slate-100 pb-2">المعلومات اللوجستية (Logistics)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">نوع الشحن</label>
                          <select value={newOrder.deliveryMethod} onChange={e => setNewOrder({...newOrder, deliveryMethod: e.target.value as any})} className="w-full bg-slate-50 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-cyan/20 transition-all font-bold text-sm">
                            <option value="Shipping">شحن دولي (Air/Sea Freight)</option>
                            <option value="LocalDelivery">توصيل محلي (Express)</option>
                            <option value="Pickup">استلام من المستودع (Warehouse Pickup)</option>
                          </select>
                        </div>
                        <div className="flex flex-col justify-end">
                           <button 
                            onClick={() => setNewOrder({...newOrder, isTurkeyBased: !newOrder.isTurkeyBased})}
                            className={`flex items-center justify-between w-full p-4 rounded-2xl border-2 transition-all ${newOrder.isTurkeyBased ? 'bg-brand-gold/10 border-brand-gold text-brand-gold' : 'bg-slate-50 border-transparent text-slate-400'}`}
                           >
                             <span className="text-xs font-black uppercase tracking-widest">الطلب داخل تركيا؟</span>
                             <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${newOrder.isTurkeyBased ? 'border-brand-gold bg-brand-gold text-white' : 'border-slate-200'}`}>
                               {newOrder.isTurkeyBased && <CheckCircle2 size={12} />}
                             </div>
                           </button>
                        </div>
                      </div>
                    </div>

                    {/* Financial Section */}
                    <div className="space-y-5">
                      <h4 className="text-[10px] font-black uppercase text-brand-gold tracking-[0.3em] border-b border-slate-100 pb-2">المعلومات المالية (Finances)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">طريقة الدفع</label>
                          <select value={newOrder.paymentMethod} onChange={e => setNewOrder({...newOrder, paymentMethod: e.target.value as any})} className="w-full bg-slate-50 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-gold/20 transition-all font-bold text-sm">
                            <option value="BankTransfer">تحويل بنكي (Bank Transfer)</option>
                            <option value="WesternUnion">وستيرن يونيون (Western Union)</option>
                            <option value="Cash">دفع نقدي (Cash)</option>
                            <option value="Crypto">عملات رقمية (USDT/BTC)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">قيمة العقد الإجمالية ($)</label>
                          <input type="number" value={newOrder.total} onChange={e => setNewOrder({...newOrder, total: Number(e.target.value)})} className="w-full bg-slate-50 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-gold/20 transition-all font-black text-xl" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pt-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">التصنيف والحالة</label>
                        <div className="flex gap-4">
                           <select value={newOrder.type} onChange={e => setNewOrder({...newOrder, type: e.target.value as any})} className="flex-1 bg-slate-50 border-transparent rounded-2xl p-4 focus:bg-white transition-all font-bold text-xs uppercase tracking-widest">
                             <option value="International">GLOBAL ROUTE</option>
                             <option value="Local">LOCAL ROUTE</option>
                           </select>
                           <select value={newOrder.status} onChange={e => setNewOrder({...newOrder, status: e.target.value as any})} className="flex-1 bg-slate-50 border-transparent rounded-2xl p-4 focus:bg-white transition-all font-bold text-xs uppercase tracking-widest text-brand-green">
                             <option value="Pending">PENDING</option>
                             <option value="Sourced">SOURCED</option>
                             <option value="Shipping">SHIPPING</option>
                             <option value="Delivered">DELIVERED</option>
                           </select>
                        </div>
                      </div>
                    </div>

                    <button onClick={handleAddOrder} className="w-full bg-brand-navy text-white py-6 rounded-[2.5rem] font-black text-xs lg:text-sm uppercase tracking-[0.2em] mt-4 hover:bg-brand-green transition-all shadow-2xl shadow-brand-navy/10 flex items-center justify-center gap-3">
                      <CheckCircle2 size={20} className="text-brand-cyan" />
                      إتمام إنشاء العقد وتوثيق البيانات
                    </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 right-0 z-[70] bg-white border-l border-slate-100 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl shadow-slate-200/20 ${
          isMobileSidebarOpen ? 'w-72 translate-x-0' : 'w-72 lg:w-72 translate-x-full lg:translate-x-0'
        } ${!isSidebarOpen && 'lg:w-24'}`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-4 mb-12 px-2">
            <Logo className="w-14 h-14" />
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
                <h1 className="text-xl font-black text-brand-navy leading-none tracking-tight">Melent Care</h1>
                <span className="text-[9px] text-brand-green font-black tracking-[0.2em] mt-1.5 uppercase opacity-80">Global Medical Hub</span>
              </motion.div>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem view="dashboard" icon={LayoutDashboard} label="لوحة التحكم" />
            <NavItem view="clients" icon={Hospital} label="الشركاء والعملاء" />
            <NavItem view="inventory" icon={Package} label="كتالوج المنتجات" />
            <NavItem view="orders" icon={Briefcase} label="عقود التوريد" />
            <NavItem view="expenses" icon={Wallet} label="المصاريف الإدارية" />
            <NavItem view="reports" icon={BarChart3} label="تقارير الأداء" />
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <div className={`p-4 rounded-3xl bg-brand-navy/5 mb-6 flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
               <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold">M</div>
               {isSidebarOpen && (
                 <div>
                    <p className="text-xs font-bold text-brand-navy">ميلينت الإداري</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Admin Portal</p>
                 </div>
               )}
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={exportAllData}
                className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-brand-green hover:bg-brand-green/5 rounded-2xl transition-all group"
              >
                <TrendingUp size={20} className="group-hover:scale-110" />
                <span className={`text-sm font-bold ${!isSidebarOpen && 'lg:hidden'}`}>تصدير البيانات (JSON)</span>
              </button>
              
              <label className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-brand-green hover:bg-brand-green/5 rounded-2xl transition-all group cursor-pointer">
                <Settings size={20} className="group-hover:rotate-45 transition-transform" />
                <span className={`text-sm font-bold ${!isSidebarOpen && 'lg:hidden'}`}>استيراد البيانات</span>
                <input type="file" onChange={importAllData} className="hidden" accept=".json" />
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'lg:mr-72' : 'lg:mr-24'} w-full`}>
        <header className="glass-header px-6 lg:px-10 py-5 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-slate-50">
          <div className="flex items-center gap-4 lg:gap-6">
            <button onClick={toggleSidebar} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl text-brand-cyan">
              <Menu size={22} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xl font-black text-brand-navy tracking-tight">
                {currentView === 'dashboard' && 'الرؤية الشاملة'}
                {currentView === 'clients' && 'إدارة الشركاء'}
                {currentView === 'inventory' && 'المخزون الطبي'}
                {currentView === 'orders' && 'عقود ميلينت'}
                {currentView === 'expenses' && 'التدفقات الخارجة'}
                {currentView === 'reports' && 'المحلل المالي'}
              </h2>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Management Command Layer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden lg:block">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-cyan transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="بحث سريع..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-100/50 border-transparent rounded-2xl pr-12 pl-6 py-2.5 focus:bg-white focus:border-blue-100 focus:ring-0 w-80 text-sm transition-all"
              />
            </div>

            <button onClick={() => setIsAddOrderOpen(true)} className="bg-brand-navy border-2 border-brand-navy text-white px-6 py-2.5 rounded-2xl flex items-center gap-3 hover:bg-brand-green hover:border-brand-green transition-all shadow-xl shadow-slate-200">
              <Plus size={18} className="text-brand-cyan" />
              <span className="text-sm font-bold">معاملة جديدة</span>
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-10 max-w-[1700px] mx-auto overflow-hidden">
          <AnimatePresence>
            <motion.div key={currentView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              
           {currentView === 'dashboard' && (
                <div className="space-y-12">
                  <div className="bg-brand-navy/5 border border-brand-navy/10 rounded-[2rem] p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    <div className="relative z-10 flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-brand-navy flex items-center justify-center text-white"><LayoutDashboard size={16} /></div>
                        <h3 className="text-xl font-black text-brand-navy">نظام إدارة ميلينت كير</h3>
                      </div>
                      <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">
                        أهلاً بك في منصة التحكم المركزية. تتبع هنا العقود، الموردين، والمخزون الطبي الخاص بشركتك بكل سهولة وأمان عبر تخزين البيانات المحلي.
                      </p>
                    </div>
                    <div className="flex gap-4 relative z-10">
                       <button onClick={exportAllData} className="px-6 py-3 bg-white border border-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-brand-navy shadow-sm hover:shadow-md transition-all">تصدير نسخة احتياطية</button>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-navy/5 rounded-full blur-[100px]"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard title="إجمالي العقود النشطة" value={`${stats.totalOrderValue.toLocaleString()} $`} trend="+12.5%" isUp={true} icon={Briefcase} color="blue" />
                    <StatCard title="مصاريف التوريد" value={`${stats.totalExpenses.toLocaleString()} $`} trend="+4.2%" isUp={false} icon={Truck} color="red" />
                    <StatCard title="صافي الأرباح (تقديري)" value={`${(stats.totalOrderValue - stats.totalExpenses).toLocaleString()} $`} trend="+18.4%" isUp={true} icon={TrendingUp} color="teal" />
                    <StatCard title="العقود قيد التنفيذ" value={stats.activeContracts.toString()} trend="ثابت" isUp={true} icon={FileText} color="gold" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 medical-card p-6 lg:p-10">
                      <div className="flex items-center justify-between mb-8 lg:mb-10">
                        <div>
                           <h3 className="text-lg lg:text-xl font-black text-brand-navy">سجل العقود العالمية</h3>
                           <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Latest Operational Flow</p>
                        </div>
                        <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-300"><Settings size={18}/></button>
                      </div>
                      <div className="space-y-4 lg:space-y-5">
                        {orders.slice(0, 4).map(order => (
                          <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 lg:p-6 bg-brand-navy/[0.02] rounded-[1.5rem] lg:rounded-[2rem] border-2 border-transparent hover:border-brand-green/20 hover:bg-white transition-all cursor-pointer group gap-4">
                            <div className="flex items-center gap-4 lg:gap-6">
                              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white shadow-sm rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Globe size={24} className="text-brand-cyan lg:hidden" />
                                <Globe size={28} className="text-brand-cyan hidden lg:block" />
                              </div>
                              <div>
                                <h4 className="font-black text-brand-navy text-base lg:text-lg">{order.clientName}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 lg:mt-1.5">{order.type} SUPPLY ROUTE</p>
                              </div>
                            </div>
                            <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                              <p className="text-lg lg:text-xl font-black text-brand-navy tracking-tight">{order.total.toLocaleString()} $</p>
                              <div className="flex items-center gap-2 justify-end mt-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                  order.status === 'Delivered' ? 'border-brand-green/20 text-brand-green bg-brand-green/5' : 'border-brand-cyan/20 text-brand-cyan bg-brand-cyan/5'
                                }`}>{order.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-4 medical-card p-6 lg:p-10 flex flex-col items-center">
                        <h3 className="text-lg font-black text-brand-navy mb-8 lg:mb-10 w-full">توزيع المبيعات</h3>
                        <div className="relative w-40 h-40 lg:w-56 lg:h-56 rounded-full border-[15px] lg:border-[20px] border-slate-50 border-t-brand-navy border-l-brand-gold flex items-center justify-center mb-10 lg:mb-12 shadow-inner">
                           <div className="text-center">
                             <p className="text-3xl lg:text-5xl font-black text-brand-navy">45</p>
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 lg:mt-2">Active Portals</p>
                           </div>
                           <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-2 border-dashed border-brand-green/20 scale-125 opacity-30"></motion.div>
                        </div>
                        <div className="w-full space-y-4 lg:space-y-5">
                          <LegendItem color="bg-brand-navy" label="معدات طبية ثقيلة" value="65%" />
                          <LegendItem color="bg-brand-gold" label="مستلزمات تجميلية" value="25%" />
                          <LegendItem color="bg-brand-cyan" label="عقود الصيانة" value="10%" />
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View Handlers (Simplified for speed) */}
              {currentView === 'clients' && (
                <div className="space-y-10">
                  <div className="bg-brand-cyan/5 border border-brand-cyan/10 rounded-[2rem] p-8 flex items-center gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-cyan shadow-sm"><Hospital size={24} /></div>
                    <div>
                      <h3 className="text-lg font-black text-brand-navy">إدارة الشبكة الطبية</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">هنا يظهر جميع العملاء (المستشفيات، المراكز الطبية) الذين تتعامل معهم ميلينت كير. يمكنك متابعة حالة كل حساب والمسؤول عن التواصل فيه.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {clients.map(client => (
                    <motion.div whileHover={{ y: -10 }} key={client.id} className="medical-card p-10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-40 h-40 -mr-16 -mt-16 bg-blue-50 rounded-full transition-transform group-hover:scale-125 duration-500 opacity-40"></div>
                      <div className="flex justify-between items-start mb-8 relative">
                        <div className="w-16 h-16 bg-brand-navy text-brand-cyan rounded-2xl flex items-center justify-center shadow-xl shadow-slate-100 group-hover:bg-brand-green group-hover:text-white transition-colors">
                          <Hospital size={32} />
                        </div>
                        <span className="text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest bg-brand-cyan/10 text-brand-cyan">{client.type}</span>
                      </div>
                      <h4 className="text-2xl font-black text-brand-navy mb-2">{client.name}</h4>
                      <div className="flex items-center gap-2 text-slate-400 mb-8 font-medium">
                        <Globe size={16} />
                        <span className="text-sm">{client.location}</span>
                      </div>
                      <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                        <div>
                           <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-1">Account Manager</p>
                           <p className="font-bold text-slate-700">{client.contactPerson}</p>
                        </div>
                        <button className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-300 rounded-2xl hover:bg-brand-navy hover:text-white transition-all"><ArrowUpRight size={22} /></button>
                      </div>
                    </motion.div>
                  ))}
                  <button className="border-2 border-dashed border-slate-200/50 rounded-[3rem] p-10 flex flex-col items-center justify-center text-slate-200 hover:border-brand-green hover:text-brand-green transition-all bg-white/20 group">
                    <Plus size={64} className="mb-4 group-hover:scale-110 transition-transform" />
                    <span className="font-black text-xs uppercase tracking-[0.3em]">Expand Network</span>
                  </button>
                </div>
              </div>
            )}

              {currentView === 'reports' && (
                <div className="space-y-10">
                  <div className="bg-brand-navy p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-slate-700">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-brand-navy border border-slate-700 flex items-center justify-center text-white"><BarChart3 size={20} /></div>
                        <h3 className="text-2xl font-black">مركز التحليل المالي</h3>
                      </div>
                      <p className="text-slate-300 font-medium max-w-3xl leading-relaxed">توضح الرسوم البيانية أدناه الفارق بين الإيرادات المتوقعة والمصروفات الفعلية بناءً على سجل العقود المدخلة يدوياً في النظام.</p>
                    </div>
                    <div className="absolute -right-20 top-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[120px]"></div>
                  </div>

                  <div className="medical-card p-12">
                    <div className="flex items-center justify-between mb-16">
                      <div>
                        <h3 className="text-3xl font-black text-brand-navy tracking-tighter">حلول التحليل المالي</h3>
                        <p className="text-sm text-slate-400 mt-2 font-bold uppercase tracking-[0.2em] opacity-60">Revenue Performance Vector</p>
                      </div>
                      <div className="flex gap-10">
                        <LegendItem color="bg-brand-green shadow-lg shadow-brand-green/20" label="نمو الإيرادات" value="+22%" />
                        <LegendItem color="bg-brand-gold shadow-lg shadow-brand-gold/20" label="التدفق الخارج" value="-8%" />
                      </div>
                    </div>
                    <div className="h-[450px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={mockMonthlyData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00d084" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#00d084" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f8fafc" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 900 }} dy={20}/>
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 900 }} dx={-20}/>
                          <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px', textAlign: 'right', fontWeight: '800' }} />
                          <Area type="monotone" dataKey="revenue" stroke="#00d084" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                          <Line type="monotone" dataKey="expenses" stroke="#d4af37" strokeWidth={4} dot={{ r: 0 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-brand-navy p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                       <BarChart3 size={140} className="absolute -bottom-10 -right-10 text-white opacity-5 group-hover:rotate-12 transition-transform duration-1000" />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">Financial Summary</p>
                       <h4 className="text-2xl font-black mb-6 leading-tight">ملخص أداء المحفظة العقارية الطبية</h4>
                       <p className="text-slate-400 font-medium leading-relaxed">تعتمد هذه البيانات على القيم المسجلة في عقودك النشطة والمصاريف التشغيلية المعتمدة.</p>
                    </div>
                    <div className="bg-white border-2 border-slate-100 p-10 rounded-[3rem] shadow-sm flex flex-col justify-between">
                       <div>
                          <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mb-4">Action Required</p>
                          <h4 className="text-2xl font-black text-brand-navy mb-6 font-primary">مراجعة مخزون أجهزة الليزر للمستشفيات</h4>
                          <p className="text-slate-400 font-medium leading-relaxed">يُنصح بجدولة شحنة جديدة قبل نهاية الربع الأول لتفادي التأخير.</p>
                       </div>
                       <button className="flex items-center gap-2 text-brand-green font-black uppercase tracking-widest text-[10px] mt-8 hover:translate-x-2 transition-transform">Schedule Logistics Route <ArrowUpRight size={14}/></button>
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'orders' && (
                <div className="space-y-10 text-right">
                   <div className="bg-brand-navy/5 border border-brand-navy/10 rounded-[2rem] p-8 flex items-center gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-navy shadow-sm"><Briefcase size={24} /></div>
                    <div>
                      <h3 className="text-lg font-black text-brand-navy">سجل عقود التوريد</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">تتبع هنا كافة مسارات التوريد النشطة. كل صف يمثل عقداً مع عميل، ويوضح قيمته المالية وحالته اللوجستية (تحت التجهيز، قيد الشحن، تم التسليم).</p>
                    </div>
                  </div>
                   <div className="medical-card p-10">
                     <h3 className="text-xl font-black text-brand-navy mb-10">كافة العمليات الجارية</h3>
                     <div className="space-y-6">
                        {orders.map(order => (
                          <div key={order.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:border-brand-green/20 hover:bg-white transition-all group gap-4">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-navy shadow-sm group-hover:scale-110 transition-transform">
                                <FileText size={24} />
                              </div>
                              <div>
                                <h4 className="font-black text-brand-navy text-lg">{order.clientName}</h4>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.id}</span>
                                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.type} ROUTE</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                              <div className="text-left font-black text-brand-navy text-xl grow md:grow-0">{order.total.toLocaleString()} $</div>
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => openInvoice(order)}
                                  className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-navy hover:bg-brand-navy hover:text-white transition-all shadow-sm"
                                >
                                  عرض الفاتورة
                                </button>
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                  order.status === 'Delivered' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-cyan/10 text-brand-cyan'
                                }`}>
                                  {order.status}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                     </div>
                   </div>
                </div>
              )}
              {currentView === 'inventory' && (
                <div className="space-y-10">
                  <div className="bg-brand-green/5 border border-brand-green/10 rounded-[2rem] p-8 flex items-center gap-6 text-right">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-green shadow-sm"><Package size={24} /></div>
                    <div>
                      <h3 className="text-lg font-black text-brand-navy">كتالوج المعدات الطبية</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">قائمة بجميع الأجهزة والمواد الطبية التي توفرها شركة ميلينت كير. يمكنك الاطلاع على الأسعار المعتمدة ومدى توفر المنتجات في المخازن العالمية.</p>
                    </div>
                  </div>
                  <div className="medical-card overflow-hidden">
                   <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                      <div>
                        <h3 className="font-black text-2xl text-brand-navy">مخزون ميلينت الطبي</h3>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2 tracking-[0.3em]">Resource Command Center</p>
                      </div>
                      <button className="bg-brand-navy text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Add Equipment</button>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-right">
                        <thead className="bg-[#FAFBFD] text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                          <tr>
                            <th className="px-10 py-6">Medical Item</th>
                            <th className="px-10 py-6">Category</th>
                            <th className="px-10 py-6">Value ($)</th>
                            <th className="px-10 py-6">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {mockProducts.map(p => (
                            <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                               <td className="px-10 py-8 font-black text-slate-800 text-xl">{p.name}</td>
                               <td className="px-10 py-8"><span className="text-[10px] font-black border border-slate-100 text-slate-400 px-4 py-2 rounded-xl bg-white">{p.category}</span></td>
                               <td className="px-10 py-8 font-black text-slate-900 text-2xl">{p.price.toLocaleString()}</td>
                                 <td className="px-10 py-8">
                                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-slate-400 bg-slate-50 w-fit px-4 py-2 rounded-xl shadow-sm">
                                    <Package size={14} /> Available in Stock
                                  </div>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>
            )}

              {/* Simplified Expenses for Personal Tracking */}
              {currentView === 'expenses' && (
                <div className="space-y-10">
                  <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-[2rem] p-8 flex items-center gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-gold shadow-sm"><Wallet size={24} /></div>
                    <div>
                      <h3 className="text-lg font-black text-brand-navy">تتبع النفقات التشغيلية</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">سجل هنا كافة المبالغ التي يتم صرفها لإتمام المعاملات. يتم خصم هذه المبالغ برمجياً من قيمة العقود لتعطيك صافي الربح الحقيقي في لوحة التحكم.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="medical-card p-10 bg-brand-navy text-white">
                       <p className="text-brand-cyan font-black text-[10px] uppercase tracking-widest mb-2">إجمالي المصروفات</p>
                       <p className="text-4xl font-black">{stats.totalExpenses.toLocaleString()} $</p>
                    </div>
                    <div className="medical-card p-10 border-brand-cyan/20 bg-brand-cyan/5">
                       <p className="text-brand-cyan font-black text-[10px] uppercase tracking-widest mb-2">مصاريف لوجستية</p>
                       <p className="text-4xl font-black text-brand-navy">8.2k $</p>
                    </div>
                    <div className="medical-card p-10 bg-white">
                       <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest mb-2">نثريات إدارية</p>
                       <p className="text-4xl font-black text-brand-navy">1.4k $</p>
                    </div>
                  </div>
                  <div className="medical-card overflow-hidden">
                     <table className="w-full text-right">
                       <thead className="bg-[#FAFBFD] text-slate-300 text-[10px] font-black uppercase border-b border-slate-50">
                         <tr><th className="px-10 py-6">Description</th><th className="px-10 py-6">Category</th><th className="px-10 py-6">Amount</th><th className="px-10 py-6">Actions</th></tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                         {expenses.map(e => (
                           <tr key={e.id} className="hover:bg-slate-5 group transition-colors">
                             <td className="px-10 py-6 font-bold text-slate-700">{e.description}</td>
                             <td className="px-10 py-6"><span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-brand-green transition-colors">{e.category}</span></td>
                             <td className="px-10 py-6 font-black text-xl">{e.amount.toLocaleString()} $</td>
                             <td className="px-10 py-6"><button className="text-slate-300 hover:text-red-500"><X size={18}/></button></td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals & Invoices */}
      <InvoiceModal 
        isOpen={isInvoiceOpen} 
        order={selectedOrderForInvoice} 
        onClose={() => setIsInvoiceOpen(false)} 
      />
    </div>
  );
}

function StatCard({ title, value, trend, isUp, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-brand-navy/5 text-brand-navy shadow-brand-navy/5',
    red: 'bg-red-50 text-red-500 shadow-red-50',
    green: 'bg-brand-green/5 text-brand-green shadow-brand-green/5',
    teal: 'bg-brand-cyan/10 text-brand-cyan shadow-brand-cyan/5',
    gold: 'bg-brand-gold/10 text-brand-gold shadow-brand-gold/5',
  };

  const descriptions: any = {
    'إجمالي العقود النشطة': 'كل المبالغ التعاقدية التي يتم العمل على تحصيلها حالياً.',
    'مصاريف التوريد': 'التكاليف المدفوعة للمصادر والمصانع وشركات الشحن.',
    'صافي الأرباح (تقديري)': 'الفارق المتوقع بين قيمة العقود والمصاريـف التشغيلية.',
    'العقود قيد التنفيذ': 'عدد المعاملات التي لم تصل لمرحلة التسليم النهائي بعد.',
  };

  return (
    <motion.div whileHover={{ y: -8 }} className="bg-white p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border border-slate-100 shadow-sm transition-all relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center shadow-md transition-transform hover:rotate-6 ${colors[color]}`}>
          <Icon size={28} className="lg:hidden" />
          <Icon size={32} className="hidden lg:block" />
        </div>
        <div className={`px-3 py-1 bg-slate-50 rounded-xl flex items-center gap-1.5 text-[10px] font-black tracking-tight ${isUp ? 'text-brand-green' : 'text-red-500'}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest leading-none mb-3 opacity-60 flex items-center gap-2">
        {title}
        <motion.span initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="text-[8px] bg-brand-navy/5 text-brand-navy px-2 py-0.5 rounded cursor-help">💡 شرح</motion.span>
      </p>
      <p className="text-2xl lg:text-4xl font-black text-brand-navy tracking-tighter">{value}</p>
      <p className="text-[9px] text-slate-400 mt-3 font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">{descriptions[title]}</p>
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-brand-navy/5 rounded-full blur-3xl opacity-30"></div>
    </motion.div>
  );
}

function LegendItem({ color, label, value }: { color: string, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between group py-1.5 px-2 hover:bg-slate-50 rounded-xl transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-[11px] font-black text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-[0.1em]">{label}</span>
      </div>
      <span className="text-xs font-black text-slate-900">{value}</span>
    </div>
  );
}
