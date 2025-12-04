import { auth, db } from "./firebase-init.js";
import { logout } from "./auth-firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


const input = document.getElementById("pensInput");
const btnSave = document.getElementById("btnSavePens");
const list = document.getElementById("pensList");
const popup = document.getElementById("successPopup");
const btnLogout = document.getElementById("btnLogout");

function showPopup() {
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 1800);
}

// Logout - Independiente de autenticación
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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadPens(user.uid);

  btnSave.addEventListener("click", async () => {
    if (input.value.trim() === "") return;

    await addDoc(collection(db, "users", user.uid, "pensamientos"), {
      text: input.value.trim(),
      fecha: new Date()
    });

    input.value = "";
    showPopup();
    loadPens(user.uid);
  });
});

async function loadPens(uid) {
  list.innerHTML = "<p>Cargando...</p>";

  const q = query(
    collection(db, "users", uid, "pensamientos"),
    orderBy("fecha", "desc")
  );

  const querySnap = await getDocs(q);

  list.innerHTML = "";

  if (querySnap.empty) {
    list.innerHTML = "<p>No tienes pensamientos aún.</p>";
    return;
  }

  querySnap.forEach((docSnap) => {
    const data = docSnap.data();
    const fecha = new Date(data.fecha.toDate ? data.fecha.toDate() : data.fecha);

    const fechaFormateada =
      fecha.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " — " +
      fecha.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const li = document.createElement("li");
    li.classList.add("pens-item");

    li.innerHTML = `
      <div class="pens-text">${data.text}</div>
      <div class="pens-date">${fechaFormateada}</div>
      <button class="delete-btn" data-id="${docSnap.id}">🗑️ B O R R A R </button>
    `;

    list.appendChild(li);
  });

  // Evento borrar
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");

      await deleteDoc(doc(db, "users", uid, "pensamientos", id));
      loadPens(uid);
    });
  });
}
