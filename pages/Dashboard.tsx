
import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { LicenseKey, UserData } from '../types';
import { KeyTable } from '../components/KeyTable';
import { GenerateKeyModal } from '../components/GenerateKeyModal';
import { Plus, Key, Activity, Shield, Crown, Clock, Zap } from 'lucide-react';

const Dashboard: React.FC<{ user: User; userData: UserData | null }> = ({ user, userData }) => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'keys'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setKeys(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LicenseKey[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user.uid]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const activeCount = keys.filter(k => k.isActive && (!k.expiresAt || Date.now() < k.expiresAt)).length;
  const canCreate = userData?.isAdmin || userData?.isVIP || (!userData?.trialUsed && keys.length === 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header */}
      <div className="cyber-card rounded-[2.5rem] p-8 md:p-10 border border-white/5 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] opacity-[0.05] pointer-events-none">
          <Shield className="w-80 h-80 text-cyan-500" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img 
                src={`https://ui-avatars.com/api/?name=${userData?.username}&background=06B6D4&color=fff&bold=true&size=128`} 
                className="w-20 h-20 rounded-3xl border border-white/10" 
                alt="User" 
              />
              {userData?.isVIP && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 p-1.5 rounded-xl shadow-lg">
                  <Crown className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-black text-white italic tracking-tight uppercase leading-none">
                {userData?.username}
              </h1>
              <div className="flex items-center mt-2 space-x-3">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${userData?.isVIP ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                  {userData?.isVIP ? 'VIP Access' : 'Trial Access'}
                </span>
                <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                  ID: {user.uid.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          <button 
            disabled={!canCreate}
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-cyan-950 active:scale-95 disabled:opacity-30 disabled:grayscale uppercase tracking-widest text-xs flex items-center italic"
          >
            <Plus className="w-5 h-5 mr-3" />
            {canCreate ? 'Generate Key' : 'Limit Exceeded'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Generated Licenses', value: keys.length, icon: Key, color: 'text-blue-400' },
          { label: 'Active Sessions', value: activeCount, icon: Activity, color: 'text-cyan-400' },
          { label: 'Status Protocol', value: userData?.isVIP ? 'LIFETIME' : '1H TRIAL', icon: Clock, color: 'text-purple-400' }
        ].map((s, i) => (
          <div key={i} className="cyber-card p-8 rounded-3xl border border-white/5 group hover:border-cyan-500/20 transition-all">
            <div className={`p-3 rounded-2xl bg-slate-900 border border-white/5 w-fit mb-6 ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</p>
            <h3 className="text-4xl font-black mt-1 text-white italic tracking-tighter">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-1.5 h-8 bg-cyan-600 rounded-full"></div>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">License Registry</h2>
        </div>
        <KeyTable keys={keys} onRefresh={fetchKeys} />
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
