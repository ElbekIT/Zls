
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCBFaexQ484TzYUE9AmyTx39mvhsLYL4lU",
  authDomain: "oganiy-mas.firebaseapp.com",
  databaseURL: "https://oganiy-mas-default-rtdb.firebaseio.com",
  projectId: "oganiy-mas",
  storageBucket: "oganiy-mas.firebasestorage.app",
  messagingSenderId: "312627020192",
  appId: "1:312627020192:web:58c298cdf05758130e24c5",
  measurementId: "G-856YRJQ2LB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
