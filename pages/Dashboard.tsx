
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { LicenseKey, UserData } from '../types';
import { KeyTable } from '../components/KeyTable';
import { GenerateKeyModal } from '../components/GenerateKeyModal';
import { Plus, Key, Activity, Shield, Crown, Clock, ShieldAlert, Zap, Loader2, Sparkles, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

const Dashboard: React.FC<{ user: User; userData: UserData | null }> = ({ user, userData }) => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'keys'), 
      where('userId', '==', user.uid), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LicenseKey[];
      setKeys(data);
      setLoading(false);
      setSyncing(false);
    }, (err) => {
      console.error("Critical Sync Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const copyBaseApi = () => {
    const url = `${window.location.origin}/#/connect`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const activeCount = keys.filter(k => k.isActive && (!k.expiresAt || Date.now() < k.expiresAt)).length;
  const canCreate = userData?.isAdmin || userData?.isVIP || (!userData?.trialUsed);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      
      {/* Profile HUD */}
      <div className="cyber-card rounded-[3.5rem] p-12 md:p-16 relative overflow-hidden group border-cyan-500/20">
        <div className="absolute top-[-20%] right-[-5%] opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-1000 pointer-events-none">
          <Shield className="w-[600px] h-[600px] text-cyan-400 rotate-12" />
        </div>
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-16 relative z-10">
          <div className="flex items-center space-x-12">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-[80px] opacity-25 animate-pulse"></div>
              <img 
                src={`https://ui-avatars.com/api/?name=${userData?.username || 'U'}&background=06B6D4&color=fff&bold=true&size=256`} 
                className="w-36 h-36 rounded-[3rem] border-4 border-white/5 relative z-10 shadow-2xl transition-transform group-hover:scale-105 duration-700" 
                alt="Identity" 
              />
              {userData?.isVIP && (
                <div className="absolute -top-5 -right-5 bg-gradient-to-br from-yellow-400 to-orange-600 p-4 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.4)] z-20 animate-bounce">
                  <Crown className="w-7 h-7 text-black" />
                </div>
              )}
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none neon-glow">
                  {userData?.username || 'GUEST_NODE'}
                </h1>
                {userData?.isVIP && <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />}
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <div className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] border flex items-center ${userData?.isVIP ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-800/50 text-slate-500 border-slate-700'}`}>
                   <div className={`w-2.5 h-2.5 rounded-full mr-4 animate-pulse ${userData?.isVIP ? 'bg-cyan-400' : 'bg-slate-500'}`}></div>
                  {userData?.isVIP ? 'VIP_LEVEL_ACCESS' : 'TRIAL_RESTRICTED'}
                </div>
                <button 
                  onClick={copyBaseApi}
                  className="group flex items-center space-x-3 text-slate-400 text-[10px] font-mono tracking-widest bg-black/60 px-5 py-2.5 rounded-2xl border border-white/5 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'API_URL_COPIED' : 'COPY_CONNECT_API'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-6">
             {userData?.trialUsed && !userData?.isVIP && !userData?.isAdmin && (
               <div className="flex items-center space-x-3 px-8 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">TRIAL EXHAUSTED: Upgrade Required</span>
               </div>
             )}
             <button 
                disabled={!canCreate || loading}
                onClick={() => setIsModalOpen(true)}
                className={`group px-14 py-7 btn-elite text-white font-black rounded-2xl transition-all active:scale-95 disabled:opacity-20 uppercase tracking-[0.4em] text-[12px] flex items-center italic ${!canCreate ? 'cursor-not-allowed grayscale' : ''}`}
              >
                <Plus className="w-6 h-6 mr-5 group-hover:rotate-90 transition-transform" />
                {canCreate ? 'DEPLOY_LICENSE' : 'QUOTA_LOCKED'}
              </button>
          </div>
        </div>
      </div>

      {/* Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: 'Registered Keys', value: keys.length, icon: Key, color: 'text-cyan-400', bg: 'bg-cyan-500/5', shadow: 'shadow-cyan-500/5' },
          { label: 'Active Signals', value: activeCount, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/5', shadow: 'shadow-emerald-500/5' },
          { label: 'Access Protocol', value: (userData?.isVIP || userData?.isAdmin) ? 'UNLIMITED' : '1H_TRIAL', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/5', shadow: 'shadow-purple-500/5' }
        ].map((s, i) => (
          <div key={i} className={`cyber-card p-14 rounded-[3.5rem] border border-white/5 group hover:border-cyan-500/40 transition-all duration-700 ${s.bg} ${s.shadow}`}>
            <div className={`p-6 rounded-2xl bg-black/60 border border-white/10 w-fit mb-12 ${s.color} group-hover:scale-110 group-hover:rotate-12 transition-all shadow-xl`}>
              <s.icon className="w-10 h-10" />
            </div>
            <p className="text-slate-500 text-[13px] font-black uppercase tracking-[0.5em] mb-5">{s.label}</p>
            <h3 className="text-7xl font-black text-white italic tracking-tighter">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Registry Section */}
      <div className="space-y-12">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center space-x-6">
            <div className="w-2.5 h-14 bg-cyan-600 rounded-full shadow-[0_0_30px_rgba(6,182,212,1)] animate-neon"></div>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Encrypted Registry</h2>
          </div>
          {syncing && (
            <div className="flex items-center space-x-4 text-cyan-400 font-black text-[11px] uppercase tracking-widest animate-pulse">
               <Loader2 className="w-5 h-5 animate-spin" />
               <span>Syncing Mainframe...</span>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center space-y-8 opacity-50">
             <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-t-2 border-purple-500 rounded-full animate-spin duration-700"></div>
             </div>
             <p className="text-[14px] font-black uppercase tracking-[0.7em] text-cyan-400 animate-pulse">Accessing Data Nodes...</p>
          </div>
        ) : (
          <KeyTable keys={keys} onRefresh={() => {}} />
        )}
      </div>

      {isModalOpen && (
        <GenerateKeyModal 
          userId={user.uid} userData={userData} 
          onClose={() => setIsModalOpen(false)} onSuccess={() => {}} 
        />
      )}
    </div>
  );
};

export default Dashboard;
