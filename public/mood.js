import { auth, db } from "./firebase-init.js";
import { logout } from "./auth-firebase.js";
import { initHamburgerMenu } from "./hamburger-menu.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Inicializar menú hamburguesa
initHamburgerMenu();

const moodSelect = document.getElementById("moodSelect");
const moodText = document.getElementById("moodText");
const colorPick = document.getElementById("colorPick");
const saveBtn = document.getElementById("saveMood");
const statusMessage = document.getElementById("statusMessage");

// Esperar a que cargue el usuario
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  const docRef = doc(db, "usuarios", user.uid, "mood", "hoy");
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data();
    moodSelect.value = data.estado;
    moodText.value = data.texto;
    colorPick.value = data.color;
  }
});

// Guardar
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const registro = {
    estado: moodSelect.value,
    texto: moodText.value.trim(),
    color: colorPick.value,
    fecha: new Date().toISOString()
  };

  await setDoc(doc(db, "usuarios", user.uid, "mood", "hoy"), registro);

  statusMessage.textContent = "Registro guardado ✓";
  setTimeout(() => statusMessage.textContent = "", 2000);
});

// Logout
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", async (e) => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión.");
    }
  });
}
