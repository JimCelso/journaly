// guards.js
import { auth, db } from "./firebase-init.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameEl = document.getElementById("usernameDisplay");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      let username =
        user.displayName ||
        (user.email ? user.email.split("@")[0] : "Usuario");

      if (snap.exists() && snap.data().username) {
        username = snap.data().username;
      }

      if (usernameEl) usernameEl.textContent = username;
    } catch (err) {
      console.error("Error cargando username:", err);
    }
  });
});
