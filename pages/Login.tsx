import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Crown, Lock, User as UserIcon, Mail, Loader2, ArrowRight } from 'lucide-react';

const USER_LIMIT = 5;

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const q = query(collection(db, 'users'), where('isAdmin', '==', false));
        const snap = await getDocs(q);
        setUserCount(snap.size);
      } catch (e) { console.warn(e); }
    };
    fetchStats();
  }, [isRegistering]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedUsername = username.toLowerCase().trim();

    try {
      if (isRegistering) {
        const countQuery = query(collection(db, 'users'), where('isAdmin', '==', false));
        const countSnap = await getDocs(countQuery);
        
        if (countSnap.size >= USER_LIMIT) {
          throw new Error("SISTEMA TO'LA: Hozirda VIP o'rinlar qolmagan.");
        }
        
        const uQuery = query(collection(db, 'users'), where('username', '==', formattedUsername));
        const uSnap = await getDocs(uQuery);
        if (!uSnap.empty) throw new Error("BAND: Bu username allaqachon olingan.");

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const isAdmin = formattedUsername === 'elbekgamer' && password === '79178195327';

        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          username: formattedUsername,
          email: email.trim(),
          isAdmin,
          isVIP: isAdmin,
          vipUntil: isAdmin ? 4102444800000 : null,
          createdAt: Date.now(),
          trialUsed: false
        });

        await updateProfile(cred.user, { displayName: formattedUsername });
        setError("Success: Akkaunt yaratildi. Kirishingiz mumkin.");
        setIsRegistering(false);
      } else {
        const q = query(collection(db, 'users'), where('username', '==', formattedUsername));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          if (formattedUsername === 'elbekgamer' && password === '79178195327') {
             await signInWithEmailAndPassword(auth, 'elbekgamer@elbek.panel', password);
          } else {
            throw new Error("XATO: Bunday profil topilmadi.");
          }
        } else {
          await signInWithEmailAndPassword(auth, snap.docs[0].data().email, password);
        }
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.05),transparent_70%)]"></div>
      
      <div className="w-full max-w-md relative">
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex p-6 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-soft">
            <Crown className="w-12 h-12 text-amber-500 gold-glow" />
          </div>
          <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
            ELBEK<span className="text-amber-500">PANEL</span>
          </h1>
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-[1em] opacity-40">Prestige Management System</p>
        </div>

        <div className="gold-card rounded-[3rem] border border-white/5 overflow-hidden">
          <div className="p-12">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{isRegistering ? 'Register' : 'Login'}</h2>
              {isRegistering && (
                <span className="text-[9px] font-black px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 uppercase">
                  {Math.max(0, USER_LIMIT - userCount)} Slots
                </span>
              )}
            </div>

            {error && (
              <div className={`mb-8 p-4 rounded-2xl text-[10px] font-bold text-center border ${error.includes('Success') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              {isRegistering && (
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-white outline-none focus:border-amber-500/40 transition-all font-bold"
                  />
                </div>
              )}
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-white outline-none focus:border-amber-500/40 transition-all font-bold"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-white outline-none focus:border-amber-500/40 transition-all font-bold"
                />
              </div>

              <button 
                disabled={loading}
                className="w-full py-5 btn-gold text-slate-950 font-black rounded-2xl flex items-center justify-center uppercase tracking-widest text-[11px] italic"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>{isRegistering ? 'Create Access' : 'Enter Panel'}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>

          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="w-full py-7 bg-slate-950/50 border-t border-white/5 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] hover:text-amber-500 transition-all"
          >
            {isRegistering ? 'Back to Login' : 'Request Registry Access'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;