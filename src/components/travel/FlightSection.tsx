import React, { useState, useEffect } from 'react';
import { Plane, Plus, FileDown, MapPin, Calendar, Clock, ArrowRight, User, ShieldCheck, Info, AlertTriangle } from 'lucide-react';
import { DataTable } from '../DataTable';
import { LocalStorageManager, MELENT_KEYS } from '../../services/localStorageManager';
import { FlightReservation, Patient } from '../../types';

export const FlightSection: React.FC = () => {
  const [flights, setFlights] = useState<FlightReservation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    setFlights(LocalStorageManager.get(MELENT_KEYS.TRAVEL_FLIGHTS) || []);
    setPatients(LocalStorageManager.get(MELENT_KEYS.TRAVEL_PATIENTS) || []);
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flights, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "melent_flight_manifest.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const columns = [
    { header: 'المسافر / المريض', accessor: (f: FlightReservation) => {
      const p = patients.find(pat => pat.id === f.patientId);
      return (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center font-black border border-cyan-100">
             {p ? p.name.charAt(0) : '?'}
          </div>
          <div>
            <p className="font-black text-brand-navy tracking-tight">{p?.name || 'Unknown'}</p>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{f.id}</p>
          </div>
        </div>
      );
    }},
    { header: 'مسار الرحلة', accessor: (f: FlightReservation) => (
      <div className="flex items-center gap-4 py-1" dir="ltr">
        <div className="flex flex-col items-center">
           <span className="text-xs font-black text-brand-navy">{f.departureCity}</span>
        </div>
        <div className="flex-1 border-t-2 border-dashed border-slate-100 relative min-w-[60px]">
           <Plane size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500 rotate-90" />
        </div>
        <div className="flex flex-col items-center">
           <span className="text-xs font-black text-brand-navy">{f.arrivalCity}</span>
        </div>
      </div>
    )},
    { header: 'الخطوط والجهاز', accessor: (f: FlightReservation) => (
      <div className="flex items-center gap-2">
         <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-brand-navy">
            {f.airline.substring(0, 2).toUpperCase()}
         </div>
         <div>
            <p className="text-xs font-bold text-slate-500">{f.airline}</p>
            <p className="text-[9px] font-black text-brand-navy uppercase tracking-widest">{f.flightNumber}</p>
         </div>
      </div>
    )},
    { header: 'الجدول الزمني', accessor: (f: FlightReservation) => (
      <div className="flex items-center gap-3">
         <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={12} />
            <span className="text-[11px] font-bold tabular-nums italic">{new Date(f.departureDate).toLocaleDateString()}</span>
         </div>
         <div className="flex items-center gap-2 text-brand-cyan">
            <Clock size={12} />
            <span className="text-[11px] font-black tabular-nums">{f.departureTime || 'TBA'}</span>
         </div>
      </div>
    )},
    { header: 'الحالة التشغيلية', accessor: (f: FlightReservation) => (
      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${
        f.pnrStatus === 'Confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
        f.pnrStatus === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
        'bg-slate-50 text-slate-400 border-slate-100'
      }`}>
        {f.pnrStatus}
      </span>
    )},
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Plane className="text-cyan-500" size={24} />
              <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">قيادة اللوجستيات الجوية</h2>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">إدارة الحركة الجوية العالمية وبيان ركاب المرضى</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleExport}
            className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy shadow-sm transition-all hover:shadow-md"
            title="تصدير البيان"
          >
            <FileDown size={20} />
          </button>
          <button 
            onClick={() => {
              const pnr = prompt('أدخل رمز PNR للرحلة الجديدة:');
              if (pnr) {
                const newFlight: FlightReservation = {
                  id: 'flt' + Date.now() + Math.random().toString(36).substring(2, 9),
                  patientId: patients[0]?.id || '',
                  patientName: patients[0]?.name || 'Unknown Patient',
                  airline: 'Turkish Airlines',
                  flightNumber: 'TK' + Math.floor(1000 + Math.random() * 9000),
                  origin: 'IST',
                  destination: 'RUH',
                  departureCity: 'اسطنبول',
                  arrivalCity: 'الرياض',
                  departureDate: new Date().toISOString().split('T')[0],
                  departureTime: '10:00 AM',
                  arrivalTime: '14:00 PM',
                  pnr,
                  pnrStatus: 'Confirmed',
                  status: 'Booked'
                };
                const updated = [...flights, newFlight];
                setFlights(updated);
                LocalStorageManager.save(MELENT_KEYS.TRAVEL_FLIGHTS, updated);
              }
            }}
            className="bg-brand-navy text-white px-8 py-5 rounded-2xl font-black text-xs shadow-2xl shadow-brand-navy/30 hover:bg-brand-green transition-all flex items-center gap-4 group uppercase tracking-[0.2em]"
          >
            <Plus size={20} className="text-brand-cyan group-hover:rotate-90 transition-transform" />
            إنشاء خطة رحلة
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
        <DataTable 
          data={flights} 
          columns={columns}
          onEdit={() => {}}
          onDelete={() => {}}
          onView={(f) => console.log('View Booking Portfolio', f)}
        />
      </div>

      {/* Flight Pulse Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-slate-900/40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/20 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="relative z-10 flex items-center gap-5">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-brand-cyan backdrop-blur-md">
                 <Plane size={32} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.3em]">الجاهزية التشغيلية</p>
                  <p className="text-3xl font-black">كافة الرحلات منتظمة</p>
               </div>
            </div>
            <div className="mt-8 space-y-4 relative z-10">
               <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase text-white/60">بيانات PNR النشطة</span>
                  <span className="text-xl font-black">{flights.length}</span>
               </div>
               <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase text-white/60">حالة عقدة العبور</span>
                  <span className="text-xl font-black text-brand-green">مثالية</span>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
            <h4 className="text-[11px] font-black text-brand-navy uppercase tracking-widest flex items-center gap-3">
               <AlertTriangle className="text-brand-gold" size={18} />
               معايير سلامة اللوجستيات
            </h4>
            <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
               <p className="text-xs font-bold text-slate-500 leading-relaxed">
                 يجب التحقق من كل رحلة مريض مقابل التصريح الطبي الحالي. يجب تمييز المرضى الذين يحتاجون إلى أكسجين أو مساعدة تنقل متخصصة في رمز PNR بطلب "WCHR" أو "WCHS" قبل 48 ساعة على الأقل من المغادرة.
               </p>
            </div>
            <div className="flex gap-4">
               <button 
                onClick={() => alert('بدأ تدقيق التصاريح الطبية...')}
                className="flex-1 py-4 bg-brand-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-green transition-all shadow-xl shadow-brand-navy/10"
               >
                  تدقيق التصاريح الطبية
               </button>
               <button 
                onClick={() => alert('مزامنة العمليات الأرضية...')}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
               >
                  مزامنة العمليات الأرضية
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
