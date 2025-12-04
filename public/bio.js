import { auth, db, doc, getDoc, setDoc } from "./firebase-init.js";
import { logout } from "./auth-firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// --- POPUP ---
function showSuccessPopup() {
  const popup = document.getElementById("successPopup");
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  const bioInput = document.getElementById("bioInput");
  const btnSaveBio = document.getElementById("btnSaveBio");
  const btnLogout = document.getElementById("btnLogout");
  const statusMsg = document.getElementById("statusMsg");

  let currentUser = null;

  // --- Detectar sesión ---
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    currentUser = user;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists() && snap.data().bio) {
      bioInput.value = snap.data().bio;
    }
  });

  // --- Guardar biografía ---
  btnSaveBio.addEventListener("click", async () => {
    if (!currentUser) return;

    try {
      await setDoc(
        doc(db, "users", currentUser.uid),
        { bio: bioInput.value.trim() },
        { merge: true }
      );

      showSuccessPopup(); // <-- AHORA SI SE ACTIVA EL POPUP
    } catch (error) {
      console.error("Error guardando bio:", error);
      statusMsg.textContent = "Error al guardar la biografía.";
    }

    setTimeout(() => (statusMsg.textContent = ""), 3000);
  });

  // --- Logout ---
  btnLogout.addEventListener("click", async (e) => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión.");
    }
  });
});
