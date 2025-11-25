// firebase-init.js

// Importar Firebase App
import { initializeApp } from 
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

// Importar Auth
import { 
  getAuth 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Importar Firestore
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// ⚠️ CONFIGURACIÓN DE TU PROYECTO FIREBASE
// (ESTO VIENE DE TU firebaseConfig)
const firebaseConfig = {
  apiKey: "AIzaSyAKg-wwIf3LSG0ffS-jdyIN8OXUCeaNcmM",
  authDomain: "diario-personal-883e2.firebaseapp.com",
  projectId: "diario-personal-883e2",
  storageBucket: "diario-personal-883e2.appspot.com",
  messagingSenderId: "1028474749798",
  appId: "1:1028474749798:web:8d921c7a143ada064efea7",
  measurementId: "G-173L5VZXRY"
};
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar funciones necesarias para CRUD
export { auth, db, doc, getDoc, setDoc };
