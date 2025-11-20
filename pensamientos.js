// --- SCRIPT PARA GUARDAR, MOSTRAR Y BORRAR PENSAMIENTOS ---

// Elementos del DOM
const input = document.getElementById("pensamientoInput");
const botonGuardar = document.getElementById("guardarPensamiento");
const lista = document.getElementById("listaPensamientos");

// Cargar pensamientos guardados al iniciar
document.addEventListener("DOMContentLoaded", cargarPensamientos);

// Función: Cargar pensamientos desde localStorage
function cargarPensamientos() {
    const guardados = JSON.parse(localStorage.getItem("pensamientos")) || [];

    lista.innerHTML = ""; // Limpiar

    guardados.forEach((item, index) => {
        agregarPensamientoHTML(item.texto, item.fecha, index);
    });
}

// Evento: Guardar pensamiento nuevo
botonGuardar.addEventListener("click", () => {
    const texto = input.value.trim();
    if (!texto) return;

    const fecha = new Date().toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    guardarPensamiento(texto, fecha);
    agregarPensamientoHTML(texto, fecha);

    input.value = ""; // limpiar campo
});

// Guardar en localStorage
function guardarPensamiento(texto, fecha) {
    const guardados = JSON.parse(localStorage.getItem("pensamientos")) || [];

    guardados.push({ texto, fecha });

    localStorage.setItem("pensamientos", JSON.stringify(guardados));
}

// Crear el HTML del pensamiento
function agregarPensamientoHTML(texto, fecha, index = null) {
    const div = document.createElement("div");
    div.className = "pensamiento-item";

    div.innerHTML = `
        <p>${texto}</p>
        <span class="fecha">${fecha}</span>
        <button class="btn-borrar">Eliminar</button>
        <hr>
    `;

    // Botón de borrar individual
    const btnBorrar = div.querySelector(".btn-borrar");
    btnBorrar.addEventListener("click", () => {
        borrarPensamiento(texto, fecha, div);
    });

    lista.prepend(div); // Se agregan arriba
}

// Borrar un pensamiento
function borrarPensamiento(texto, fecha, elementoHTML) {
    let guardados = JSON.parse(localStorage.getItem("pensamientos")) || [];

    // Filtrar pensamientos dejando fuera el que coincide
    guardados = guardados.filter(item => !(item.texto === texto && item.fecha === fecha));

    localStorage.setItem("pensamientos", JSON.stringify(guardados));

    // Animación suave antes de desaparecer
    elementoHTML.style.opacity = "0";
    elementoHTML.style.transform = "translateX(20px)";

    setTimeout(() => {
        elementoHTML.remove();
    }, 300);
}
