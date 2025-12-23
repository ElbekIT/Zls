
import React from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogOut, Crown, Settings, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserData } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  userData: UserData | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, userData }) => {
  const handleLogout = () => signOut(auth);

  return (
    <div className="min-h-screen flex flex-col bg-[#020617]">
      <nav className="sticky top-0 z-50 px-8 py-5 border-b border-amber-500/10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-4 group">
            <div className="p-2.5 bg-amber-500 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
              <Crown className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white uppercase italic">
              Elbek<span className="text-amber-500">Panel</span>
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            {!userData && <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
            
            {userData?.isAdmin && (
              <Link to="/admin" className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-amber-500 transition-all">
                <Settings className="w-5 h-5" />
              </Link>
            )}
            
            <button 
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center shadow-lg active:scale-95"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 relative">
        {children}
      </main>

      <footer className="py-12 text-center border-t border-white/5">
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.5em] opacity-50">
          &copy; MMXXIV ELBEK PANEL PRESTIGE • POWERED BY ELBEKGAMER
        </p>
      </footer>
    </div>
  );
};