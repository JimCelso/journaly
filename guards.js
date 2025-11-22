import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const usernameEl = document.getElementById("usernameDisplay");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Solo mostrar nombre
  if (usernameEl) {
    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists() && snap.data().username) {
        usernameEl.textContent = snap.data().username;
      } else {
        usernameEl.textContent = user.email.split("@")[0];
      }
    } catch (e) {
      console.error("Error cargando username:", e);
    }
  }
});
