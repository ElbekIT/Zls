
import React, { useState } from 'react';
import { Trash2, Copy, CheckCircle2, ShieldAlert, Search, ChevronLeft, ChevronRight, XCircle, Clock, Link2 } from 'lucide-react';
import { LicenseKey } from '../types';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const KeyTable: React.FC<{ keys: LicenseKey[]; onRefresh: () => void }> = ({ keys, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState<string | null>(null);
  const size = 10;

  const filtered = keys.filter(k => 
    k.keyString.toLowerCase().includes(search.toLowerCase()) || 
    k.game.toLowerCase().includes(search.toLowerCase())
  );
  
  const total = Math.ceil(filtered.length / size);
  const current = filtered.slice((page - 1) * size, page * size);

  const handleCopy = (t: string, id: string) => {
    navigator.clipboard.writeText(t);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyLink = (key: string, id: string) => {
    const url = `${window.location.origin}/#/connect?key=${key}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(id);
    setTimeout(() => setLinkCopied(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Critical Action: Erase this license from registry?')) {
      await deleteDoc(doc(db, 'keys', id));
      onRefresh();
    }
  };

  const handleToggle = async (k: LicenseKey) => {
    await updateDoc(doc(db, 'keys', k.id), { isActive: !k.isActive });
    onRefresh();
  };

  const getStatus = (k: LicenseKey) => {
    if (!k.isActive) return { l: 'BLOCKED', c: 'text-slate-500 bg-slate-900 border-slate-800' };
    if (k.expiresAt && Date.now() > k.expiresAt) return { l: 'EXPIRED', c: 'text-red-400 bg-red-500/5 border-red-500/10' };
    return { l: 'ACTIVE', c: 'text-cyan-400 bg-cyan-500/5 border-cyan-500/10' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-center space-x-4">
           <div className="px-6 py-3 bg-slate-900/40 rounded-2xl border border-white/5 shadow-inner flex items-center space-x-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Keys:</span>
              <span className="text-[12px] font-black text-cyan-400 font-mono">{filtered.length}</span>
           </div>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            placeholder="Search Registry..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-slate-950/50 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs text-white outline-none focus:border-cyan-500/40 w-full md:w-80 font-bold transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="cyber-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-slate-950/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-white/5 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                <th className="px-8 py-6">Identity Node</th>
                <th className="px-8 py-6">Encryption Cipher</th>
                <th className="px-8 py-6">Temporal Limit</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {current.map(k => {
                const s = getStatus(k);
                return (
                  <tr key={k.id} className="hover:bg-cyan-500/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black italic uppercase text-sm text-slate-200 tracking-tight">{k.game}</span>
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">ID: {k.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <code className="bg-black/60 px-5 py-3 rounded-2xl border border-white/5 text-cyan-400 font-mono text-[11px] tracking-widest shadow-inner group-hover:border-cyan-500/30 transition-all">
                          {k.keyString}
                        </code>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => handleCopy(k.keyString, k.id)} 
                            className="p-2.5 text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all"
                            title="Copy Key"
                          >
                            {copied === k.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleCopyLink(k.keyString, k.id)} 
                            className="p-2.5 text-slate-600 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all"
                            title="Copy API Link"
                          >
                            {linkCopied === k.id ? <CheckCircle2 className="w-4 h-4 text-purple-400" /> : <Link2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-900/60 px-4 py-2 rounded-xl border border-white/5">
                        <Clock className="w-3.5 h-3.5 mr-2.5 text-purple-500" />
                        {k.durationLabel}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-5 py-2 rounded-xl text-[9px] font-black border tracking-[0.2em] transition-all inline-block min-w-[100px] ${s.c}`}>
                        {s.l}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button 
                          onClick={() => handleToggle(k)} 
                          className={`p-3 rounded-xl transition-all ${k.isActive ? 'text-slate-600 hover:text-orange-400' : 'text-orange-400 bg-orange-500/10'}`}
                        >
                          <ShieldAlert className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(k.id)} 
                          className="p-3 text-slate-600 hover:text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {total > 1 && (
          <div className="px-10 py-8 bg-slate-950/80 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">
              Page <span className="text-cyan-400">{page}</span> / <span className="text-slate-500">{total}</span>
            </span>
            <div className="flex items-center space-x-4">
              <button 
                disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-3 text-slate-500 hover:text-white disabled:opacity-20 bg-slate-900/60 rounded-xl border border-white/5"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                disabled={page === total} onClick={() => setPage(p => p + 1)}
                className="p-3 text-slate-500 hover:text-white disabled:opacity-20 bg-slate-900/60 rounded-xl border border-white/5"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
