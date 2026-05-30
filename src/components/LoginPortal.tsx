import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { UserRole } from '../types';

interface LoginPortalProps {
  onLogin: (role: UserRole) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate Auth Delay
    setTimeout(() => {
      if (username === 'travel' && password === 'meme.123') {
        onLogin('travel');
      } else if (username === 'admin' && password === 'melent.123') {
        onLogin('admin');
      } else {
        setError('بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-navy/5 rounded-full blur-[100px] -ml-64 -mb-64"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <Logo className="h-20 mb-8" />
          <h1 className="text-3xl font-black text-brand-navy tracking-tighter">بوابة ميلنت كير</h1>
          <p className="text-[10px] font-black uppercase text-brand-green tracking-[0.3em] mt-3">الجسر بين الصحة والسياحة والتجارة</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-brand-navy/10 p-10 lg:p-12 border border-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-navy via-brand-cyan to-brand-green"></div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-widest px-1">اسم المستخدم</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-brand-navy transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pr-12 pl-4 text-sm font-bold focus:bg-white focus:border-brand-navy/10 transition-all outline-none"
                  placeholder="أدخل اسم المستخدم"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-widest px-1">كلمة المرور</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-brand-navy transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pr-12 pl-12 text-sm font-bold focus:bg-white focus:border-brand-navy/10 transition-all outline-none"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 hover:text-brand-navy transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-[10px] font-bold text-center bg-red-50 py-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
                isLoading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-navy text-white hover:bg-brand-green shadow-xl shadow-brand-navy/10 hover:shadow-brand-green/20'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
              ) : (
                <>
                   <span>تسجيل الدخول</span>
                   <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 flex items-center justify-center gap-2 text-slate-300">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">وصول مصرح به فقط</span>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 text-[9px] font-bold uppercase tracking-widest">
          © 2024 مجموعة ميلنت كير. جميع الحقوق محفوظة.
        </p>
      </motion.div>
    </div>
  );
};
