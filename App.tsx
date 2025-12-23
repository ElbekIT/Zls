
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Connect from './pages/Connect';
import { Layout } from './components/Layout';
import { UserData } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            // User authenticated but no document in Firestore
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Auth state processing error:", error);
        // Ensure loading turns off even on error
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500 blur-[100px] opacity-10 animate-pulse"></div>
          <div className="relative flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="mt-6 flex flex-col items-center space-y-2">
               <p className="text-cyan-400 font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">
                 Synchronizing Encryption
               </p>
               <div className="h-0.5 w-32 bg-slate-900 rounded-full overflow-hidden">
                 <div className="h-full bg-cyan-500 animate-[loading_2s_infinite]"></div>
               </div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { width: 0%; transform: translateX(-100%); }
            50% { width: 100%; transform: translateX(0%); }
            100% { width: 0%; transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/connect" element={<Connect />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
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
    </HashRouter>
  );
};

export default App;
