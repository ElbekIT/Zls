
import React, { useState, useEffect } from 'react';
import { 
  Trash2, Copy, Eye, ShieldAlert, Search, 
  ChevronLeft, ChevronRight, CheckCircle2, 
  XCircle, Clock, Smartphone, MoreHorizontal
} from 'lucide-react';
import { LicenseKey, KeyStatus } from '../types';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface KeyTableProps {
  keys: LicenseKey[];
  onRefresh: () => void;
}

export const KeyTable: React.FC<KeyTableProps> = ({ keys, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Update time every minute to refresh "EXPIRED" labels
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredKeys = keys.filter(k => 
    k.keyString.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.game.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredKeys.length / entriesPerPage);
  const currentKeys = filteredKeys.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Haqiqatdan ham bu keyni o\'chirmoqchimisiz?')) {
      await deleteDoc(doc(db, 'keys', id));
      onRefresh();
    }
  };

  const handleToggleStatus = async (key: LicenseKey) => {
    const newActive = !key.isActive;
    await updateDoc(doc(db, 'keys', key.id), {
      isActive: newActive
    });
    onRefresh();
  };

  const getStatus = (k: LicenseKey) => {
    if (!k.isActive) return 'BLOCKED';
    if (k.expiresAt && now > k.expiresAt) return 'EXPIRED';
    return k.status || 'ACTIVE';
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'EXPIRED': return 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
      case 'BLOCKED': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'NOT_STARTED': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400 font-bold uppercase tracking-wider text-[10px]">Show</span>
          <select 
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-sm text-slate-300 outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
          >
            {[10, 25, 50].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all font-bold"
          />
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-slate-800/50 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Game</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">VIP Key</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Duration</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {currentKeys.length > 0 ? currentKeys.map((k, idx) => {
                const status = getStatus(k);
                return (
                  <tr key={k.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-mono text-xs">{(currentPage - 1) * entriesPerPage + idx + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-200 font-black italic uppercase text-xs tracking-tight">{k.game}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <code className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-cyan-500 font-mono text-xs tracking-widest shadow-inner">
                          {k.keyString}
                        </code>
                        <button 
                          onClick={() => handleCopy(k.keyString, k.id)}
                          className="p-2 text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                        >
                          {copiedId === k.id ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center text-[10px] font-black text-purple-400 uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5 mr-2" />
                        {k.durationLabel}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleToggleStatus(k)}
                          title={k.isActive ? "Block Key" : "Unblock Key"}
                          className={`p-2 rounded-xl transition-all ${k.isActive ? 'text-slate-600 hover:text-orange-400 hover:bg-orange-500/10' : 'text-orange-400 bg-orange-500/10 hover:text-green-400'}`}
                        >
                          <ShieldAlert className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(k.id)}
                          title="Delete Key"
                          className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-600">
                    <div className="flex flex-col items-center">
                      <XCircle className="w-12 h-12 mb-4 opacity-10" />
                      <p className="font-black uppercase tracking-widest text-xs">Hech qanday ma'lumot topilmadi</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredKeys.length > 0 && (
          <div className="px-8 py-6 bg-slate-950/50 border-t border-slate-800/50 flex items-center justify-between">
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
              Sahifa <span className="text-slate-400">{currentPage}</span> / <span className="text-slate-400">{totalPages}</span>
            </span>
            <div className="flex items-center space-x-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-all bg-slate-900 rounded-xl border border-slate-800"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-all bg-slate-900 rounded-xl border border-slate-800"
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
