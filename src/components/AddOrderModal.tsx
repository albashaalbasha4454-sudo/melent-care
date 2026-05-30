import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, User, Truck, DollarSign, Package, FileText, 
  CheckCircle2, AlertCircle, Plus, Trash2, 
  ChevronRight, ChevronLeft, Globe, MapPin, 
  Phone, Mail, Building2, CreditCard, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MedicalOrder, ClientType, OrderStatus, 
  OrderCategory, DeliveryMethod, PaymentMethod, 
  Currency, OrderItem, Financials, Client, Product
} from '../types';
import { LocalStorageManager, MELENT_KEYS } from '../services/localStorageManager';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (order: MedicalOrder) => void;
  orderToEdit?: MedicalOrder | null;
}

const STEPS = [
  { id: 1, name: 'بيانات العميل', label: 'تفاصيل العميل', icon: User },
  { id: 2, name: 'المنتجات والخدمات', label: 'قائمة الطلبات', icon: Package },
  { id: 3, name: 'الشحن والتسليم', label: 'اللوجستيات', icon: Truck },
  { id: 4, name: 'المعلومات المالية', label: 'التكاليف والدفع', icon: DollarSign },
  { id: 5, name: 'الملاحظات والمرفقات', label: 'التوثيق', icon: FileText },
  { id: 6, name: 'مراجعة وتأكيد', label: 'إصدار العقد', icon: CheckCircle2 },
];

