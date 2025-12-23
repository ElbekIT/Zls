import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAg6AmAE_q6owmPBuimuBKitVM1ne13FrA",
  authDomain: "baby-igra.firebaseapp.com",
  databaseURL: "https://baby-igra-default-rtdb.firebaseio.com",
  projectId: "baby-igra",
  storageBucket: "baby-igra.firebasestorage.app",
  messagingSenderId: "767933435506",
  appId: "1:767933435506:web:4454e86a5832667291fceb",
  measurementId: "G-XDEXPXBYCL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

export const db = getFirestore(app);

// Enable Offline Persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open, persistence disabled.");
    } else if (err.code === 'unimplemented') {
      console.warn("Browser lacks offline support.");
    }
  });
}

isSupported().then((yes) => {
  if (yes) getAnalytics(app);
});

export default app;
