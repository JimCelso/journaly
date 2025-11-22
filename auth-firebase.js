// auth-firebase.js
import { auth, db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// ------------ SIGNUP ------------
export async function signup(username, email, password) {
  // Crear usuario en Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Guardar nombre en el perfil
  await updateProfile(user, { displayName: username });

  // Guardar en Firestore
  await setDoc(doc(db, "users", user.uid), {
    username: username,
    email: email,
    createdAt: new Date()
  });

  return user;
}


// ------------ LOGIN ------------
export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}


// ------------ LOGOUT ------------
export async function logout() {
  return await signOut(auth);
}
