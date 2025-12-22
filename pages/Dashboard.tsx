
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
  Users, 
  Activity, 
  TrendingUp,
  Sparkles,
  Zap,
  Lock,
  Crown
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

  const canCreateKey = userData?.isVIP || keys.length === 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden glass rounded-3xl p-8 md:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Zap className="w-32 h-32 text-cyan-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img src={`https://ui-avatars.com/api/?name=${userData?.username}&background=0E7490&color=fff`} className="w-20 h-20 rounded-2xl border-2 border-cyan-500/50 shadow-lg" alt="Pfp" />
              {userData?.isVIP && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 p-1.5 rounded-lg shadow-lg">
                  <Crown className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                {userData?.username} <span className="text-slate-600 font-normal">/ Dashboard</span>
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${userData?.isVIP ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                  {userData?.isVIP ? 'VIP ACCESS ACTIVE' : 'STANDARD TRIAL'}
                </span>
                {userData?.isAdmin && (
                  <Link to="/admin" className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 transition-all">
                    System Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={() => canCreateKey ? setIsModalOpen(true) : alert("VIP access required for more keys.")}
            className={`group relative inline-flex items-center justify-center px-10 py-4 font-black text-white transition-all duration-300 rounded-xl overflow-hidden shadow-2xl uppercase tracking-widest italic text-sm ${canCreateKey ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-slate-800 grayscale cursor-not-allowed'}`}
          >
             {canCreateKey ? <Plus className="w-5 h-5 mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
             {userData?.isVIP ? 'Generate Key' : (keys.length > 0 ? 'LOCKED' : 'Generate Trial')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 border border-slate-800">
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Licenses</p>
           <h3 className="text-3xl font-black mt-2 text-white">{keys.length}</h3>
        </div>
        <div className="glass rounded-2xl p-6 border border-slate-800">
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Status</p>
           <h3 className="text-3xl font-black mt-2 text-cyan-400">{keys.filter(k => k.isActive).length} <span className="text-xs text-slate-600 font-bold">READY</span></h3>
        </div>
        <div className="glass rounded-2xl p-6 border border-slate-800">
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">System Efficiency</p>
           <h3 className="text-3xl font-black mt-2 text-purple-500">99.9% <span className="text-xs text-slate-600 font-bold">STABLE</span></h3>
        </div>
      </div>

      <KeyTable keys={keys} onRefresh={fetchKeys} />

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
