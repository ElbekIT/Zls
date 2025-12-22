
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData, InviteCode } from '../types';
import { Users, Key, Plus, ShieldCheck, Search, Clock, Smartphone } from 'lucide-react';

interface AdminProps {
  user: any;
}

const Admin: React.FC<AdminProps> = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const uSnap = await getDocs(collection(db, 'users'));
    const iSnap = await getDocs(query(collection(db, 'invites'), orderBy('createdAt', 'desc')));
    setUsers(uSnap.docs.map(d => d.data() as UserData));
    setInvites(iSnap.docs.map(d => d.data() as InviteCode));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateInvite = async () => {
    const code = 'VENOM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const id = doc(collection(db, 'invites')).id;
    await setDoc(doc(db, 'invites', id), {
      id,
      code,
      createdBy: 'Admin',
      useCount: 0,
      maxUses: 5,
      createdAt: Date.now()
    });
    fetchData();
  };

  const setVip = async (userId: string, days: number) => {
    const until = Date.now() + (days * 24 * 60 * 60 * 1000);
    await updateDoc(doc(db, 'users', userId), {
      isVIP: true,
      vipUntil: until
    });
    fetchData();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase italic italic text-white">System Admin <span className="text-cyan-500">Panel</span></h1>
        <button 
          onClick={generateInvite}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-cyan-900/20"
        >
          <Plus className="w-5 h-5" />
          <span>GENERATE INVITE CODE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center"><Users className="mr-2 w-5 h-5 text-cyan-400" /> Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                placeholder="Search user..."
                className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="glass rounded-2xl overflow-hidden border border-slate-800">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 sticky top-0 z-10">
                  <tr className="text-xs uppercase font-bold text-slate-500">
                    <th className="p-4">Username</th>
                    <th className="p-4">VIP Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.filter(u => u.username.includes(search)).map(u => (
                    <tr key={u.uid} className="hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-slate-200">{u.username}</td>
                      <td className="p-4">
                        {u.isVIP ? (
                           <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">VIP</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-500 bg-slate-500/10 px-2 py-1 rounded">Standard</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                           <button onClick={() => setVip(u.uid, 1)} className="text-[10px] bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded border border-cyan-800/50">+1D</button>
                           <button onClick={() => setVip(u.uid, 30)} className="text-[10px] bg-purple-900/30 text-purple-400 px-2 py-1 rounded border border-purple-800/50">+30D</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invite Codes */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center"><Key className="mr-2 w-5 h-5 text-purple-400" /> Active Invitations</h2>
          <div className="glass rounded-2xl overflow-hidden border border-slate-800">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 sticky top-0 z-10">
                  <tr className="text-xs uppercase font-bold text-slate-500">
                    <th className="p-4">Code</th>
                    <th className="p-4">Uses</th>
                    <th className="p-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invites.map(i => (
                    <tr key={i.id} className="hover:bg-slate-800/30 font-mono">
                      <td className="p-4 font-bold text-cyan-500">{i.code}</td>
                      <td className="p-4 text-slate-300">{i.useCount} / {i.maxUses}</td>
                      <td className="p-4 text-slate-500 text-xs">{new Date(i.createdAt).toLocaleDateString()}</td>
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
