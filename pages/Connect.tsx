import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2 } from 'lucide-react';

const Connect: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const key = params.get('key');

  useEffect(() => {
    if (key) {
      const validate = async () => {
        setLoading(true);
        try {
          const q = query(collection(db, 'keys'), where('keyString', '==', key));
          const snap = await getDocs(q);
          if (snap.empty) {
            setStatus({ result: 'invalid', message: 'Encryption key not found' });
          } else {
            const data = snap.docs[0].data();
            if (!data.isActive) setStatus({ result: 'blocked', message: 'Node disabled' });
            else if (data.expiresAt && Date.now() > data.expiresAt) setStatus({ result: 'expired', message: 'Access expired' });
            else setStatus({ result: 'success', status: 'AUTHORIZED', game: data.game });
          }
        } catch (e) {
          setStatus({ result: 'error', message: 'Link error' });
        } finally {
          setLoading(false);
        }
      };
      validate();
    }
  }, [key]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Main Container - Venom Style */}
      <div className="w-full max-w-[550px] border-[2px] border-cyan-400 rounded-[25px] p-8 md:p-12 bg-black shadow-[0_0_25px_rgba(34,211,238,0.4)] relative">
        
        {/* API Response display (Only when key is present) */}
        {key && (
          <div className="mb-8 p-4 bg-slate-900/30 rounded-xl border border-white/5 font-mono text-[10px] text-amber-400 shadow-inner overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center space-x-2 py-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="tracking-[0.2em] font-bold">CONNECTING_TO_HOST...</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-all opacity-80">
                {JSON.stringify(status || { result: 'pending', target: 'ELBEK_VIP' }, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="text-center space-y-6 mb-10">
          <p className="text-cyan-400 font-bold text-lg md:text-[22px] leading-tight tracking-tight">
            <span className="text-cyan-400">Elbek Gamer VIP Panel</span> is officially active and will remain valid until <span className="text-green-400">2099</span>.
          </p>

          <p className="text-cyan-400 text-base md:text-lg font-bold">
            This panel is completely <span className="text-green-400 font-black">FREE</span> for all users and <span className="text-red-500 font-black">NOT FOR SALE</span>.
          </p>

          <p className="text-cyan-400 text-sm md:text-base leading-relaxed">
            If you want your own <span className="font-black text-cyan-400 underline underline-offset-4">Private / Personal VIP Panel</span> with full security, speed and premium features, contact <span className="text-cyan-400 font-black">Elbek Gamer</span>.
          </p>
          
          <div className="w-full h-[1px] bg-cyan-400/50 my-8 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
        </div>

        {/* Action Buttons - Exact Venom Colors */}
        <div className="flex flex-col space-y-5">
          {/* LOGIN PANEL */}
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-[#00FF8C] text-black font-black text-xl md:text-2xl rounded-xl uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,140,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            Login Panel
          </button>

          {/* JOIN MORE UPDATES */}
          <a 
            href="https://t.me/elbekgamer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#0080FF] text-white font-black text-xl md:text-2xl rounded-xl uppercase tracking-wider text-center shadow-[0_0_20px_rgba(0,128,255,0.4)] hover:brightness-110 active:scale-95 transition-all block"
          >
            Join More Updates
          </a>

          {/* JOIN SUPPORT CHAT */}
          <a 
            href="https://t.me/elbekgamer_chat" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#9600FF] text-white font-black text-xl md:text-2xl rounded-xl uppercase tracking-wider text-center shadow-[0_0_20px_rgba(150,0,255,0.4)] hover:brightness-110 active:scale-95 transition-all block"
          >
            Join Support Chat
          </a>

          {/* CONTACT TO DEVELOPER */}
          <a 
            href="https://t.me/elbekgamer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#FF5500] text-white font-black text-xl md:text-2xl rounded-xl uppercase tracking-wider text-center shadow-[0_0_20px_rgba(255,85,0,0.4)] hover:brightness-110 active:scale-95 transition-all block"
          >
            Contact To Developer
          </a>
        </div>

      </div>

      {/* Footer text */}
      <div className="mt-8 text-cyan-400/20 text-[9px] uppercase tracking-[0.8em] font-black">
        Elbek Gamer • Secure Access Bridge
      </div>

    </div>
  );
};

export default Connect;