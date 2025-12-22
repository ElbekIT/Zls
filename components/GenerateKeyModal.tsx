
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

const VIP_OPTIONS = [
  { label: '1 Hour', mins: 60 },
  { label: '2 Hours', mins: 120 },
  { label: '3 Hours', mins: 180 },
  { label: '1 Day', mins: 1440 },
  { label: '7 Days', mins: 10080 },
  { label: '30 Days', mins: 43200 },
];

export const GenerateKeyModal: React.FC<GenerateKeyModalProps> = ({ userId, userData, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(userData?.isVIP ? VIP_OPTIONS[0] : { label: '1 Hour', mins: 60 });
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
        keysCreated: increment(1)
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass w-full max-w-md rounded-3xl overflow-hidden border border-slate-700/30 shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h3 className="text-xl font-black text-white italic uppercase italic tracking-tight flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
            New VIP Node
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!userData?.isVIP && (
             <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl text-yellow-400 text-xs font-bold leading-relaxed">
               Trial Mode Active: You can only generate one 1-hour key. For longer access, contact admin.
             </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Target Application</label>
            <div className="grid grid-cols-2 gap-3">
              {['PUBG', 'FREEFIRE', 'CODM', 'OTHER'].map(g => (
                <button 
                  key={g} 
                  type="button"
                  onClick={() => setGame(g)}
                  className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all ${game === g ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Duration Pulse</label>
            {userData?.isVIP ? (
              <div className="grid grid-cols-3 gap-2">
                {VIP_OPTIONS.map(opt => (
                  <button
                    key={opt.mins}
                    type="button"
                    onClick={() => setSelectedDuration(opt)}
                    className={`px-2 py-3 text-[10px] font-black rounded-xl border transition-all ${selectedDuration.mins === opt.mins ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-cyan-400 font-bold">
                1 HOUR TRIAL
              </div>
            )}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-900/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-widest italic"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'INITIALIZE LICENSE'}
          </button>
        </form>
      </div>
    </div>
  );
};
