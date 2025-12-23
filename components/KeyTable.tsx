
import React, { useState, useEffect } from 'react';
import { Trash2, Copy, CheckCircle2, ShieldAlert, Search, ChevronLeft, ChevronRight, XCircle, Clock } from 'lucide-react';
import { LicenseKey } from '../types';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const KeyTable: React.FC<{ keys: LicenseKey[]; onRefresh: () => void }> = ({ keys, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const size = 10;

  const filtered = keys.filter(k => k.keyString.toLowerCase().includes(search.toLowerCase()) || k.game.toLowerCase().includes(search.toLowerCase()));
  const total = Math.ceil(filtered.length / size);
  const current = filtered.slice((page - 1) * size, page * size);

  const handleCopy = (t: string, id: string) => {
    navigator.clipboard.writeText(t);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Erase license?')) {
      await deleteDoc(doc(db, 'keys', id));
      onRefresh();
    }
  };

  const handleToggle = async (k: LicenseKey) => {
    await updateDoc(doc(db, 'keys', k.id), { isActive: !k.isActive });
    onRefresh();
  };

  const getStatus = (k: LicenseKey) => {
    if (!k.isActive) return { l: 'BLOCKED', c: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
    if (k.expiresAt && Date.now() > k.expiresAt) return { l: 'EXPIRED', c: 'text-red-400 bg-red-500/10 border-red-500/20' };
    return { l: 'ACTIVE', c: 'text-green-400 bg-green-500/10 border-green-500/20' };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input 
            placeholder="Search Registry..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-cyan-500/40 w-full md:w-64 font-medium"
          />
        </div>
      </div>

      <div className="cyber-card rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">App Target</th>
                <th className="px-6 py-4">Encryption Key</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {current.map(k => {
                const s = getStatus(k);
                return (
                  <tr key={k.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-black italic uppercase text-xs text-slate-300">{k.game}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <code className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5 text-cyan-400 font-mono text-xs tracking-wider">
                          {k.keyString}
                        </code>
                        <button onClick={() => handleCopy(k.keyString, k.id)} className="text-slate-600 hover:text-cyan-400 transition-colors">
                          {copied === k.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Clock className="w-3 h-3 mr-2" />
                        {k.durationLabel}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border tracking-widest ${s.c}`}>
                        {s.l}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleToggle(k)} className="p-2 text-slate-600 hover:text-orange-400"><ShieldAlert className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(k.id)} className="p-2 text-slate-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {current.length === 0 && (
                <tr><td colSpan={5} className="py-20 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest">Registry Empty</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
