// index.js
import { auth, db } from "./firebase-init.js";
import { logout } from "./auth-firebase.js";

// Firebase 12.6.0 imports
import { onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import { doc, getDoc }
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Elementos del DOM
const usernameEl = document.getElementById("usernameDisplay");
const btnLogout = document.getElementById("btnLogout");

// 🔐 Verificar si hay usuario loggeado
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // 🔥 MOSTRAR AL INSTANTE lo que Auth ya sabe
  usernameEl.textContent =
    user.displayName ||
    user.email?.split("@")[0] ||
    "Usuario";

  // 🔎 Luego actualizar con Firestore (tarda un poco)
  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists() && snap.data().username) {
      usernameEl.textContent = snap.data().username;
    }
  } catch (err) {
    console.log("Error cargando Firestore:", err);
  }
});

// 🚪 Botón: Cerrar Sesión
btnLogout.addEventListener("click", async (e) => {
  e.preventDefault();
  await logout();
});
