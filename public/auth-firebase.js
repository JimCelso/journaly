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
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: username });

  await setDoc(doc(db, "users", user.uid), {
    username: username,
    email: email,
    createdAt: new Date(),
    // Flags de aceptación legal
    accepted_privacy: false,
    accepted_terms: false
  });

  return user;
}


// ------------ LOGIN ------------
export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}


// ------------ LOGOUT ------------
export function logout() {
  return signOut(auth).then(() => {
    window.location.href = "login.html";
  });
}
