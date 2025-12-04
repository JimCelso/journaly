import { auth, db, storage } from "./firebase-init.js";
import { logout } from "./auth-firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection, addDoc, getDocs, query, orderBy, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Detectar si estamos en Capacitor
const isCapacitor = typeof (window.capacitor || window.Capacitor) !== "undefined";

// Helper para solicitar permisos en Capacitor (Android)
async function requestMicrophonePermission() {
  if (!isCapacitor) return true;
  
  try {
    const { permissions } = await window.Capacitor.Plugins.Permissions.query({ name: "RECORD_AUDIO" });
    if (permissions !== "granted") {
      const { permissions: granted } = await window.Capacitor.Plugins.Permissions.request({ name: "RECORD_AUDIO" });
      return granted === "granted";
    }
    return true;
  } catch (error) {
    console.warn("No se pudo solicitar permisos de micrófono:", error);
    return true; // Continuar de todos modos
  }
}


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
let stream = null; // Guardar referencia del stream

const btnRecord = document.getElementById("btnRecord");
const btnStop = document.getElementById("btnStop");
const preview = document.getElementById("previewAudio");
const btnUploadRecorded = document.getElementById("btnUploadRecorded");

// Detectar navegador
function getBrowserInfo() {
  const ua = navigator.userAgent;
  if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) {
    return "safari";
  }
  if (ua.indexOf("Chrome") > -1 || ua.indexOf("Chromium") > -1) {
    return "chrome";
  }
  if (ua.indexOf("Firefox") > -1) {
    return "firefox";
  }
  return "unknown";
}

// Obtener MIME type soportado para MediaRecorder
function getSupportedMimeType() {
  const browser = getBrowserInfo();
  const candidates = [];

  if (browser === "safari") {
    // Safari prefiere estos formatos
    candidates.push("audio/mp4");
    candidates.push("audio/aac");
  }
  
  // Candidatos universales
  candidates.push("audio/webm");
  candidates.push("audio/wav");
  candidates.push("audio/ogg");
  candidates.push("audio/opus");
  candidates.push("audio/mpeg");

  for (const mimeType of candidates) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  // Fallback: usar el default del navegador (sin especificar MIME type)
  return "";
}

// Iniciar grabación
btnRecord.addEventListener("click", async () => {
  try {
    // Solicitar permisos en Android
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert("Se requieren permisos de micrófono para grabar");
      return;
    }

    // Solicitar acceso al micrófono
    stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Obtener MIME type soportado
    const mimeType = getSupportedMimeType();
    
    const mediaRecorderOptions = mimeType ? { mimeType } : {};
    mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      // Usar el MIME type que se está usando en la grabación
      const mimeType = mediaRecorder.mimeType || "audio/webm";
      recordedBlob = new Blob(recordedChunks, { type: mimeType });
      preview.src = URL.createObjectURL(recordedBlob);
      preview.style.display = "block";
      btnUploadRecorded.style.display = "block";
      
      // Detener tracks del stream
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    };

    mediaRecorder.start();
    btnRecord.style.display = "none";
    btnStop.style.display = "block";
  } catch (error) {
    console.error("Error al iniciar grabación:", error);
    const browser = getBrowserInfo();
    let message = "Error al acceder al micrófono. Verifica los permisos.";
    
    if (browser === "safari") {
      message = "Safari requiere HTTPS o localhost para grabar. Asegúrate de permitir el acceso al micrófono en los permisos del sitio.";
    }
    
    alert(message);
  }
});


// Detener grabación
btnStop.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  btnStop.style.display = "none";
  btnRecord.style.display = "block";
});


// Subir grabación
btnUploadRecorded.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user || !recordedBlob) return;

  try {
    // Obtener extensión basada en MIME type
    let extension = "webm";
    if (recordedBlob.type.includes("mp4") || recordedBlob.type.includes("aac")) {
      extension = "m4a";
    } else if (recordedBlob.type.includes("wav")) {
      extension = "wav";
    } else if (recordedBlob.type.includes("ogg") || recordedBlob.type.includes("opus")) {
      extension = "ogg";
    } else if (recordedBlob.type.includes("mpeg")) {
      extension = "mp3";
    }

    const fileName = Date.now() + "_grabacion." + extension;

    // 🔥 ruta unificada
    const fileRef = ref(storage, `voces/${user.uid}/${fileName}`);

    const uploadTask = uploadBytesResumable(fileRef, recordedBlob);

    uploadTask.on(
      "state_changed",
      () => {},
      (err) => {
        console.error("Error al subir grabación:", err);
        alert("Error al subir la grabación. Intenta de nuevo.");
      },
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
        recordedBlob = null;
        recordedChunks = [];
        loadAudios(user.uid);
      }
    );
  } catch (error) {
    console.error("Error en subir grabación:", error);
    alert("Error al procesar la grabación.");
  }
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
