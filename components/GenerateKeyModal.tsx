
import React, { useState } from 'react';
import { X, ShieldAlert, Zap, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { KeyStatus, UserData } from '../types';

const DURATIONS = [
  { label: '1 Hour', mins: 60 }, { label: '3 Hours', mins: 180 }, { label: '5 Hours', mins: 300 },
  { label: '1 Day', mins: 1440 }, { label: '3 Days', mins: 4320 }, { label: '7 Days', mins: 10080 },
  { label: '30 Days', mins: 43200 },
];

export const GenerateKeyModal: React.FC<{ userId: string; userData: UserData | null; onClose: () => void; onSuccess: () => void }> = ({ userId, userData, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [game, setGame] = useState('PUBG');
  const [duration, setDuration] = useState(DURATIONS[0]);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    
    try {
      const generatedKey = 'VENOM-' + Math.random().toString(36).substring(2, 12).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      
      const mins = (userData?.isVIP || userData?.isAdmin) ? duration.mins : 60;
      const label = (userData?.isVIP || userData?.isAdmin) ? duration.label : '1 Hour Trial';

      const keyData = {
        game,
        keyString: generatedKey,
        deviceLimit: 1,
        deviceCount: 0,
        durationMinutes: mins,
        durationLabel: label,
        status: KeyStatus.ACTIVE,
        userId: userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + (mins * 60 * 1000),
        isActive: true,
      };

      console.log("Attempting to create key:", keyData);

      const docRef = await addDoc(collection(db, 'keys'), keyData);
      
      if (docRef.id) {
        // Only update trial if user is not VIP/Admin
        if (!userData?.isVIP && !userData?.isAdmin) {
          await updateDoc(doc(db, 'users', userId), { trialUsed: true });
        }
        
        setSuccess(true);
        onSuccess();
        setTimeout(() => onClose(), 1500);
      }
    } catch (err: any) {
      console.error("Critical Error during key generation:", err);
      setError(err.message || "Server connection failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)] relative">
        
        {/* Progress bar for loading state */}
        {loading && <div className="absolute top-0 left-0 h-1 bg-cyan-500 animate-[loading_1s_infinite]"></div>}

        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl">
               <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Deployment Terminal</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-10 space-y-8">
          {success ? (
            <div className="py-10 flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-500">
               <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
               </div>
               <p className="text-green-400 font-black uppercase tracking-widest text-sm">License Active</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Target Protocol</label>
                <div className="grid grid-cols-2 gap-3">
                  {['PUBG', 'FREEFIRE', 'CODM', 'OTHER'].map(g => (
                    <button 
                      key={g} onClick={() => setGame(g)}
                      className={`py-4 rounded-2xl border font-black text-[11px] tracking-widest uppercase italic transition-all ${game === g ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-950 scale-105' : 'bg-slate-950 border-white/5 text-slate-600 hover:border-white/10'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Duration Allocation</label>
                {(userData?.isVIP || userData?.isAdmin) ? (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {DURATIONS.map(d => (
                      <button 
                        key={d.mins} onClick={() => setDuration(d)}
                        className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all ${duration.mins === d.mins ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-950' : 'bg-slate-950 border-white/5 text-slate-600 hover:text-slate-400'}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-950 border border-dashed border-cyan-500/30 rounded-2xl flex flex-col items-center justify-center space-y-2">
                    <p className="text-cyan-400 font-black italic text-xs tracking-widest">TRIAL MODULE DETECTED</p>
                    <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">Fixed: 1 Hour Session</p>
                  </div>
                )}
              </div>

              <button 
                disabled={loading} onClick={generate}
                className={`w-full py-6 btn-primary text-white font-black rounded-2xl transition-all flex items-center justify-center uppercase tracking-widest italic text-xs space-x-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Deploy License</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; left: 0; }
          50% { width: 50%; left: 25%; }
          100% { width: 0%; left: 100%; }
        }
      `}</style>
    </div>
  );
};
