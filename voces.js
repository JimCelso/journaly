import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const storage = getStorage();

const recordBtn = document.getElementById("recordBtn");
const recordStatus = document.getElementById("recordStatus");
const audioUpload = document.getElementById("audioUpload");
const uploadBtn = document.getElementById("uploadBtn");
const list = document.getElementById("voiceList");

let mediaRecorder;
let chunks = [];

// -------------------------------
// 🔴 GRABAR AUDIO
// -------------------------------
recordBtn.addEventListener("click", async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      chunks = [];

      const uid = auth.currentUser.uid;
      const fileName = "grabacion_" + Date.now() + ".webm";
      const audioRef = ref(storage, `voces/${uid}/${fileName}`);

      await uploadBytes(audioRef, blob);
      const url = await getDownloadURL(audioRef);

      await addDoc(collection(db, "users", uid, "voces"), {
        url,
        fileName,
        fecha: new Date()
      });

      loadVoices(uid);
    };

    mediaRecorder.start();
    recordStatus.textContent = "Grabando...";
    recordBtn.textContent = "⏹️ Detener";

  } else {
    mediaRecorder.stop();
    recordStatus.textContent = "Grabación guardada";
    recordBtn.textContent = "🎤 Iniciar Grabación";
  }
});

// -------------------------------
// 📤 SUBIR ARCHIVO
// -------------------------------
uploadBtn.addEventListener("click", async () => {
  const file = audioUpload.files[0];
  if (!file) return alert("Selecciona un archivo");

  const uid = auth.currentUser.uid;
  const audioRef = ref(storage, `voces/${uid}/${Date.now()}_${file.name}`);

  await uploadBytes(audioRef, file);
  const url = await getDownloadURL(audioRef);

  await addDoc(collection(db, "users", uid, "voces"), {
    url,
    fileName: file.name,
    fecha: new Date()
  });

  audioUpload.value = "";
  loadVoices(uid);
});

// -------------------------------
// 📄 CARGAR LISTA DE AUDIOS
// -------------------------------
async function loadVoices(uid) {
  list.innerHTML = "<p>Cargando audios...</p>";

  const q = query(
    collection(db, "users", uid, "voces"),
    orderBy("fecha", "desc")
  );

  const snap = await getDocs(q);
  list.innerHTML = "";

  if (snap.empty) {
    list.innerHTML = "<p>No has subido ni grabado audios aún.</p>";
    return;
  }

  snap.forEach((docSnap) => {
    const data = docSnap.data();

    const li = document.createElement("li");
    li.classList.add("voice-item");

    li.innerHTML = `
      <p><strong>${data.fileName}</strong></p>
      <audio controls src="${data.url}"></audio>
      <button class="delete-btn" data-id="${docSnap.id}" data-file="${data.fileName}">Eliminar</button>
    `;

    list.appendChild(li);
  });

  // Borrar audio
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const fileName = btn.getAttribute("data-file");

      const fileRef = ref(storage, `voces/${uid}/${fileName}`);

      await deleteObject(fileRef);
      await deleteDoc(doc(db, "users", uid, "voces", id));

      loadVoices(uid);
    });
  });
}

// -------------------------------
// 🔐 CONTROL DE SESIÓN
// -------------------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadVoices(user.uid);
});
