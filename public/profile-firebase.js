// profile-firebase.js
import { db, auth } from "./firebase-init.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/**
 * Guarda perfil (merge) del usuario actual.
 */
export async function saveProfile(username, bio) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario autenticado.");
  await setDoc(doc(db, "users", user.uid), {
    username,
    bio,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Carga perfil del usuario actual.
 */
export async function loadProfile() {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario autenticado.");
  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() ? snap.data() : null;
}
