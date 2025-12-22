
import React from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogOut, ShieldCheck, Settings } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col cyber-gradient">
      <nav className="glass sticky top-0 z-50 px-6 py-4 border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-600 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)]">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">
              Venom<span className="text-cyan-500">Key</span>
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            {userData?.isAdmin && (
              <Link to="/admin" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-900/50 transition-all">
                <Settings className="w-5 h-5" />
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-red-950/20 border border-red-900/30 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-900/30 transition-all flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Off
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12">
        {children}
      </main>

      <footer className="py-10 text-center">
        <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">
          &copy; MMXXIV VENOMKEY ADVANCED • SECURED BY ELBEKGAMER
        </p>
      </footer>
    </div>
  );
};
