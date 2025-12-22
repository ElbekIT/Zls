
import React, { useState } from 'react';
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
    if (window.confirm('Are you sure you want to delete this key?')) {
      await deleteDoc(doc(db, 'keys', id));
      onRefresh();
    }
  };

  const handleToggleStatus = async (key: LicenseKey) => {
    const newActive = !key.isActive;
    await updateDoc(doc(db, 'keys', key.id), {
      isActive: newActive,
      status: newActive ? (key.expiresAt ? KeyStatus.ACTIVE : KeyStatus.NOT_STARTED) : KeyStatus.BLOCKED
    });
    onRefresh();
  };

  const getStatusStyle = (status: KeyStatus, isActive: boolean) => {
    if (!isActive) return 'bg-red-500/10 text-red-400 border-red-500/20';
    switch (status) {
      case KeyStatus.ACTIVE: return 'bg-green-500/10 text-green-400 border-green-500/20';
      case KeyStatus.NOT_STARTED: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case KeyStatus.EXPIRED: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">Show</span>
          <select 
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-sm text-slate-300 outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {[10, 25, 50].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <span className="text-sm text-slate-400">entries</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search keys or games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="glass rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Game</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">VIP Key</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Devices</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Duration</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {currentKeys.length > 0 ? currentKeys.map((k, idx) => (
                <tr key={k.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-slate-500 font-mono text-xs">{(currentPage - 1) * entriesPerPage + idx + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                      <span className="text-slate-200 font-semibold">{k.game}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <code className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-cyan-400 font-mono text-sm tracking-wider">
                        {k.keyString}
                      </code>
                      <button 
                        onClick={() => handleCopy(k.keyString, k.id)}
                        className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
                      >
                        {copiedId === k.id ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center text-xs font-medium text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                      <Smartphone className="w-3 h-3 mr-1" />
                      {k.deviceCount} / {k.deviceLimit}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center text-xs font-medium text-slate-400">
                      <Clock className="w-3.5 h-3.5 mr-1 text-purple-400" />
                      {k.durationLabel}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(k.status, k.isActive)}`}>
                      {k.isActive ? k.status : 'DISABLED'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        title="View Info"
                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-all"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(k)}
                        title={k.isActive ? "Block Key" : "Unblock Key"}
                        className={`p-2 rounded-lg transition-all ${k.isActive ? 'text-slate-400 hover:text-orange-400 hover:bg-orange-500/10' : 'text-orange-400 bg-orange-500/10 hover:text-green-400'}`}
                      >
                        <ShieldAlert className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(k.id)}
                        title="Delete Key"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <XCircle className="w-10 h-10 mb-2 opacity-20" />
                      <p>No keys found in your database.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredKeys.length > 0 && (
          <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing <span className="text-slate-300 font-medium">{Math.min(filteredKeys.length, (currentPage - 1) * entriesPerPage + 1)}</span> to <span className="text-slate-300 font-medium">{Math.min(filteredKeys.length, currentPage * entriesPerPage)}</span> of <span className="text-slate-300 font-medium">{filteredKeys.length}</span> entries
            </span>
            <div className="flex items-center space-x-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                      currentPage === page 
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' 
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
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
