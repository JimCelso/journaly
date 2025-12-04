// firebase-init.js

// Import Firebase App
import { initializeApp } from 
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

// Auth
import { 
  getAuth 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Firestore
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Storage
import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";


// ⚠️ TU CONFIGURACIÓN (firebaseConfig)
const firebaseConfig = {
  apiKey: "AIzaSyAKg-wwIf3LSG0ffS-jdyIN8OXUCeaNcmM",
  authDomain: "diario-personal-883e2.firebaseapp.com",
  projectId: "diario-personal-883e2",
  storageBucket: "diario-personal-883e2.firebasestorage.app",
  messagingSenderId: "1028474749798",
  appId: "1:1028474749798:web:8d921c7a143ada064efea7",
  measurementId: "G-173L5VZXRY"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios
const auth = getAuth(app);
const db = getFirestore(app);

// ⚠️ IMPORTANTE: Storage usando tu bucket REAL (.firebasestorage.app)
const storage = getStorage(app, "gs://diario-personal-883e2.firebasestorage.app");

// Exportar
export { auth, db, storage, doc, getDoc, setDoc };
