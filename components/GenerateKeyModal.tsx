
import React, { useState } from 'react';
import { X, ShieldAlert, Zap, Loader2, Sparkles, AlertCircle, CheckCircle2, Terminal, ShieldCheck, Clock } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { KeyStatus, UserData } from '../types';

const DURATIONS = [
  { label: '1 Hour Trial', mins: 60 }, 
  { label: '3 Hours', mins: 180 }, 
  { label: '5 Hours', mins: 300 },
  { label: '1 Day', mins: 1440 }, 
  { label: '3 Days', mins: 4320 }, 
  { label: '7 Days', mins: 10080 },
  { label: '30 Days', mins: 43200 },
];

export const GenerateKeyModal: React.FC<{ userId: string; userData: UserData | null; onClose: () => void; onSuccess: () => void }> = ({ userId, userData, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [game, setGame] = useState('PUBG');
  const [duration, setDuration] = useState(DURATIONS[0]);

  const generateLicense = async () => {
    if (loading) return;
    
    // Trial check
    if (!userData?.isVIP && !userData?.isAdmin && userData?.trialUsed) {
      setError("SYSTEM: Sinov muddati (Trial) ishlatib bo'lingan.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const rand = () => Math.random().toString(36).substring(2, 7).toUpperCase();
      const generatedKey = `VENOM-${game}-${rand()}-${rand()}`;
      
      const mins = (userData?.isVIP || userData?.isAdmin) ? duration.mins : 60;

      const keyPayload = {
        game,
        keyString: generatedKey,
        deviceLimit: 1,
        deviceCount: 0,
        durationMinutes: mins,
        durationLabel: (userData?.isVIP || userData?.isAdmin) ? duration.label : '1 Hour Trial',
        status: KeyStatus.ACTIVE,
        userId: userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + (mins * 60 * 1000),
        isActive: true,
      };

      await addDoc(collection(db, 'keys'), keyPayload);
      
      // Mark trial as used
      if (!userData?.isVIP && !userData?.isAdmin) {
        await updateDoc(doc(db, 'users', userId), { trialUsed: true });
      }
      
      setSuccess(true);
      onSuccess();
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="cyber-card w-full max-w-md rounded-[2.5rem] overflow-hidden border border-cyan-500/20">
        <div className="px-8 py-6 bg-slate-900/60 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center space-x-3">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Key Generator</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {success ? (
            <div className="py-10 text-center space-y-4 animate-in zoom-in duration-500">
               <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-400 mx-auto">
                 <ShieldCheck className="w-10 h-10 text-cyan-400" />
               </div>
               <p className="text-white font-black uppercase italic">License Deployed!</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                  <Zap className="w-3 h-3 mr-2 text-cyan-500" /> Game Node
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['PUBG', 'FREEFIRE', 'CODM', 'GTAV'].map(g => (
                    <button 
                      key={g} onClick={() => setGame(g)}
                      className={`py-3 rounded-xl border text-[10px] font-black transition-all ${game === g ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                  <Clock className="w-3 h-3 mr-2 text-purple-500" /> Temporal Limit
                </label>
                {(userData?.isVIP || userData?.isAdmin) ? (
                  <div className="grid grid-cols-3 gap-2">
                    {DURATIONS.map(d => (
                      <button 
                        key={d.mins} onClick={() => setDuration(d)}
                        className={`py-2 rounded-lg border text-[9px] font-black transition-all ${duration.mins === d.mins ? 'bg-purple-500/10 border-purple-500 text-white' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 border border-dashed border-white/10 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Locked: Trial Mode (1H Only)</p>
                  </div>
                )}
              </div>

              <button 
                disabled={loading} onClick={generateLicense}
                className="w-full py-5 btn-elite text-white font-black rounded-xl uppercase tracking-[0.3em] text-[11px] flex items-center justify-center italic shadow-[0_0_30px_rgba(6,182,212,0.2)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize Generation'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
