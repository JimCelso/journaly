import { auth, db, storage } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection, addDoc, getDocs, query, orderBy, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";


// HTML elementos
const fileInput = document.getElementById("audioInput");
const btnUpload = document.getElementById("btnUpload");
const list = document.getElementById("audioList");
const popup = document.getElementById("successPopup");


// Mostrar popup
function showPopup() {
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2000);
}


// Detectar usuario
onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "login.html");

  loadAudios(user.uid);

  btnUpload.addEventListener("click", () => uploadAudio(user.uid));
});


// SUBIR AUDIO DESDE INPUT
async function uploadAudio(uid) {
  if (!fileInput.files.length) return;

  const file = fileInput.files[0];
  const fileName = Date.now() + "_" + file.name;

  // 🔥 ruta correcta y unificada
  const fileRef = ref(storage, `voces/${uid}/${fileName}`);

  const uploadTask = uploadBytesResumable(fileRef, file);

  uploadTask.on(
    "state_changed",
    () => {},
    (err) => console.log(err),
    async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);

      await addDoc(collection(db, "users", uid, "voces"), {
        url,
        nombre: fileName,
        fecha: new Date(),
      });

      fileInput.value = "";
      showPopup();
      loadAudios(uid);
    }
  );
}


// CARGAR AUDIOS DEL USUARIO
async function loadAudios(uid) {
  list.innerHTML = "<p>Cargando...</p>";

  const q = query(
    collection(db, "users", uid, "voces"),
    orderBy("fecha", "desc")
  );

  const snap = await getDocs(q);

  list.innerHTML = "";

  if (snap.empty) return (list.innerHTML = "<p>No hay audios aún</p>");

  snap.forEach((docSnap) => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.classList.add("audioItem");

    div.innerHTML = `
      <audio controls src="${data.url}"></audio>
      <button class="deleteBtn" data-id="${docSnap.id}" data-name="${data.nombre}">
        🗑️
      </button>
    `;

    list.appendChild(div);
  });

  // borrar audio
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;

      // 🔥 ruta correcta unificada
      await deleteObject(ref(storage, `voces/${uid}/${name}`));

      await deleteDoc(doc(db, "users", uid, "voces", id));

      loadAudios(uid);
    });
  });
}


// 🎤 GRABACIÓN DE AUDIO
let mediaRecorder;
let recordedChunks = [];
let recordedBlob = null;

const btnRecord = document.getElementById("btnRecord");
const btnStop = document.getElementById("btnStop");
const preview = document.getElementById("previewAudio");
const btnUploadRecorded = document.getElementById("btnUploadRecorded");


// Iniciar grabación
btnRecord.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream);
  recordedChunks = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    recordedBlob = new Blob(recordedChunks, { type: "audio/webm" });
    preview.src = URL.createObjectURL(recordedBlob);
    preview.style.display = "block";
    btnUploadRecorded.style.display = "block";
  };

  mediaRecorder.start();
  btnRecord.style.display = "none";
  btnStop.style.display = "block";
});


// Detener grabación
btnStop.addEventListener("click", () => {
  mediaRecorder.stop();
  btnStop.style.display = "none";
  btnRecord.style.display = "block";
});


// Subir grabación
btnUploadRecorded.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user || !recordedBlob) return;

  const fileName = Date.now() + "_grabacion.webm";

  // 🔥 ruta unificada
  const fileRef = ref(storage, `voces/${user.uid}/${fileName}`);

  const uploadTask = uploadBytesResumable(fileRef, recordedBlob);

  uploadTask.on(
    "state_changed",
    () => {},
    (err) => console.error(err),
    async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);

      await addDoc(collection(db, "users", user.uid, "voces"), {
        url,
        nombre: fileName,
        fecha: new Date(),
      });

      showPopup();

      preview.style.display = "none";
      btnUploadRecorded.style.display = "none";
      loadAudios(user.uid);
    }
  );
});
