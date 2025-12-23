
import React, { useState } from 'react';
import { X, Clock, Zap, Loader2, Sparkles } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { KeyStatus, UserData } from '../types';

const DURATIONS = [
  { label: '1 Hour', mins: 60 }, { label: '2 Hours', mins: 120 }, { label: '3 Hours', mins: 180 }, { label: '5 Hours', mins: 300 },
  { label: '1 Day', mins: 1440 }, { label: '2 Days', mins: 2880 }, { label: '3 Days', mins: 4320 }, { label: '5 Days', mins: 7200 },
  { label: '10 Days', mins: 14400 }, { label: '30 Days', mins: 43200 },
];

export const GenerateKeyModal: React.FC<{ userId: string; userData: UserData | null; onClose: () => void; onSuccess: () => void }> = ({ userId, userData, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState('PUBG');
  const [duration, setDuration] = useState(DURATIONS[0]);

  const generate = async () => {
    setLoading(true);
    try {
      const key = 'VENOM-' + Math.random().toString(36).substring(2, 14).toUpperCase();
      const mins = (userData?.isVIP || userData?.isAdmin) ? duration.mins : 60;
      const label = (userData?.isVIP || userData?.isAdmin) ? duration.label : '1 Hour';

      await addDoc(collection(db, 'keys'), {
        game, keyString: key, deviceLimit: 1, deviceCount: 0, durationMinutes: mins,
        durationLabel: label, status: KeyStatus.ACTIVE, userId, createdAt: Date.now(),
        expiresAt: Date.now() + (mins * 60 * 1000), isActive: true,
      });

      await updateDoc(doc(db, 'users', userId), { trialUsed: true });
      onSuccess();
      onClose();
    } catch (e) { alert('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="cyber-card w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/30">
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center">
            <Sparkles className="w-5 h-5 mr-3 text-cyan-400" />
            License Deployment
          </h3>
          <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Protocol</p>
            <div className="grid grid-cols-2 gap-3">
              {['PUBG', 'FREEFIRE', 'CODM', 'OTHER'].map(g => (
                <button 
                  key={g} onClick={() => setGame(g)}
                  className={`py-4 rounded-2xl border font-black text-[10px] tracking-widest uppercase italic transition-all ${game === g ? 'bg-cyan-600 border-cyan-400 text-white shadow-xl shadow-cyan-950' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Time Sequence</p>
            {(userData?.isVIP || userData?.isAdmin) ? (
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {DURATIONS.map(d => (
                  <button 
                    key={d.mins} onClick={() => setDuration(d)}
                    className={`py-3 rounded-xl border text-[9px] font-black transition-all ${duration.mins === d.mins ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-5 bg-slate-950 border border-white/5 rounded-2xl text-center text-cyan-400 font-black italic tracking-widest border-dashed text-[10px]">
                TRIAL MODULE: 1 HOUR FIXED
              </div>
            )}
          </div>

          <button 
            disabled={loading} onClick={generate}
            className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-950 transition-all flex items-center justify-center uppercase tracking-widest italic text-xs"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Execute Generation'}
          </button>
        </div>
      </div>
    </div>
  );
};
