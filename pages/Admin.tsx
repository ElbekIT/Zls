
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, query, orderBy, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData, InviteCode } from '../types';
// Added User as UserIcon to fix the 'Cannot find name UserIcon' error
import { Users, User as UserIcon, Key, ShieldCheck, Search, Clock, Smartphone, Plus, Trash2, ShieldAlert } from 'lucide-react';

const Admin: React.FC<{ user: any }> = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const uSnap = await getDocs(collection(db, 'users'));
    setUsers(uSnap.docs.map(d => d.data() as UserData));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setVipDuration = async (userId: string, hours: number) => {
    const durationMs = hours * 60 * 60 * 1000;
    const until = Date.now() + durationMs;
    await updateDoc(doc(db, 'users', userId), {
      isVIP: true,
      vipUntil: until
    });
    fetchData();
  };

  const removeUser = async (userId: string) => {
    if (window.confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) {
      await deleteDoc(doc(db, 'users', userId));
      fetchData();
    }
  };

  const timeOptions = [
    { label: '1H', val: 1 },
    { label: '2H', val: 2 },
    { label: '3H', val: 3 },
    { label: '5H', val: 5 },
    { label: '1D', val: 24 },
    { label: '2D', val: 48 },
    { label: '3D', val: 72 },
    { label: '5D', val: 120 },
    { label: '10D', val: 240 },
    { label: '20D', val: 480 },
    { label: '30D', val: 720 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic text-white leading-none tracking-tighter">
            System Admin <span className="text-cyan-500">Pulse</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Global VIP License Control</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
          <input 
            placeholder="User qidirish..."
            className="bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 w-full md:w-80 transition-all font-bold"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
             <Users className="w-6 h-6 text-cyan-400" />
             <h2 className="text-xl font-black uppercase italic tracking-tight text-white">Registered Agents</h2>
          </div>
          
          <div className="glass rounded-[2rem] overflow-hidden border border-slate-800/50 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase font-black text-slate-500 tracking-widest">
                    <th className="p-6">Agent Name</th>
                    <th className="p-6">Status</th>
                    <th className="p-6">Expiry</th>
                    <th className="p-6">Assign Time</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {users.filter(u => u.username.includes(search.toLowerCase())).map(u => (
                    <tr key={u.uid} className="hover:bg-slate-800/20 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                              <UserIcon className={`w-5 h-5 ${u.isAdmin ? 'text-red-500' : 'text-slate-600'}`} />
                           </div>
                           <span className="font-black text-slate-200 uppercase italic">{u.username}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        {u.isVIP ? (
                           <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">VIP</span>
                        ) : (
                          <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-600 border border-slate-700">Standard</span>
                        )}
                      </td>
                      <td className="p-6 text-xs font-bold text-slate-500">
                        {u.vipUntil ? new Date(u.vipUntil).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-6">
                        <div className="flex flex-wrap gap-1">
                          {timeOptions.map(opt => (
                             <button 
                                key={opt.label}
                                onClick={() => setVipDuration(u.uid, opt.val)}
                                className="text-[9px] font-black bg-slate-950 hover:bg-cyan-600 border border-slate-800 hover:border-cyan-400 text-slate-500 hover:text-white px-2 py-1 rounded-lg transition-all"
                             >
                               {opt.label}
                             </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        {!u.isAdmin && (
                          <button 
                            onClick={() => removeUser(u.uid)}
                            className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
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
