
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Loader2, 
  Fingerprint,
  Key
} from 'lucide-react';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mapping username to internal email
    const email = `${username.toLowerCase().trim()}@venom.vip`;

    try {
      if (isRegistering) {
        // Validate Referral
        const invQuery = query(collection(db, 'invites'), where('code', '==', referralCode.trim()));
        const invSnap = await getDocs(invQuery);
        
        if (invSnap.empty) throw new Error("Referral code not found or invalid.");
        
        const inviteDoc = invSnap.docs[0];
        const inviteData = inviteDoc.data();
        if (inviteData.useCount >= inviteData.maxUses) throw new Error("Referral code usage limit reached.");

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const isAdmin = username === 'elbekgamer' && password === '79178195327';

        // Initialize User Data
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          username: username.trim(),
          isAdmin,
          isVIP: isAdmin,
          vipUntil: isAdmin ? 4102444800000 : null, // Year 2100 for admin
          keysCreated: 0,
          invitedBy: inviteData.createdBy
        });

        // Update Invite Count
        await updateDoc(doc(db, 'invites', inviteDoc.id), {
          useCount: increment(1)
        });

        await updateProfile(userCredential.user, { displayName: username.trim() });
        setIsRegistering(false);
        setError("Account created! Please login with your credentials.");
      } else {
        // Normal Login
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError("Account not found, please register first.");
      } else {
        setError(err.message.replace('Firebase:', '').trim());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-gradient flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-600 shadow-[0_0_30px_rgba(8,145,178,0.5)] mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Venom<span className="text-cyan-400">Key</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Secure VIP Entry</p>
        </div>

        <div className="glass rounded-3xl overflow-hidden border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                {isRegistering ? 'Registration' : 'System Access'}
              </h2>
              <Fingerprint className="w-8 h-8 text-cyan-500/20" />
            </div>

            {error && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${error.includes('created') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-700 font-bold"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-700 font-bold"
                />
              </div>

              {isRegistering && (
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Referral / Invite Code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    required
                    className="w-full bg-cyan-950/20 border border-cyan-900/50 rounded-2xl pl-12 pr-4 py-4 text-cyan-200 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-cyan-900 font-bold"
                  />
                </div>
              )}

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-purple-700 hover:scale-[1.02] active:scale-95 text-white font-black rounded-2xl shadow-xl shadow-cyan-900/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center uppercase tracking-widest italic"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>{isRegistering ? 'Initialize' : 'Authorize'}</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-6 bg-slate-900/50 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              {isRegistering ? 'Already a member?' : 'Unauthorized?'}
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-2 text-cyan-400 font-black hover:text-cyan-300"
              >
                {isRegistering ? 'LOGIN HERE' : 'REGISTER WITH INVITE'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
