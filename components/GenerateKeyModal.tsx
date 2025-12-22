
import React, { useState } from 'react';
import { X, Clock, Gamepad2, Sparkles, Loader2 } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { KeyStatus, UserData } from '../types';

interface GenerateKeyModalProps {
  userId: string;
  userData: UserData | null;
  onClose: () => void;
  onSuccess: () => void;
}

const VIP_DURATIONS = [
  { label: '1 Hour', mins: 60 },
  { label: '2 Hours', mins: 120 },
  { label: '3 Hours', mins: 180 },
  { label: '5 Hours', mins: 300 },
  { label: '1 Day', mins: 1440 },
  { label: '2 Days', mins: 2880 },
  { label: '3 Days', mins: 4320 },
  { label: '5 Days', mins: 7200 },
  { label: '10 Days', mins: 14400 },
  { label: '20 Days', mins: 28800 },
  { label: '30 Days', mins: 43200 },
];

export const GenerateKeyModal: React.FC<GenerateKeyModalProps> = ({ userId, userData, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(userData?.isVIP || userData?.isAdmin ? VIP_DURATIONS[0] : { label: '1 Hour', mins: 60 });
  const [game, setGame] = useState('PUBG');

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'VENOM-';
    for (let i = 0; i < 12; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const keyString = generateRandomKey();
      const expiresAt = Date.now() + (selectedDuration.mins * 60 * 1000);
      
      await addDoc(collection(db, 'keys'), {
        game,
        keyString,
        deviceLimit: 1,
        deviceCount: 0,
        durationMinutes: selectedDuration.mins,
        durationLabel: selectedDuration.label,
        status: KeyStatus.ACTIVE,
        userId,
        createdAt: Date.now(),
        expiresAt: expiresAt,
        isActive: true,
      });

      await updateDoc(doc(db, 'users', userId), {
        keysCreated: increment(1),
        trialUsed: true
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Generation Failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="glass w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl animate-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center">
            <Sparkles className="w-6 h-6 mr-3 text-cyan-400" />
            Initialize License
          </h3>
          <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {!userData?.isVIP && !userData?.isAdmin && (
             <div className="bg-cyan-500/10 border border-cyan-500/30 p-5 rounded-3xl text-cyan-400 text-xs font-bold leading-relaxed italic">
               TRIAL MODE: Siz faqat bir marta va faqat 1 soatlik key yarata olasiz. Ko'proq vaqt uchun admin bilan bog'laning.
             </div>
          )}

          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Application Target</label>
            <div className="grid grid-cols-2 gap-3">
              {['PUBG', 'FREEFIRE', 'CODM', 'OTHER'].map(g => (
                <button 
                  key={g} 
                  type="button"
                  onClick={() => setGame(g)}
                  className={`py-4 px-6 rounded-2xl border font-black text-xs transition-all uppercase italic tracking-widest ${game === g ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-900/30' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">License Duration</label>
            {(userData?.isVIP || userData?.isAdmin) ? (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {VIP_DURATIONS.map(opt => (
                  <button
                    key={opt.mins}
                    type="button"
                    onClick={() => setSelectedDuration(opt)}
                    className={`px-2 py-4 text-[10px] font-black rounded-xl border transition-all italic ${selectedDuration.mins === opt.mins ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/30' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl text-center text-cyan-500 font-black italic tracking-widest border-dashed">
                1 HOUR PULSE ACTIVATED
              </div>
            )}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-6 bg-gradient-to-r from-cyan-600 to-cyan-400 text-white font-black rounded-2xl shadow-2xl shadow-cyan-900/50 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] italic text-sm mt-4 border border-cyan-400/30"
          >
            {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : 'GENERATE ENCRYPTED KEY'}
          </button>
        </form>
      </div>
    </div>
  );
};
