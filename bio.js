import { auth, db } from "./firebase-init.js";
import { logout } from "./auth-firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// DOM
const usernameEl = document.getElementById("usernameDisplay");
const bioInput = document.getElementById("bioInput");
const btnSaveBio = document.getElementById("guardarBio"); // ← CORREGIDO
const btnLogout = document.getElementById("btnLogout");
const statusMsg = document.getElementById("statusMsg");

let currentUser = null;

// Autenticación
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  if (usernameEl) {
    usernameEl.textContent =
      user.displayName ||
      user.email.split("@")[0] ||
      "Usuario";
  }

  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists() && snap.data().bio) {
      bioInput.value = snap.data().bio;
    }
  } catch (e) {
    console.error("Error cargando bio:", e);
  }
});

// Guardar biografía
btnSaveBio.addEventListener("click", async () => {
  if (!currentUser) return;

  const texto = bioInput.value.trim();

  try {
    await setDoc(
      doc(db, "users", currentUser.uid),
      { bio: texto },
      { merge: true }
    );

    statusMsg.textContent = "¡Biografía guardada!";
    setTimeout(() => (statusMsg.textContent = ""), 3000);
  } catch (e) {
    statusMsg.textContent = "Error al guardar.";
    console.error("Error guardando bio:", e);
  }
});

// Logout
btnLogout.addEventListener("click", async () => {
  await logout();
});
