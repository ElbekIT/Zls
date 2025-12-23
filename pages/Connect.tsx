
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Crown } from 'lucide-react';

const Connect: React.FC = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<any>(null);
  const key = params.get('key');

  useEffect(() => {
    const validate = async () => {
      if (!key) {
        setStatus({ result: 'invalid', message: 'No key provided' });
        return;
      }

      const q = query(collection(db, 'keys'), where('keyString', '==', key));
      const snap = await getDocs(q);

      if (snap.empty) {
        setStatus({ result: 'invalid', message: 'Key not found' });
        return;
      }

      const data = snap.docs[0].data();
      if (!data.isActive) {
        setStatus({ result: 'blocked', message: 'This key has been blocked' });
        return;
      }

      if (data.expiresAt && Date.now() > data.expiresAt) {
        setStatus({ result: 'expired', message: 'License expired' });
        return;
      }

      setStatus({ result: 'valid', message: 'Authenticated', game: data.game });
    };

    validate();
  }, [key]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617]">
      <div className="gold-card p-10 rounded-[2.5rem] border border-white/5 max-w-sm w-full font-mono text-center">
        <Crown className="w-10 h-10 text-amber-500 mx-auto mb-6 gold-glow" />
        <h2 className="text-white font-black mb-6 tracking-tight uppercase italic">Elbek Secure Bridge</h2>
        <div className="bg-slate-950 p-6 rounded-2xl text-left border border-white/5">
          <pre className="text-[11px] text-amber-400 whitespace-pre-wrap">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
        <p className="mt-6 text-[9px] text-slate-600 uppercase font-black tracking-widest">Protocol Encrypted</p>
      </div>
    </div>
  );
};

export default Connect;