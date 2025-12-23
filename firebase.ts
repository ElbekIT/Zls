
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCBFaexQ484TzYUE9AmyTx39mvhsLYL4lU",
  authDomain: "oganiy-mas.firebaseapp.com",
  projectId: "oganiy-mas",
  storageBucket: "oganiy-mas.firebasestorage.app",
  messagingSenderId: "312627020192",
  appId: "1:312627020192:web:58c298cdf05758130e24c5",
  measurementId: "G-856YRJQ2LB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export const db = getFirestore(app);

// Enable Offline Persistence for a truly "Pro" feel
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
          console.warn("Multiple tabs open, persistence disabled.");
      } else if (err.code === 'unimplemented') {
          console.warn("Browser lacks offline support.");
      }
  });
}

isSupported().then(yes => {
  if (yes) getAnalytics(app);
});

export default app;
