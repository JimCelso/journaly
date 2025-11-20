// profile-firebase.js
import { db, auth } from "./firebase-init.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Guardar perfil (merge: no sobreescribe todo)
export async function saveProfile(username, bio) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario autenticado.");
  await setDoc(doc(db, "users", user.uid), {
    username,
    bio,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

// Cargar perfil
export async function loadProfile() {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario autenticado.");
  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() ? snap.data() : null;
}
