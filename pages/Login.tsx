
import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Mail,
  ArrowRight, 
  Loader2, 
  Fingerprint,
  Users
} from 'lucide-react';

const USER_LIMIT = 5;

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userCount, setUserCount] = useState(0);

  // Check user limit on mount
  useEffect(() => {
    const checkUserCount = async () => {
      try {
        const q = query(collection(db, 'users'), where('isAdmin', '==', false));
        const snap = await getDocs(q);
        setUserCount(snap.size);
      } catch (err) {
        console.error("Error checking user count:", err);
      }
    };
    checkUserCount();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedUsername = username.toLowerCase().trim();

    try {
      if (isRegistering) {
        // --- REGISTRATION LOGIC ---
        // 1. Check seat limit
        if (userCount >= USER_LIMIT) {
          throw new Error("Joy qolmadi! VIP uchun faqat 5 ta o'rin bor.");
        }

        // 2. Check if username is taken
        const usernameQuery = query(collection(db, 'users'), where('username', '==', formattedUsername));
        const usernameSnap = await getDocs(usernameQuery);
        if (!usernameSnap.empty) {
          throw new Error("Bu username allaqachon band.");
        }

        // 3. Create Firebase Auth account
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        // 4. Determine if this is the hardcoded Admin
        const isAdmin = formattedUsername === 'elbekgamer' && password === '79178195327';

        // 5. Save to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          username: formattedUsername,
          email: email.trim(),
          isAdmin,
          isVIP: isAdmin,
          vipUntil: isAdmin ? 4102444800000 : null, // Future date
          keysCreated: 0,
          trialUsed: false,
          createdAt: Date.now()
        });

        await updateProfile(userCredential.user, { displayName: formattedUsername });
        
        // Success feedback
        setError("Account muvaffaqiyatli yaratildi! Endi login qiling.");
        setIsRegistering(false);
        // Clear sensitive inputs but keep username for login convenience
        setEmail('');
        setPassword('');
      } else {
        // --- LOGIN LOGIC ---
        let targetEmail = '';

        // Standard User or Admin lookup
        const q = query(collection(db, 'users'), where('username', '==', formattedUsername));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          // If the hardcoded admin doesn't exist yet, we check credentials directly to handle the "Hard Admin" rule
          if (formattedUsername === 'elbekgamer' && password === '79178195327') {
             // Admin hasn't registered yet? This shouldn't happen based on the prompt 
             // but we'll try to find a legacy mapping or fallback.
             targetEmail = 'elbekgamer@venom.vip'; // Fallback mapping
          } else {
            throw new Error("Account topilmadi. Iltimos, oldin ro'yxatdan o'ting.");
          }
        } else {
          targetEmail = snap.docs[0].data().email;
        }

        await signInWithEmailAndPassword(auth, targetEmail, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError("Account topilmadi.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Parol noto'g'ri.");
      } else {
        setError(err.message.replace('Firebase:', '').trim());
      }
    } finally {
      setLoading(false);
    }
  };

  const seatsLeft = USER_LIMIT - userCount;

  return (
    <div className="min-h-screen cyber-gradient flex items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[15%] left-[5%] w-72 h-72 bg-cyan-600/10 blur-[120px] rounded-full animate-pulse"></div>
         <div className="absolute bottom-[15%] right-[5%] w-72 h-72 bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex p-5 rounded-[2rem] bg-cyan-600 shadow-[0_0_50px_rgba(8,145,178,0.5)] mb-6 transform hover:rotate-6 transition-transform">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">
            Venom<span className="text-cyan-500">Key</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[9px]">Elite Cryptographic Panel</p>
        </div>

        <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-800/60 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="p-10">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                {isRegistering ? 'Registration' : 'Access Control'}
              </h2>
              {isRegistering && (
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-[10px] font-black border ${seatsLeft > 0 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  <Users className="w-3 h-3" />
                  <span>{seatsLeft > 0 ? `VIP uchun ${seatsLeft} ta joy` : 'O\'rin yo\'q'}</span>
                </div>
              )}
            </div>

            {error && (
              <div className={`mb-8 p-4 rounded-2xl text-[11px] font-bold border transition-all animate-in zoom-in duration-300 ${error.includes('muvaffaqiyatli') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              {isRegistering && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <input 
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all placeholder:text-slate-700 font-bold text-sm"
                  />
                </div>
              )}

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                </div>
                <input 
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all placeholder:text-slate-700 font-bold text-sm"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                </div>
                <input 
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all placeholder:text-slate-700 font-bold text-sm"
                />
              </div>

              <button 
                disabled={loading || (isRegistering && seatsLeft <= 0)}
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-cyan-400 hover:scale-[1.02] active:scale-95 text-white font-black rounded-2xl shadow-2xl shadow-cyan-900/40 transition-all duration-300 disabled:opacity-50 flex items-center justify-center uppercase tracking-widest italic text-sm border border-cyan-400/20"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>{isRegistering ? 'Initialize Identity' : 'Secure Entry'}</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-8 bg-slate-900/30 border-t border-slate-800/50 text-center">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              {isRegistering ? 'Already in the system?' : 'Unauthorized?'}
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-3 text-cyan-400 font-black hover:text-cyan-300 transition-colors hover:underline underline-offset-8 decoration-2"
              >
                {isRegistering ? 'LOGIN SYSTEM' : 'CREATE ACCOUNT'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-12 text-slate-800 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
           <Fingerprint className="w-6 h-6" />
           <ShieldCheck className="w-6 h-6" />
           <Lock className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default Login;
