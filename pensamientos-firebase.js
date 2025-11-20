// pensamientos-firebase.js
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const input = document.getElementById("pensamientoInput");
const botonGuardar = document.getElementById("guardarPensamiento");
const lista = document.getElementById("listaPensamientos");
const btnBorrarTodo = document.getElementById("borrarTodo");

let currentUser = null;
let unsubscribe = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  startListening(user.uid);
});

async function startListening(uid) {
  if (unsubscribe) unsubscribe();
  const colRef = collection(db, "users", uid, "pensamientos");
  const q = query(colRef, orderBy("fecha", "desc"));
  unsubscribe = onSnapshot(q, snap => {
    lista.innerHTML = "";
    snap.forEach(d => {
      const data = d.data();
      renderItem(data.texto, data.fecha, d.id);
    });
  });
}

function renderItem(texto, fechaISO, id) {
  const div = document.createElement("div");
  div.className = "pensamiento-item";
  const fecha = new Date(fechaISO).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });

  div.innerHTML = `
    <p>${escapeHtml(texto)}</p>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span class="fecha">${fecha}</span>
      <button class="btn-borrar" data-id="${id}">Eliminar</button>
    </div>
  `;
  div.querySelector(".btn-borrar").addEventListener("click", async (e) => {
    const docId = e.currentTarget.dataset.id;
    await deleteDoc(doc(db, "users", currentUser.uid, "pensamientos", docId));
  });
  lista.appendChild(div);
}

botonGuardar && botonGuardar.addEventListener("click", async () => {
  const texto = input.value.trim();
  if (!texto) return;
  const fecha = new Date().toISOString();
  await addDoc(collection(db, "users", currentUser.uid, "pensamientos"), { texto, fecha });
  input.value = "";
});

btnBorrarTodo && btnBorrarTodo.addEventListener("click", async () => {
  if (!confirm("¿Eliminar todos tus pensamientos?")) return;
  const snaps = await getDocs(collection(db, "users", currentUser.uid, "pensamientos"));
  const batch = writeBatch(db);
  snaps.forEach(s => batch.delete(doc(db, "users", currentUser.uid, "pensamientos", s.id)));
  await batch.commit();
});

function escapeHtml(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}
