
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Shield, Lock, User as UserIcon, Mail, Zap, Loader2, ArrowRight, ShieldAlert } from 'lucide-react';

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
      } catch (e) { 
        console.warn("Permission check pending: Rules must be published on Firebase Console.");
      }
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
        // Double check count before registration
        const countQuery = query(collection(db, 'users'), where('isAdmin', '==', false));
        const countSnap = await getDocs(countQuery);
        
        if (countSnap.size >= USER_LIMIT) {
          throw new Error("SYSTEM FULL: Hozirda VIP o'rinlar qolmagan. Admin bilan bog'laning.");
        }
        
        const uQuery = query(collection(db, 'users'), where('username', '==', formattedUsername));
        const uSnap = await getDocs(uQuery);
        if (!uSnap.empty) throw new Error("IDENTITY TAKEN: Bu username allaqachon band qilingan.");

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
        setError("Success: Node created. Authorized for login.");
        setIsRegistering(false);
        setUserCount(prev => prev + 1);
      } else {
        const q = query(collection(db, 'users'), where('username', '==', formattedUsername));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          if (formattedUsername === 'elbekgamer' && password === '79178195327') {
             // Special case for root admin login if first time
             await signInWithEmailAndPassword(auth, 'elbekgamer@venom.vip', password);
          } else {
            throw new Error("ACCESS DENIED: Bunday profil topilmadi.");
          }
        } else {
          await signInWithEmailAndPassword(auth, snap.docs[0].data().email, password);
        }
      }
    } catch (err: any) {
      let msg = err.message.replace('Firebase:', '').trim();
      if (msg.includes('insufficient permissions')) {
        msg = "FIREBASE ERROR: Iltimos, Firebase Console'da 'Rules' bo'limiga kodni qo'ying va 'Publish' tugmasini bosing.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#010409] relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[150px] animate-pulse duration-700"></div>
      </div>

      <div className="w-full max-w-md relative animate-in zoom-in-95 duration-700">
        <div className="text-center mb-12">
          <div className="inline-flex p-5 rounded-[2rem] bg-cyan-600/10 border border-cyan-500/20 mb-8 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
            <Shield className="w-14 h-14 text-cyan-400" />
          </div>
          <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none neon-glow">
            VENOM<span className="text-cyan-500">KEY</span>
          </h1>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.8em] mt-4 opacity-50">Advanced_Identity_Matrix</p>
        </div>

        <div className="cyber-card rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
          <div className="p-12">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{isRegistering ? 'Initialize' : 'Authorize'}</h2>
              {isRegistering && (
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 uppercase tracking-widest animate-pulse">
                    {Math.max(0, USER_LIMIT - userCount)} Slots Left
                   </span>
                </div>
              )}
            </div>

            {error && (
              <div className={`mb-8 p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border animate-in slide-in-from-top-4 ${error.includes('Success') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              {isRegistering && (
                <div className="group relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-cyan-500 transition-colors" />
                  <input 
                    type="email" placeholder="Protocol: Email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-sm text-slate-200 outline-none focus:border-cyan-500/40 transition-all font-bold placeholder:text-slate-800"
                  />
                </div>
              )}
              <div className="group relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-cyan-500 transition-colors" />
                <input 
                  type="text" placeholder="Protocol: Username" value={username} onChange={e => setUsername(e.target.value)} required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-sm text-slate-200 outline-none focus:border-cyan-500/40 transition-all font-bold placeholder:text-slate-800"
                />
              </div>
              <div className="group relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-cyan-500 transition-colors" />
                <input 
                  type="password" placeholder="Protocol: Password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-sm text-slate-200 outline-none focus:border-cyan-500/40 transition-all font-bold placeholder:text-slate-800"
                />
              </div>

              <button 
                disabled={loading}
                className="w-full py-6 btn-elite text-white font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center uppercase tracking-[0.4em] text-[11px] italic"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>{isRegistering ? 'Register Node' : 'Initialize Session'}</span>
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </>
                )}
              </button>
            </form>
          </div>

          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="w-full py-8 bg-slate-900/40 border-t border-white/5 text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] hover:text-cyan-400 hover:bg-slate-900 transition-all"
          >
            {isRegistering ? 'Back to Login Protocol' : 'Request New Identity Node'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
