import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Connect from './pages/Connect';
import { Layout } from './components/Layout';
import { UserData } from './types';
import { Crown, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth sync took too long, forcing entry.");
        setLoading(false);
      }
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          }
        }
      } catch (err) {
        console.error("Auth process error:", err);
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.05),transparent_70%)]"></div>
        
        <div className="relative flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-1000">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500 blur-[40px] opacity-20 animate-pulse"></div>
            <div className="p-8 bg-slate-900 border border-amber-500/20 rounded-[2.5rem] relative z-10">
               <Crown className="w-16 h-16 text-amber-500 gold-glow" />
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <h2 className="text-white font-black tracking-[0.8em] uppercase text-[10px] animate-pulse">
              SYNCING WITH MAINFRAME
            </h2>
            <div className="h-[3px] w-48 bg-slate-900 rounded-full overflow-hidden border border-white/5">
               <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 animate-[loading_2s_infinite]"></div>
            </div>
            <p className="text-slate-600 text-[8px] font-black uppercase tracking-widest opacity-50">Authorized Personnel Only</p>
          </div>
        </div>
        
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/connect" element={<Connect />} />
        <Route 
          path="/dashboard" 
          element={user ? (
            <Layout user={user} userData={userData}>
              <Dashboard user={user} userData={userData} />
            </Layout>
          ) : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/admin" 
          element={userData?.isAdmin ? (
            <Layout user={user!} userData={userData}>
              <Admin user={user!} />
            </Layout>
          ) : <Navigate to="/dashboard" replace />} 
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;