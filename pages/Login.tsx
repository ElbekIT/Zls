
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Shield, Lock, User as UserIcon, Mail, Zap, Loader2, ArrowRight } from 'lucide-react';

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
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedUsername = username.toLowerCase().trim();

    try {
      if (isRegistering) {
        if (userCount >= USER_LIMIT) throw new Error("VIP Slot Limit Reached.");
        
        const uQuery = query(collection(db, 'users'), where('username', '==', formattedUsername));
        const uSnap = await getDocs(uQuery);
        if (!uSnap.empty) throw new Error("Username already active.");

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const isAdmin = formattedUsername === 'elbekgamer' && password === '79178195327';

        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          username: formattedUsername,
          email: email.trim(),
          isAdmin,
          isVIP: isAdmin,
          vipUntil: isAdmin ? 4102444800000 : null,
          createdAt: Date.now()
        });

        await updateProfile(cred.user, { displayName: formattedUsername });
        setError("Success! Log in now.");
        setIsRegistering(false);
      } else {
        const q = query(collection(db, 'users'), where('username', '==', formattedUsername));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          if (formattedUsername === 'elbekgamer' && password === '79178195327') {
            await signInWithEmailAndPassword(auth, 'elbekgamer@venom.vip', password);
          } else {
            throw new Error("Identity not found. Register first.");
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-cyan-600/20 border border-cyan-500/20 mb-6 shadow-2xl shadow-cyan-950">
            <Shield className="w-12 h-12 text-cyan-400" />
          </div>
          <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
            VENOM<span className="text-cyan-500">KEY</span>
          </h1>
          <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.5em] mt-2">Cybernetic Access Layer</p>
        </div>

        <div className="cyber-card rounded-[2.5rem] overflow-hidden border border-white/5 glow-border">
          <div className="p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white uppercase italic">{isRegistering ? 'Initialize' : 'Authorize'}</h2>
              {isRegistering && (
                <span className="text-[10px] font-black px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
                  {USER_LIMIT - userCount} SLOTS LEFT
                </span>
              )}
            </div>

            {error && (
              <div className={`mb-6 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider border animate-in slide-in-from-top-2 ${error.includes('Success') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              {isRegistering && (
                <div className="group relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                  <input 
                    type="email" placeholder="Protocol: Email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-all font-medium"
                  />
                </div>
              )}
              <div className="group relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                <input 
                  type="text" placeholder="Protocol: Username" value={username} onChange={e => setUsername(e.target.value)} required
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-all font-medium"
                />
              </div>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                <input 
                  type="password" placeholder="Protocol: Password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-all font-medium"
                />
              </div>

              <button 
                disabled={loading}
                className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-950 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center uppercase tracking-widest text-xs italic"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>{isRegistering ? 'Create Profile' : 'Gain Entry'}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>

          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full py-6 bg-slate-900/30 border-t border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-cyan-400 transition-colors"
          >
            {isRegistering ? 'Already Registered? Login' : 'New Identity? Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
