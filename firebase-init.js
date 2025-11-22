// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKg-wwIf3LSG0ffS-jdyIN8OXUCeaNcmM",
  authDomain: "diario-personal-883e2.firebaseapp.com",
  projectId: "diario-personal-883e2",
  storageBucket: "diario-personal-883e2.appspot.com",
  messagingSenderId: "1028474749798",
  appId: "1:1028474749798:web:8d921c7a143ada064efea7",
  measurementId: "G-173L5VZXRY"
};

const app = initializeApp(firebaseConfig);

// 🔥 Firestore con persistencia estable (evita "client offline")
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager()
  })
});

export const auth = getAuth(app);
