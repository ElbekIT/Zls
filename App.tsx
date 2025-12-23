
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
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-t-2 border-purple-500 rounded-full animate-spin duration-700"></div>
          <div className="absolute inset-4 border-t-2 border-white/20 rounded-full animate-spin duration-1000"></div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-cyan-400 font-black tracking-[0.6em] uppercase text-xs animate-pulse">
            Neural Sync Active
          </h2>
          <div className="h-[2px] w-48 bg-slate-900 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-[loading_2s_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
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
    </HashRouter>
  );
};

export default App;
