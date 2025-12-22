
import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { LicenseKey, UserData } from '../types';
import { KeyTable } from '../components/KeyTable';
import { GenerateKeyModal } from '../components/GenerateKeyModal';
import { 
  Plus, 
  Key as KeyIcon, 
  Activity, 
  Zap,
  Lock,
  Crown,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
  userData: UserData | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user, userData }) => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'keys'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setKeys(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LicenseKey[]);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }, [user.uid]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  // Real-time active key count (not just isActive, but not expired)
  const activeKeysCount = keys.filter(k => k.isActive && (!k.expiresAt || Date.now() < k.expiresAt)).length;

  // Normal user logic: 1 key only, max 1 hour.
  const canCreateKey = userData?.isAdmin || userData?.isVIP || (!userData?.trialUsed && keys.length === 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="relative overflow-hidden glass rounded-[2.5rem] p-10 md:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Zap className="w-64 h-64 text-cyan-400" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="flex items-center space-x-8">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 rounded-full"></div>
              <img 
                src={`https://ui-avatars.com/api/?name=${userData?.username}&background=0E7490&color=fff&bold=true&size=128`} 
                className="w-24 h-24 rounded-3xl border-2 border-cyan-500/40 shadow-2xl relative z-10" 
                alt="Profile" 
              />
              {(userData?.isVIP || userData?.isAdmin) && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-600 p-2 rounded-xl shadow-xl z-20">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                {userData?.username}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${userData?.isVIP ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                  {userData?.isVIP ? 'VIP ACCESS ACTIVE' : 'STANDARD TRIAL'}
                </span>
                {userData?.isAdmin && (
                  <Link to="/admin" className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    System Admin
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
             {!canCreateKey && (
               <div className="text-right flex flex-col items-end mr-4">
                 <span className="text-red-400 font-black text-xs uppercase tracking-widest italic">Limitga yetildi</span>
                 <span className="text-slate-600 text-[10px] font-bold uppercase">VIP uchun admin bilan bog'laning</span>
               </div>
             )}
             <button 
                onClick={() => canCreateKey ? setIsModalOpen(true) : null}
                disabled={!canCreateKey}
                className={`group relative inline-flex items-center justify-center px-10 py-5 font-black text-white transition-all duration-300 rounded-[1.2rem] overflow-hidden shadow-2xl uppercase tracking-widest italic text-sm border ${canCreateKey ? 'bg-cyan-600 hover:bg-cyan-500 border-cyan-400/30 hover:shadow-cyan-500/20 active:scale-95' : 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed grayscale'}`}
              >
                 {canCreateKey ? <Plus className="w-5 h-5 mr-3" /> : <Lock className="w-5 h-5 mr-3" />}
                 {userData?.isVIP || userData?.isAdmin ? 'Generate VIP Key' : (keys.length > 0 ? 'TRIAL ISHLATILGAN' : 'Generate Trial')}
              </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Jami Keylar', value: keys.length, icon: KeyIcon, color: 'text-blue-500' },
          { label: 'Faol Litsenziyalar', value: activeKeysCount, icon: Activity, color: 'text-cyan-500' },
          { label: 'Sizning Vaqtingiz', value: userData?.isVIP ? 'CHEKSIZ VIP' : '1 SOAT TRIAL', icon: Clock, color: 'text-purple-500' }
        ].map((stat, i) => (
          <div key={i} className="glass rounded-3xl p-8 border border-slate-800/50 group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-6">
               <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-cyan-500 transition-colors"></div>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-4xl font-black mt-2 text-slate-100 tracking-tighter italic">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-1.5 h-8 bg-cyan-600 rounded-full shadow-[0_0_10px_rgba(8,145,178,0.5)]"></div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Database Management</h2>
        </div>
        <KeyTable keys={keys} onRefresh={fetchKeys} />
      </div>

      {isModalOpen && (
        <GenerateKeyModal 
          userId={user.uid} 
          userData={userData}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchKeys} 
        />
      )}
    </div>
  );
};

export default Dashboard;
