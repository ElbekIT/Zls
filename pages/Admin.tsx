
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData } from '../types';
import { Users, User as UserIcon, Search, Trash2, ShieldCheck, Zap, Star } from 'lucide-react';

const Admin: React.FC<{ user: any }> = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => d.data() as UserData));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const setVipDuration = async (userId: string, hours: number) => {
    const durationMs = hours * 60 * 60 * 1000;
    const until = Date.now() + durationMs;
    await updateDoc(doc(db, 'users', userId), {
      isVIP: true,
      vipUntil: until
    });
  };

  const removeUser = async (userId: string) => {
    if (window.confirm("FATAL ACTION: Expunge this node from the matrix?")) {
      await deleteDoc(doc(db, 'users', userId));
    }
  };

  const timeOptions = [
    { label: '1H', val: 1 },
    { label: '5H', val: 5 },
    { label: '1D', val: 24 },
    { label: '3D', val: 72 },
    { label: '7D', val: 168 },
    { label: '30D', val: 720 },
    { label: 'INF', val: 87600 },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.1)]">
             <ShieldCheck className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h1 className="text-5xl font-black uppercase italic text-white leading-none tracking-tighter neon-glow">
              CORE_ADMIN <span className="text-cyan-500">PULSE</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black mt-3 uppercase tracking-[0.5em] opacity-60">High-Level Authorization Required</p>
          </div>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
          <input 
            placeholder="Scan Identity Nodes..."
            className="bg-slate-950/50 border border-slate-800 rounded-2xl pl-14 pr-8 py-5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 w-full md:w-96 transition-all font-bold shadow-inner"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
             <div className="flex items-center space-x-4">
                <Users className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Active Agents Registry</h2>
             </div>
             <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-xl border border-white/5">
                Total Nodes: {users.length}
             </div>
          </div>
          
          <div className="cyber-card rounded-[3rem] overflow-hidden border border-slate-800/50 shadow-2xl bg-slate-950/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase font-black text-slate-600 tracking-[0.3em]">
                    <th className="p-8">Agent Node</th>
                    <th className="p-8">Clearance</th>
                    <th className="p-8">Expiration Pulse</th>
                    <th className="p-8">Grant Authorization</th>
                    <th className="p-8 text-right">SysControl</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())).map(u => (
                    <tr key={u.uid} className="hover:bg-cyan-500/[0.02] transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center space-x-5">
                           <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center relative shadow-lg">
                              <UserIcon className={`w-6 h-6 ${u.isAdmin ? 'text-red-500' : 'text-slate-500'}`} />
                              {u.isVIP && <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,1)]"></div>}
                           </div>
                           <div className="flex flex-col">
                              <span className="font-black text-slate-200 uppercase italic text-base tracking-tight">{u.username}</span>
                              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1 font-mono">{u.uid.slice(0, 10)}</span>
                           </div>
                        </div>
                      </td>
                      <td className="p-8">
                        {u.isVIP ? (
                           <span className="inline-flex px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                             <Star className="w-3 h-3 mr-2" />
                             VIP_AUTH
                           </span>
                        ) : (
                          <span className="inline-flex px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-slate-600 border border-slate-800">STANDARD</span>
                        )}
                      </td>
                      <td className="p-8 text-[11px] font-black text-slate-500 font-mono">
                        {u.vipUntil ? (
                           <div className="flex items-center space-x-2">
                              <Zap className="w-3.5 h-3.5 text-yellow-500" />
                              <span>{new Date(u.vipUntil).toLocaleDateString()} {new Date(u.vipUntil).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           </div>
                        ) : 'OFFLINE'}
                      </td>
                      <td className="p-8">
                        <div className="flex flex-wrap gap-2 max-w-[250px]">
                          {timeOptions.map(opt => (
                             <button 
                                key={opt.label}
                                onClick={() => setVipDuration(u.uid, opt.val)}
                                className="text-[10px] font-black bg-slate-950 hover:bg-cyan-600 border border-slate-800 hover:border-cyan-400 text-slate-500 hover:text-white px-3 py-1.5 rounded-xl transition-all active:scale-90"
                             >
                               {opt.label}
                             </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        {!u.isAdmin && (
                          <button 
                            onClick={() => removeUser(u.uid)}
                            className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all duration-300"
                            title="Purge Node"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
