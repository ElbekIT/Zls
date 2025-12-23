
import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { LicenseKey, UserData } from '../types';
import { KeyTable } from '../components/KeyTable';
import { GenerateKeyModal } from '../components/GenerateKeyModal';
// Added Loader2 to the lucide-react imports
import { Plus, Key, Activity, Shield, Crown, Clock, Zap, RefreshCcw, Loader2 } from 'lucide-react';

const Dashboard: React.FC<{ user: User; userData: UserData | null }> = ({ user, userData }) => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'keys'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LicenseKey[];
      setKeys(data);
    } catch (e) { 
      console.error("Dashboard key fetch error:", e); 
    } finally { 
      setLoading(false); 
    }
  }, [user.uid]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const activeCount = keys.filter(k => k.isActive && (!k.expiresAt || Date.now() < k.expiresAt)).length;
  const canCreate = userData?.isAdmin || userData?.isVIP || (!userData?.trialUsed && keys.length === 0);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Header Panel */}
      <div className="glass-card rounded-[3rem] p-10 md:p-14 relative overflow-hidden group border-cyan-500/10 hover:border-cyan-500/20 transition-all duration-700">
        <div className="absolute top-[-30%] right-[-10%] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
          <Shield className="w-96 h-96 text-cyan-400 rotate-12" />
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
          <div className="flex items-center space-x-8">
            <div className="relative group/avatar">
              <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 group-hover/avatar:opacity-40 transition-opacity rounded-full"></div>
              <img 
                src={`https://ui-avatars.com/api/?name=${userData?.username || 'User'}&background=06B6D4&color=fff&bold=true&size=160`} 
                className="w-24 h-24 rounded-[2rem] border-2 border-white/10 relative z-10 shadow-2xl" 
                alt="Profile" 
              />
              {userData?.isVIP && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-600 p-2.5 rounded-2xl shadow-xl z-20 animate-bounce shadow-orange-950/40">
                  <Crown className="w-5 h-5 text-black" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase neon-text">
                  {userData?.username || 'Agent'}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${userData?.isVIP ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-slate-800/50 text-slate-500 border-slate-700'}`}>
                  {userData?.isVIP ? 'VIP STATUS: ACTIVE' : 'ACCESS: TRIAL'}
                </span>
                <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest opacity-60">
                  NODE: {user.uid.slice(0, 12).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
             <button 
               onClick={fetchKeys}
               className="p-4 rounded-2xl bg-slate-900 border border-white/5 text-slate-500 hover:text-cyan-400 transition-all active:rotate-180"
             >
               <RefreshCcw className="w-5 h-5" />
             </button>
             <button 
                disabled={!canCreate || loading}
                onClick={() => setIsModalOpen(true)}
                className={`group px-10 py-5 btn-primary text-white font-black rounded-2xl transition-all active:scale-95 disabled:opacity-20 disabled:grayscale uppercase tracking-widest text-xs flex items-center italic ${!canCreate ? 'cursor-not-allowed' : ''}`}
              >
                <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                {canCreate ? 'Initialize New Key' : 'Limit Restricted'}
              </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Deployments', value: keys.length, icon: Key, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
          { label: 'Live Sessions', value: activeCount, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'Time Protocol', value: userData?.isVIP ? 'PERMANENT' : '60M SESSION', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/5' }
        ].map((s, i) => (
          <div key={i} className={`glass-card p-10 rounded-[2.5rem] border border-white/5 group hover:border-cyan-500/30 transition-all duration-500 ${s.bg}`}>
            <div className={`p-4 rounded-2xl bg-slate-950 border border-white/5 w-fit mb-8 ${s.color} group-hover:scale-110 transition-transform`}>
              <s.icon className="w-7 h-7" />
            </div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">{s.label}</p>
            <h3 className="text-5xl font-black mt-2 text-white italic tracking-tighter">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-1.5 h-10 bg-cyan-600 rounded-full shadow-[0_0_15px_rgba(8,145,178,0.6)]"></div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Encrypted Registry</h2>
          </div>
          <div className="hidden md:block h-px flex-1 mx-10 bg-gradient-to-r from-cyan-900/40 to-transparent"></div>
        </div>
        
        {loading && keys.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-50">
             <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
             <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Synchronizing Data...</p>
          </div>
        ) : (
          <KeyTable keys={keys} onRefresh={fetchKeys} />
        )}
      </div>

      {isModalOpen && (
        <GenerateKeyModal 
          userId={user.uid} userData={userData} 
          onClose={() => setIsModalOpen(false)} onSuccess={fetchKeys} 
        />
      )}
    </div>
  );
};

export default Dashboard;
