import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Crown, ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

const Connect: React.FC = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const key = params.get('key');

  useEffect(() => {
    const validate = async () => {
      if (!key) {
        setStatus({ result: 'missing_key', message: 'Auth key required in URL parameter (?key=...)' });
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'keys'), where('keyString', '==', key));
        const snap = await getDocs(q);

        if (snap.empty) {
          setStatus({ result: 'invalid', message: 'Encryption key not found in registry' });
        } else {
          const data = snap.docs[0].data();
          if (!data.isActive) {
            setStatus({ result: 'blocked', message: 'This node has been remotely disabled' });
          } else if (data.expiresAt && Date.now() > data.expiresAt) {
            setStatus({ result: 'expired', message: 'Temporal access limit reached' });
          } else {
            setStatus({ 
              result: 'success', 
              status: 'AUTHORIZED',
              game: data.game,
              expires: new Date(data.expiresAt!).toLocaleString(),
              timestamp: Date.now()
            });
          }
        }
      } catch (e) {
        setStatus({ result: 'error', message: 'Neural link interrupted' });
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [key]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.03),transparent_70%)]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="gold-card p-10 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-6 animate-soft">
              <Crown className="w-8 h-8 text-amber-500 gold-glow" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              Secure <span className="text-amber-500">Bridge</span>
            </h2>
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] mt-2 opacity-50">API Authentication Protocol</p>
          </div>

          <div className="bg-slate-950/80 p-6 rounded-[2rem] border border-white/5 relative group">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-900 border border-white/10 rounded-lg">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">System Response</span>
            </div>
            
            {loading ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Validating...</span>
              </div>
            ) : (
              <pre className="text-[11px] font-mono text-amber-400 whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(status, null, 2)}
              </pre>
            )}
          </div>

          <div className="mt-10 flex flex-col space-y-4">
            {!loading && status?.result !== 'success' && (
              <div className="flex items-center space-x-3 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-tight leading-tight">
                  {status?.message}
                </p>
              </div>
            )}
            
            <Link 
              to="/dashboard" 
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all flex items-center justify-center group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Return to Command Center
            </Link>
          </div>

          <div className="mt-8 text-center">
             <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.3em]">
               Encryption: AES-256-GCM • ElbekPanel v3.1
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;