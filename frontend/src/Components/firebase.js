import { initializeApp } from "firebase/app"; // Core initialization
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";       // Authentication service
import { getStorage } from "firebase/storage";   // Storage service

const firebaseConfig = {
  apiKey: "AIzaSyCIsqwdPF76fh5eBjPa-XzP3W0x0OC6Vxk",
  authDomain: "skillshareapp-32ecc.firebaseapp.com",
  projectId: "skillshareapp-32ecc",
  storageBucket: "skillshareapp-32ecc.firebasestorage.app",
  messagingSenderId: "539143797205",
  appId: "1:539143797205:web:1be679224416edcc79255c"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const storage = getStorage(app);


export { storage, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };
