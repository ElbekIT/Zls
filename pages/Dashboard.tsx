
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { LicenseKey, UserData } from '../types';
import { KeyTable } from '../components/KeyTable';
import { GenerateKeyModal } from '../components/GenerateKeyModal';
import { Plus, Key, Activity, Crown, Clock, ShieldAlert, Loader2, Sparkles, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

const Dashboard: React.FC<{ user: User; userData: UserData | null }> = ({ user, userData }) => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(true);
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
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const copyBaseApi = () => {
    const url = `${window.location.origin}/connect`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const activeCount = keys.filter(k => k.isActive && (!k.expiresAt || Date.now() < k.expiresAt)).length;
  const canCreate = userData?.isAdmin || userData?.isVIP || (!userData?.trialUsed);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      
      {/* Profile HUD */}
      <div className="gold-card rounded-[3.5rem] p-12 md:p-16 relative overflow-hidden group">
        <div className="absolute top-[-10%] right-[-10%] opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-1000 pointer-events-none">
          <Crown className="w-[500px] h-[500px] text-amber-500 rotate-12" />
        </div>
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 relative z-10">
          <div className="flex items-center space-x-10">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 blur-[60px] opacity-20 animate-pulse"></div>
              <img 
                src={`https://ui-avatars.com/api/?name=${userData?.username || 'U'}&background=f59e0b&color=020617&bold=true&size=256`} 
                className="w-32 h-32 rounded-[2.5rem] border-2 border-white/10 relative z-10 shadow-2xl" 
                alt="Identity" 
              />
              {userData?.isVIP && (
                <div className="absolute -top-4 -right-4 bg-amber-500 p-3 rounded-2xl shadow-xl z-20">
                  <Crown className="w-5 h-5 text-slate-950" />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                  {userData?.username || 'AGENT_X'}
                </h1>
                {userData?.isVIP && <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center ${userData?.isVIP ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-900 text-slate-500 border-white/5'}`}>
                  {userData?.isVIP ? 'PRESTIGE_ACCESS' : 'TRIAL_NODE'}
                </div>
                <button 
                  onClick={copyBaseApi}
                  className="flex items-center space-x-2 text-slate-500 text-[9px] font-bold tracking-widest bg-slate-950/80 px-4 py-2 rounded-xl border border-white/5 hover:border-amber-500/30 hover:text-amber-500 transition-all"
                >
                  {copiedLink ? <CheckCircle2 className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                  <span>{copiedLink ? 'COPIED' : 'COPY_API_BRIDGE'}</span>
                </button>
              </div>
            </div>
          </div>

          <button 
            disabled={!canCreate || loading}
            onClick={() => setIsModalOpen(true)}
            className="group px-12 py-6 btn-gold text-slate-950 font-black rounded-2xl transition-all active:scale-95 disabled:opacity-20 uppercase tracking-widest text-[11px] flex items-center italic"
          >
            <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
            {canCreate ? 'Generate License' : 'Quota Locked'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Registered Registry', value: keys.length, icon: Key, color: 'text-amber-500' },
          { label: 'Active Signals', value: activeCount, icon: Activity, color: 'text-green-500' },
          { label: 'Protocol Level', value: (userData?.isVIP || userData?.isAdmin) ? 'ELITE' : 'TRIAL', icon: Clock, color: 'text-blue-500' }
        ].map((s, i) => (
          <div key={i} className="gold-card p-10 rounded-[2.5rem] border border-white/5 group hover:border-amber-500/20">
            <div className={`p-4 rounded-xl bg-slate-950 border border-white/5 w-fit mb-8 ${s.color}`}>
              <s.icon className="w-8 h-8" />
            </div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-3">{s.label}</p>
            <h3 className="text-5xl font-black text-white italic tracking-tighter">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Registry Table Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-4 px-4">
          <div className="w-1.5 h-10 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Mainframe Registry</h2>
        </div>
        
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
             <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Syncing Nodes...</p>
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