import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection, addDoc, getDocs, orderBy, query, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const storage = getStorage();

const mediaInput = document.getElementById("mediaInput");
const btnUpload = document.getElementById("btnUpload");
const gallery = document.getElementById("gallery");
const popup = document.getElementById("successPopup");

// Modal
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewerImg");
const viewerVideo = document.getElementById("viewerVideo");
const viewerClose = document.getElementById("viewerClose");

function showPopup() {
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 1800);
}

// Cerrar modal
viewerClose.onclick = () => viewer.classList.add("hidden");

// Autenticación
onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "login.html");

  loadMedia(user.uid);

  btnUpload.addEventListener("click", async () => {
    if (!mediaInput.files.length) return;

    const file = mediaInput.files[0];
    const fileName = Date.now() + "_" + file.name;
    const fileRef = ref(storage, `media/${user.uid}/${fileName}`);

    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (err) => console.error(err),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);

        await addDoc(collection(db, "users", user.uid, "media"), {
          url,
          nombre: fileName,
          tipo: file.type.startsWith("video") ? "video" : "image",
          fecha: new Date(),
        });

        showPopup();
        mediaInput.value = "";
        loadMedia(user.uid);
      }
    );
  });
});

// ===========================
// 🔥 CARGAR FOTOS Y VIDEOS
// ===========================
async function loadMedia(uid) {
  gallery.innerHTML = "<p>Cargando...</p>";

  const q = query(
    collection(db, "users", uid, "media"),
    orderBy("fecha", "desc")
  );

  const snap = await getDocs(q);
  gallery.innerHTML = "";

  if (snap.empty) {
    gallery.innerHTML = "<p>No has subido nada aún.</p>";
    return;
  }

  snap.forEach((docSnap) => {
    const data = docSnap.data();

    const item = document.createElement("div");
    item.classList.add("gallery-item");

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "🗑️";

    deleteBtn.onclick = async (e) => {
      e.stopPropagation();
      await deleteMedia(uid, docSnap.id, data.nombre);
      loadMedia(uid);
    };

    if (data.tipo === "image") {
      item.innerHTML = `<img src="${data.url}" />`;
    } else {
      item.innerHTML = `<video src="${data.url}"></video>`;
    }

    item.appendChild(deleteBtn);

    // ABRIR MODAL
    item.onclick = () => {
      viewer.classList.remove("hidden");

      if (data.tipo === "image") {
        viewerImg.src = data.url;
        viewerImg.style.display = "block";
        viewerVideo.style.display = "none";
      } else {
        viewerVideo.src = data.url;
        viewerVideo.style.display = "block";
        viewerImg.style.display = "none";
      }
    };

    gallery.appendChild(item);
  });
}

// ===========================
// ❌ ELIMINAR MEDIA
// ===========================
async function deleteMedia(uid, docId, fileName) {
  try {
    // Borrar Storage
    const fileRef = ref(storage, `media/${uid}/${fileName}`);
    await deleteObject(fileRef);

    // Borrar Firestore
    await deleteDoc(doc(db, "users", uid, "media", docId));

    showPopup();
  } catch (err) {
    console.error("Error al borrar:", err);
  }
}
