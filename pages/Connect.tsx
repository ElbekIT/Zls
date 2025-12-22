
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

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

      // Check expiry logic
      if (data.expiresAt && Date.now() > data.expiresAt) {
        setStatus({ result: 'expired', message: 'License expired' });
        return;
      }

      setStatus({ result: 'valid', message: 'Authentication successful', game: data.game });
    };

    validate();
  }, [key]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass p-8 rounded-3xl border border-slate-800 max-w-sm w-full font-mono text-center">
        <h2 className="text-cyan-500 font-black mb-4 tracking-tighter">VENOM-SECURE-BRIDGE</h2>
        <div className="bg-slate-950 p-4 rounded-xl text-left">
          <pre className="text-xs text-green-500 whitespace-pre-wrap">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
        <p className="mt-4 text-[10px] text-slate-700 uppercase font-black tracking-widest">Encrypted Tunnel Active</p>
      </div>
    </div>
  );
};

export default Connect;
