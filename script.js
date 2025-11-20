// Frases motivadoras estilo anime + LoL + videojuegos
const frases = [
    "Si estás esperando a que me rinda, vas a tener que esperar un largo rato.",
    "Dicen que no sé cuándo abandonar. Como si eso fuera un defecto.",
    "Hasta las puertas más pesadas pueden ser abiertas.",
    "Entre más negra la noche, más brillan las estrellas.",
    "Un corazón helado solo necesita una sonrisa cálida.",
    "Lucharé, fracasaré, pero rendirme es un privilegio que no tengo.",
    "Me parece que cuanto más extraña se vuelve la vida, más parece tener sentido.",
    "No dejes que nada te detenga. Lucha por tus metas, incluso cuando parezcan fuera de tu alcance.",
    "Mi magia es no rendirme.",
    "Jamás retrocederé a mi palabra. Ese es mi camino ninja.",
    "El corazón puede ser débil, pero algunas veces es todo lo que necesitamos.",
    "No elegimos cómo empezamos en esta vida. La verdadera grandeza es qué hacemos con lo que nos toca."
];

// Función para cambiar frase
function cambiarFrase() {
    const fraseEl = document.getElementById("frase");

    // Desvanecer
    fraseEl.style.opacity = 0;

    setTimeout(() => {
        const random = Math.floor(Math.random() * frases.length);
        fraseEl.textContent = frases[random];

        // Volver a aparecer
        fraseEl.style.opacity = 1;
    }, 300);
}

// Primera frase al cargar
cambiarFrase();

// Cambiar cada 4 segundos
setInterval(cambiarFrase, 4000);
