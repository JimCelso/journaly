import { auth, db } from "./firebase-init.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const moodSelect = document.getElementById("moodSelect");
const moodText = document.getElementById("moodText");
const colorPick = document.getElementById("colorPick");
const saveBtn = document.getElementById("saveMood");
const statusMessage = document.getElementById("statusMessage");

// Menú hamburguesa
document.getElementById("hamburger").addEventListener("click", () => {
  document.getElementById("navMenu").classList.toggle("show");
});

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
