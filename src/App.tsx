import { useState } from 'react';
import { UserRole } from './types';
import { LoginPortal } from './components/LoginPortal';
import { TravelDashboard } from './components/TravelDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';

import { HelpFab } from './components/HelpFab';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('melent_role') as UserRole) || null;
  });

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('melent_role', role || '');
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('melent_role');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AnimatePresence mode="wait">
        {!userRole ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginPortal onLogin={handleLogin} />
          </motion.div>
        ) : userRole === 'travel' ? (
          <motion.div
            key="travel"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <TravelDashboard onLogout={handleLogout} />
          </motion.div>
        ) : (
          <motion.div
            key="admin"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <AdminDashboard onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
      <HelpFab />
    </div>
  );
}
