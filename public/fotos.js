import { auth, storage } from "./firebase-init.js";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const uploadInput = document.getElementById("uploadInput");
const gallery = document.getElementById("gallery");

const takePhotoBtn = document.getElementById("takePhotoBtn");
const cameraPreview = document.getElementById("cameraPreview");
const captureBtn = document.getElementById("captureBtn");

let currentUid = null;

/* ======== USUARIO LOGUEADO ======== */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    gallery.innerHTML = "<p style='text-align:center;'>Inicia sesión para ver tus fotos.</p>";
    return;
  }

  currentUid = user.uid;
  cargarFotos();
});

/* ======== SUBIR FOTO ======== */
uploadInput.addEventListener("change", async (e) => {
  if (!currentUid) return alert("Inicia sesión primero.");
  const file = e.target.files[0];
  if (!file) return;
  subirFoto(file);
});

/* ======== TOMAR FOTO ======== */
takePhotoBtn.addEventListener("click", async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return alert("Tu navegador no soporta cámara.");
  }

  cameraPreview.style.display = "block";
  captureBtn.style.display = "inline-block";

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  cameraPreview.srcObject = stream;
});

captureBtn.addEventListener("click", async () => {
  const canvas = document.createElement("canvas");
  canvas.width = cameraPreview.videoWidth;
  canvas.height = cameraPreview.videoHeight;
  canvas.getContext("2d").drawImage(cameraPreview, 0, 0);

  canvas.toBlob(async (blob) => {
    subirFoto(blob);
  });

  // Detener cámara
  const stream = cameraPreview.srcObject;
  stream.getTracks().forEach(track => track.stop());
  cameraPreview.style.display = "none";
  captureBtn.style.display = "none";
});

/* ======== FUNCIONES ======== */
async function subirFoto(file) {
  const storageRef = ref(storage, `fotos/${currentUid}/${Date.now()}-${file.name || 'foto.png'}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    null,
    (error) => alert("Error al subir: " + error),
    async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      agregarFoto(url, uploadTask.snapshot.ref.fullPath);
    }
  );
}

async function cargarFotos() {
  const folderRef = ref(storage, `fotos/${currentUid}`);
  gallery.innerHTML = "";
  try {
    const res = await listAll(folderRef);
    for (const item of res.items) {
      const url = await getDownloadURL(item);
      agregarFoto(url, item.fullPath);
    }
  } catch (err) {
    console.error(err);
  }
}

function agregarFoto(url, fullPath) {
  const div = document.createElement("div");
  div.classList.add("photo-item");

  div.innerHTML = `
    <img src="${url}">
    <button class="delete-btn">Borrar</button>
  `;

  div.querySelector(".delete-btn").addEventListener("click", async () => {
    const ok = confirm("¿Eliminar esta foto?");
    if (!ok) return;
    try {
      await deleteObject(ref(storage, fullPath));
      div.remove();
    } catch (err) {
      alert("No se pudo borrar.");
    }
  });

  gallery.prepend(div); // Aparece primero en la parte superior de la galería
}