export const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, onClose, onAdd, orderToEdit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const initialFormState: Partial<MedicalOrder> = {
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientCountry: '',
    clientCity: '',
    clientAddress: '',
    clientType: 'Individual',
    identityNumber: '',
    items: [],
    financials: {
      subtotal: 0,
      localDeliveryFee: 0,
      intlShippingFee: 0,
      customsFee: 0,
      serviceFee: 0,
      discount: 0,
      tax: 0,
      total: 0,
      currency: 'USD'
    },
    shipping: {
      method: 'International Shipping',
      shippingCost: 0,
      paidBy: 'Client'
    },
    payment: {
      method: 'Bank Transfer'
    },
    status: 'Draft',
    category: 'Medical Supply',
    executionLocation: 'Turkey',
    notes: {
      internal: '',
      external: '',
      paymentTerms: '',
      deliveryTerms: '',
      returnPolicy: ''
    },
    attachments: []
  };

  // Form State
  const [formData, setFormData] = useState<Partial<MedicalOrder>>(initialFormState);
  
  // Data for selection
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Initialize data
  useEffect(() => {
    const clients = LocalStorageManager.get(MELENT_KEYS.CLIENTS) || [];
    const prods = LocalStorageManager.get(MELENT_KEYS.PRODUCTS) || [];
    setAvailableClients(clients);
    setAvailableProducts(prods);
  }, [isOpen]);

  const handleClientSelect = (clientId: string) => {
    const client = availableClients.find(c => c.id === clientId);
    if (client) {
      setFormData({
        ...formData,
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        clientEmail: client.email,
        clientCountry: client.location,
        clientType: client.type
      });
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = availableProducts.find(p => p.id === productId);
    if (product) {
      updateItem(index, 'productId', product.id);
      updateItem(index, 'name', product.name);
      updateItem(index, 'category', product.category);
      updateItem(index, 'unitPrice', product.price);
      updateItem(index, 'availability', product.stock > 0 ? 'Available' : 'Out of Stock');
    }
  };

  // Sync with orderToEdit
  useEffect(() => {
    if (orderToEdit) {
      setFormData(orderToEdit);
      setCurrentStep(1);
    } else {
      setFormData(initialFormState);
      setCurrentStep(1);
    }
  }, [orderToEdit, isOpen]);

  // Calculate Subtotal and Total
  const calculatedFinancials = useMemo(() => {
    const subtotal = (formData.items || []).reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const f = formData.financials || {} as Financials;
    const total = subtotal + 
                  (Number(f.localDeliveryFee) || 0) + 
                  (Number(f.intlShippingFee) || 0) + 
                  (Number(f.customsFee) || 0) + 
                  (Number(f.serviceFee) || 0) + 
                  (Number(f.tax) || 0) - 
                  (Number(f.discount) || 0);
    
    return { ...f, subtotal, total };
  }, [formData.items, formData.financials]);

  const validateStep = (step: number) => {
    setError(null);
    if (step === 1) {
      if (!formData.clientName) return "يرجى إدخال اسم العميل الكامل";
      if (!formData.clientPhone) return "يرجى إدخال رقم الهاتف الجوال";
      if (!formData.clientCountry) return "يرجى اختيار الدولة";
    }
    if (step === 2) {
      if (!formData.items || formData.items.length === 0) return "يجب إضافة منتج أو خدمة واحدة على الأقل";
    }
    if (step === 4) {
      if (calculatedFinancials.total <= 0) return "لا يمكن أن تكون قيمة العقد صفرًا أو أقل";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(currentStep);
    if (err) {
      setError(err);
      return;
    }
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    const err = validateStep(6);
    if (err) {
      setError(err);
      return;
    }

    const finalOrder: MedicalOrder = {
      ...formData as MedicalOrder,
      id: orderToEdit?.id || `ML-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      clientId: orderToEdit?.clientId || `CLI-${Math.floor(Math.random() * 1000)}`,
      date: orderToEdit?.date || new Date().toISOString(),
      financials: calculatedFinancials
    };

    onAdd(finalOrder);
    onClose();
  };

  const addItem = () => {
    const newItem: OrderItem = {
      productId: `P-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      name: '',
      category: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      availability: 'Available'
    };
    setFormData({ ...formData, items: [...(formData.items || []), newItem] });
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'unitPrice' || field === 'quantity') {
      newItems[index].total = newItems[index].unitPrice * newItems[index].quantity;
    }
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = [...(formData.items || [])];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10 pointer-events-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md pointer-events-auto" />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[95vh] pointer-events-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 lg:p-10 border-b border-slate-100 bg-slate-50/30">
          <div dir="rtl" className="flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green border-2 border-brand-green/20">
              <Receipt size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-brand-navy">
                {orderToEdit ? 'تعديل بيانات العقد' : 'إنشاء عقد توريد جديد'}
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                {orderToEdit ? 'تعديل اتفاقية التوريد' : 'اتفاقية توريد تجارية مفصلة'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-300 hover:text-brand-navy shadow-sm transition-all"><X /></button>
        </div>

        {/* Stepper Navigation */}
        <div className="px-8 lg:px-10 py-6 flex items-center justify-between bg-white border-b border-slate-50 select-none overflow-x-auto no-scrollbar">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div 
                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                className={`flex flex-col items-center gap-2 transition-all cursor-pointer ${currentStep === step.id ? 'opacity-100 scale-105' : currentStep > step.id ? 'opacity-60 hover:opacity-100' : 'opacity-20 pointer-events-none'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentStep >= step.id ? 'bg-brand-navy text-brand-cyan' : 'bg-slate-100 text-slate-400'}`}>
                  <step.icon size={18} />
                </div>
                <div className="text-center hidden sm:block">
                  <p className={`text-[10px] font-black uppercase tracking-tighter ${currentStep === step.id ? 'text-brand-navy' : 'text-slate-400'}`}>{step.name}</p>
                  <p className="text-[8px] text-slate-300 font-bold uppercase">{step.label}</p>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-[2px] flex-1 mx-4 rounded-full ${currentStep > step.id ? 'bg-brand-green/30' : 'bg-slate-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar" dir="rtl">
          
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-4 text-red-600 font-bold text-sm">
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}

          {currentStep === 1 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <section>
                 <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                   <h4 className="text-[10px] font-black uppercase text-brand-green tracking-[0.3em]">بيانات الهوية والاتصال (Customer Identity)</h4>
                   {availableClients.length > 0 && (
                     <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-slate-400">اختر من القائمة:</span>
                       <select 
                         onChange={(e) => handleClientSelect(e.target.value)}
                         className="text-[10px] font-black bg-white border border-slate-100 rounded-lg px-2 py-1 outline-none"
                         value={formData.clientId || ''}
                       >
                         <option value="">-- عميل مسجل --</option>
                         {availableClients.map(c => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                         ))}
                       </select>
                     </div>
                   )}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 mr-2">الاسم الثلاثي بالكامل</label>
                      <input type="text" value={formData.clientName || ''} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-green/20 transition-all font-bold text-sm" placeholder="الاسم كما في الهوية أو السجل" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 mr-2">نوع العميل</label>
                      <select value={formData.clientType || 'Individual'} onChange={e => setFormData({...formData, clientType: e.target.value as ClientType})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-green/20 transition-all font-bold text-sm">
                        <option value="Individual">فرد</option>
                        <option value="Company">شركة</option>
                        <option value="Hospital">مستشفى / مركز طبي</option>
                        <option value="Distributor">موزع</option>
                        <option value="Supplier">مورد</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 mr-2">رقم الهاتف (مع مفتاح الدولة)</label>
                      <input type="tel" dir="ltr" value={formData.clientPhone || ''} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-green/20 transition-all font-bold text-sm text-left" placeholder="+XXX XXXXXXXX" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 mr-2">البريد الإلكتروني</label>
                      <input type="email" dir="ltr" value={formData.clientEmail || ''} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-green/20 transition-all font-bold text-sm text-left" placeholder="example@mail.com" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 mr-2">رقم الهوية / السجل التجاري</label>
                      <input type="text" value={formData.identityNumber || ''} onChange={e => setFormData({...formData, identityNumber: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-green/20 transition-all font-bold text-sm" placeholder="رقم السجل التجاري أو الهوية" />
                    </div>
                 </div>
               </section>

               <section>
                 <h4 className="text-[10px] font-black uppercase text-brand-green tracking-[0.3em] border-b border-slate-100 pb-3 mb-6">العنوان الجغرافي (Location Details)</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 mr-2">الدولة (Country)</label>
                      <input type="text" value={formData.clientCountry || ''} onChange={e => setFormData({...formData, clientCountry: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-green/20 transition-all font-bold text-sm" placeholder="مثلاً: المملكة العربية السعودية" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 mr-2">المدينة (City)</label>
                      <input type="text" value={formData.clientCity || ''} onChange={e => setFormData({...formData, clientCity: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-green/20 transition-all font-bold text-sm" placeholder="مثلاً: الرياض" />
                    </div>
                    <div className="lg:col-span-1 space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 mr-2">العنوان التفصيلي</label>
                      <input type="text" value={formData.clientAddress || ''} onChange={e => setFormData({...formData, clientAddress: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-green/20 transition-all font-bold text-sm" placeholder="الحي، الشارع، رقم المبنى" />
                    </div>
                 </div>
               </section>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in slide-in-from-left duration-500">
               <div className="flex items-center justify-between">
                 <div>
                   <h4 className="text-xl font-black text-brand-navy">قائمة الأصناف المطلوبة</h4>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Products & Services List</p>
                 </div>
                 <button onClick={addItem} className="bg-brand-navy text-brand-cyan px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-brand-green hover:text-white transition-all shadow-xl shadow-brand-navy/5 font-black text-xs uppercase tracking-widest">
                   <Plus size={16} />
                   إضافة صنف جديد
                 </button>
               </div>

               <div className="space-y-4">
                 {(formData.items || []).map((item, idx) => (
                   <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={item.productId} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent hover:border-brand-navy/5 transition-all">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                        <div className="md:col-span-3 space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mr-2">اسم المنتج / الخدمة</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={item.name || ''} 
                              onChange={e => updateItem(idx, 'name', e.target.value)} 
                              className="w-full bg-white rounded-xl p-3 text-sm font-bold border-transparent focus:border-brand-navy/10" 
                              placeholder="ابحث أو اختر المنتج" 
                            />
                            {availableProducts.length > 0 && (
                              <select 
                                onChange={(e) => handleProductSelect(idx, e.target.value)}
                                className="absolute left-1 top-1.5 bottom-1.5 bg-slate-100 rounded-lg text-[8px] font-black outline-none px-1 border-r-2 border-white"
                                value={item.productId || ''}
                              >
                                <option value="">اختيار...</option>
                                {availableProducts.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mr-2">التصنيف</label>
                          <input type="text" value={item.category || ''} onChange={e => updateItem(idx, 'category', e.target.value)} className="w-full bg-white rounded-xl p-3 text-sm font-bold border-transparent focus:border-brand-navy/10" placeholder="معدات طبية" />
                        </div>
                        <div className="md:col-span-1 space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mr-2">الكمية</label>
                          <input type="number" value={item.quantity || 0} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} className="w-full bg-white rounded-xl p-3 text-sm font-black border-transparent focus:border-brand-navy/10 text-center" />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mr-2">سعر الوحدة ($)</label>
                          <input type="number" value={item.unitPrice || 0} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} className="w-full bg-white rounded-xl p-3 text-sm font-black border-transparent focus:border-brand-navy/10" />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mr-2">حالة التوفر</label>
                          <select value={item.availability || 'Available'} onChange={e => updateItem(idx, 'availability', e.target.value)} className="w-full bg-white rounded-xl p-3 text-xs font-bold border-transparent focus:border-brand-navy/10">
                            <option value="Available">متوفر</option>
                            <option value="Needs Order">تحت الطلب</option>
                            <option value="Out of Stock">غير متوفر</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 flex items-center justify-between">
                           <div className="text-left">
                             <p className="text-[8px] font-black text-slate-300 uppercase leading-none">الإجمالي الفرعي</p>
                             <p className="text-lg font-black text-brand-navy leading-normal">${item.total.toLocaleString()}</p>
                           </div>
                           <button onClick={() => removeItem(idx)} className="w-10 h-10 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                             <Trash2 size={18} />
                           </button>
                        </div>
                      </div>
                   </motion.div>
                 ))}
                 {(formData.items || []).length === 0 && (
                   <div className="py-20 border-3 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
                      <Package size={48} className="mb-4 opacity-50" />
                      <p className="font-bold">لم تضف أي منتجات بعد</p>
                      <p className="text-xs uppercase tracking-widest mt-1">Please add items to the list</p>
                   </div>
                 )}
               </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
               <section>
                 <h4 className="text-[10px] font-black uppercase text-brand-cyan tracking-[0.3em] border-b border-slate-100 pb-3 mb-6">إعدادات الشحن والتسلم (قواعد الشحن)</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 mr-2">طريقة التسليم / الشحن</label>
                      <select value={formData.shipping?.method} onChange={e => setFormData({...formData, shipping: {...formData.shipping!, method: e.target.value as DeliveryMethod}})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-cyan/20 transition-all font-bold text-sm">
                        <option value="Office Pickup">استلام من المكتب / المستودع</option>
                        <option value="Local Turkey">توصيل محلي داخل تركيا</option>
                        <option value="Internal Client Country">شحن داخلي داخل دولة العميل</option>
                        <option value="International Shipping">شحن دولي</option>
                        <option value="Air Freight">شحن جوي</option>
                        <option value="Sea Freight">شحن بحري</option>
                        <option value="Express Shipping">شحن سريع</option>
                        <option value="Customer Arranged">ترتيب من قبل العميل</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 mr-2">مكان تنفيذ الطلب</label>
                      <select value={formData.executionLocation} onChange={e => setFormData({...formData, executionLocation: e.target.value as any})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-cyan/20 transition-all font-bold text-sm">
                        <option value="Turkey">داخل تركيا</option>
                        <option value="International">خارج تركيا</option>
                        <option value="Multi-location">دولي / متعدد</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 mr-2">من يتحمل التكلفة؟</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Client', 'MELENT CARE', 'Split'].map(opt => (
                          <button key={opt} onClick={() => setFormData({...formData, shipping: {...formData.shipping!, paidBy: opt as any}})} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter border-2 transition-all ${formData.shipping?.paidBy === opt ? 'bg-brand-navy border-brand-navy text-brand-cyan' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                 </div>
               </section>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <section className="p-8 bg-slate-50 rounded-[2.5rem] space-y-6">
                    <h5 className="flex items-center gap-3 text-sm font-black text-brand-navy">
                      <Globe size={18} className="text-brand-cyan" />
                      تفاصيل الوجهة الدولية
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 mr-2">دولة الوجهة</label>
                        <input type="text" value={formData.shipping?.destinationCountry || ''} onChange={e => setFormData({...formData, shipping: {...formData.shipping!, destinationCountry: e.target.value}})} className="w-full bg-white rounded-xl p-3 text-sm font-bold border-transparent" placeholder="دولة التسليم" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 mr-2">المدينة</label>
                        <input type="text" value={formData.shipping?.destinationCity || ''} onChange={e => setFormData({...formData, shipping: {...formData.shipping!, destinationCity: e.target.value}})} className="w-full bg-white rounded-xl p-3 text-sm font-bold border-transparent" placeholder="مدينة التسليم" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 mr-2">شركة الشحن</label>
                        <input type="text" value={formData.shipping?.carrier || ''} onChange={e => setFormData({...formData, shipping: {...formData.shipping!, carrier: e.target.value}})} className="w-full bg-white rounded-xl p-3 text-sm font-bold border-transparent" placeholder="اسم شركة الشحن" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 mr-2">رقم التتبع (إن وجد)</label>
                        <input type="text" dir="ltr" value={formData.shipping?.trackingNumber || ''} onChange={e => setFormData({...formData, shipping: {...formData.shipping!, trackingNumber: e.target.value}})} className="w-full bg-white rounded-xl p-3 text-sm font-bold border-transparent text-left" placeholder="رقم الشحنة الدولي" />
                      </div>
                    </div>
                  </section>

                  <section className="p-8 bg-slate-50 rounded-[2.5rem] space-y-6">
                    <h5 className="flex items-center gap-3 text-sm font-black text-brand-navy">
                      <MapPin size={18} className="text-brand-green" />
                      التسليم المحلي في تركيا
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 mr-2">أجور التوصيل المحلي</label>
                        <input type="number" value={formData.financials?.localDeliveryFee || 0} onChange={e => setFormData({...formData, financials: {...formData.financials!, localDeliveryFee: Number(e.target.value)}})} className="w-full bg-white rounded-xl p-3 text-sm font-black border-transparent" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 mr-2">شركة التوصيل المحلي</label>
                        <input type="text" value={formData.shipping?.localCarrier || ''} onChange={e => setFormData({...formData, shipping: {...formData.shipping!, localCarrier: e.target.value}})} className="w-full bg-white rounded-xl p-3 text-sm font-bold border-transparent" placeholder="اسم شركة التوصيل" />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 mr-2">تاريخ التسليم المتوقع</label>
                        <input type="date" value={formData.shipping?.expectedDeliveryDate || ''} onChange={e => setFormData({...formData, shipping: {...formData.shipping!, expectedDeliveryDate: e.target.value}})} className="w-full bg-white rounded-xl p-3 text-sm font-bold border-transparent" />
                      </div>
                    </div>
                  </section>
               </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-[10px] font-black uppercase text-brand-gold tracking-[0.3em] border-b border-slate-100 pb-3 mb-6">طريقة الدفع (Payment Method)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                           <select value={formData.payment?.method} onChange={e => setFormData({...formData, payment: {...formData.payment!, method: e.target.value as PaymentMethod}})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-gold/20 transition-all font-bold text-sm">
                             <option value="Bank Transfer">تحويل بنكي</option>
                             <option value="International Wire">حوالة دولية</option>
                             <option value="Cash">دفع نقدي</option>
                             <option value="Credit Card">بطاقة ائتمانية</option>
                             <option value="Downpayment + Delivery">دفعة مقدمة + تسليم</option>
                             <option value="Cash on Delivery">الدفع عند الاستلام</option>
                             <option value="Other">أخرى</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 mr-2">عملة العقد</label>
                          <select value={formData.financials?.currency} onChange={e => setFormData({...formData, financials: {...formData.financials!, currency: e.target.value as Currency}})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-gold/20 transition-all font-bold text-sm">
                            <option value="USD">دولار أمريكي (USD)</option>
                            <option value="TRY">ليرة تركية (TRY)</option>
                            <option value="EUR">يورو (EUR)</option>
                            <option value="SAR">ريال سعودي (SAR)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 mr-2">حالة الدفع الأولية</label>
                          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as OrderStatus})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-brand-gold/20 transition-all font-bold text-sm">
                            <option value="Draft">مسودة</option>
                            <option value="Awaiting Payment">بانتظار الدفع</option>
                            <option value="Paid">تم الدفع</option>
                          </select>
                        </div>
                      </div>
                    </section>

                    {formData.payment?.method === 'Bank Transfer' && (
                      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-brand-gold/5 rounded-[2.5rem] border-2 border-brand-gold/10 space-y-6">
                        <h5 className="flex items-center gap-3 text-sm font-black text-brand-navy">
                          <CreditCard size={18} className="text-brand-gold" />
                          بيانات التحويل البنكي
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                           <input type="text" placeholder="اسم البنك" className="bg-white rounded-xl p-3 text-xs font-bold" />
                           <input type="text" placeholder="اسم صاحب الحساب" className="bg-white rounded-xl p-3 text-xs font-bold" />
                           <input type="text" placeholder="IBAN" className="bg-white rounded-xl p-3 text-xs font-bold col-span-2" />
                           <input type="text" placeholder="رقم العملية" className="bg-white rounded-xl p-3 text-xs font-bold" />
                           <input type="date" className="bg-white rounded-xl p-3 text-xs font-bold" />
                        </div>
                      </motion.section>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-[3rem] p-10 flex flex-col justify-between">
                     <div className="space-y-5">
                        <h4 className="text-xl font-black text-brand-navy">تفصيل الحساب المالي (Financial Summary)</h4>
                        <div className="space-y-3 pt-2">
                           <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                             <span>قيمة المنتجات (Subtotal)</span>
                             <span>${calculatedFinancials.subtotal.toLocaleString()}</span>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase mr-1">أجور الشحن الدولي</label>
                                <input type="number" value={formData.financials?.intlShippingFee} onChange={e => setFormData({...formData, financials: {...formData.financials!, intlShippingFee: Number(e.target.value)}})} className="w-full bg-white rounded-xl p-2 text-xs font-black" />
                                <p className="text-[7px] text-slate-400 font-bold px-1">تشمل الشحن الجوي أو البحري مع التأمين الدولي.</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase mr-1">رسوم الخدمة / تنسيق</label>
                                <input type="number" value={formData.financials?.serviceFee} onChange={e => setFormData({...formData, financials: {...formData.financials!, serviceFee: Number(e.target.value)}})} className="w-full bg-white rounded-xl p-2 text-xs font-black" />
                                <p className="text-[7px] text-slate-400 font-bold px-1">القيمة الإضافية لخدمات Melent Care اللوجستية.</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase mr-1">رسوم الجمارك</label>
                                <input type="number" value={formData.financials?.customsFee} onChange={e => setFormData({...formData, financials: {...formData.financials!, customsFee: Number(e.target.value)}})} className="w-full bg-white rounded-xl p-2 text-xs font-black" />
                                <p className="text-[7px] text-slate-400 font-bold px-1">القيمة المقدرة للتخليص الجمركي ببلد المقصد.</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase mr-1">الخصم (Discount)</label>
                                <input type="number" value={formData.financials?.discount} onChange={e => setFormData({...formData, financials: {...formData.financials!, discount: Number(e.target.value)}})} className="w-full bg-white rounded-xl p-2 text-xs font-black text-red-500" />
                                <p className="text-[7px] text-slate-400 font-bold px-1">خصم الحصومات أو العروض الخاصة للعملاء.</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="mt-10 pt-8 border-t-2 border-dashed border-slate-200">
                        <div className="flex items-center justify-between">
                           <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">المبلغ الإجمالي المستحق</p>
                             <p className="text-[8px] font-bold text-slate-300 uppercase italic">الرصيد النهائي للتسديد</p>
                           </div>
                           <div className="text-left">
                             <span className="text-4xl font-black text-brand-navy">
                               {calculatedFinancials.currency} {calculatedFinancials.total.toLocaleString()}
                             </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <section className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-brand-green tracking-[0.3em] border-b border-slate-100 pb-3">ملاحظات العقد</h4>
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 mr-2">ملاحظات تظهر للعميل في العقد</label>
                          <textarea value={formData.notes?.external || ''} onChange={e => setFormData({...formData, notes: {...formData.notes!, external: e.target.value}})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold min-h-[120px]" placeholder="مثلاً: يرجى التوصيل بعد الساعة ٤ عصراً" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 mr-2">ملاحظات إدارية داخلية (Internal)</label>
                          <textarea value={formData.notes?.internal || ''} onChange={e => setFormData({...formData, notes: {...formData.notes!, internal: e.target.value}})} className="w-full bg-brand-navy/5 rounded-2xl p-4 text-sm font-bold min-h-[120px]" placeholder="ملاحظات سرية للفريق فقط" />
                        </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-brand-green tracking-[0.3em] border-b border-slate-100 pb-3">شروط وأحكام</h4>
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 mr-2">شروط الدفع والتسليم</label>
                          <textarea value={formData.notes?.paymentTerms || ''} onChange={e => setFormData({...formData, notes: {...formData.notes!, paymentTerms: e.target.value}})} className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium min-h-[80px]" placeholder="شروط السداد والاستلام" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400 mr-2">سياسة الإلغاء والاسترجاع</label>
                          <textarea value={formData.notes?.returnPolicy || ''} onChange={e => setFormData({...formData, notes: {...formData.notes!, returnPolicy: e.target.value}})} className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium min-h-[80px]" placeholder="سياسة إلغاء الطلب" />
                        </div>
                    </div>
                  </section>
               </div>
               
               <section>
                 <h4 className="text-[10px] font-black uppercase text-brand-cyan tracking-[0.3em] border-b border-slate-100 pb-3 mb-6">المرفقات والمستندات</h4>
                 <div className="p-12 border-3 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 bg-slate-50/50">
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 shadow-sm mb-4">
                       <Plus size={32} />
                    </div>
                    <p className="font-black text-brand-navy">اضغط لرفع المستندات (الهوية، الفواتير، الإيصالات)</p>
                    <p className="text-[10px] uppercase font-bold mt-2">الحجم الأقصى للملف: ١٠ ميجابايت للملف الواحد</p>
                 </div>
               </section>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-10 animate-in zoom-in duration-500 max-w-4xl mx-auto">
               <div className="text-center space-y-2 mb-12">
                 <h4 className="text-3xl font-black text-brand-navy">المراجعة النهائية للعقد</h4>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em]">مراجعة العقد النهائية</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-6">
                    <h5 className="text-[10px] font-black text-brand-green uppercase tracking-widest leading-none border-b border-slate-200 pb-3">بيانات أساسية</h5>
                    <div className="space-y-4">
                       <div className="flex justify-between">
                         <span className="text-xs font-bold text-slate-400">اسم العميل:</span>
                         <span className="text-sm font-black text-brand-navy">{formData.clientName}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs font-bold text-slate-400">رقم التواصل:</span>
                         <span className="text-sm font-black text-brand-navy" dir="ltr">{formData.clientPhone}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs font-bold text-slate-400">نوع الطلب:</span>
                         <span className="text-sm font-black text-brand-navy">{formData.category}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs font-bold text-slate-400">عدد الأصناف:</span>
                         <span className="text-sm font-black text-brand-navy">{formData.items?.length} أصناف</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-6">
                    <h5 className="text-[10px] font-black text-brand-cyan uppercase tracking-widest leading-none border-b border-slate-200 pb-3">اللوجستيات والمالية</h5>
                    <div className="space-y-4">
                       <div className="flex justify-between">
                         <span className="text-xs font-bold text-slate-400">طريقة التسليم:</span>
                         <span className="text-sm font-black text-brand-navy">{formData.shipping?.method}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs font-bold text-slate-400">طريقة الدفع:</span>
                         <span className="text-sm font-black text-brand-navy">{formData.payment?.method}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs font-bold text-slate-400">الوجهة:</span>
                         <span className="text-sm font-black text-brand-navy">{formData.shipping?.destinationCountry || 'غير محدد'}</span>
                       </div>
                       <div className="flex justify-between pt-2 border-t border-slate-200">
                         <span className="text-xs font-black text-brand-navy">الإجمالي النهائي:</span>
                         <span className="text-xl font-black text-brand-green">{calculatedFinancials.currency} {calculatedFinancials.total.toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="p-8 border-2 border-slate-100 rounded-[2.5rem] bg-white flex items-center gap-6">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">تنبيه هام</p>
                    <p className="text-[10px] text-slate-400 font-medium">بضغطك على حفظ العقد، سيتم إصدار مرجع رسمي (ML-REF) وتوثيق كافة البيانات في قاعدة بيانات MELENT CARE والبدء بإجراءات التوريد.</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 lg:p-10 border-t border-slate-100 bg-white flex items-center justify-between">
          <button 
            onClick={handlePrev} 
            disabled={currentStep === 1}
            className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest ${currentStep === 1 ? 'opacity-0' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            <ChevronRight size={18} />
            السابق
          </button>

          <div className="flex items-center gap-4">
             {currentStep < 6 ? (
               <button onClick={handleNext} className="bg-brand-navy text-brand-cyan px-10 py-5 rounded-[2rem] font-black text-xs lg:text-sm uppercase tracking-[0.2em] hover:bg-brand-green hover:text-white transition-all shadow-2xl shadow-brand-navy/10 flex items-center gap-3 group">
                 الخطوة التالية
                 <ChevronLeft size={20} className="group-hover:translate-x-[-4px] transition-transform" />
               </button>
             ) : (
               <button onClick={handleSubmit} className="bg-brand-green text-white px-12 py-5 rounded-[2rem] font-black text-xs lg:text-sm uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-brand-green/20 flex items-center gap-3">
                 تأكيد وحفظ العقد
                 <CheckCircle2 size={20} />
               </button>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
