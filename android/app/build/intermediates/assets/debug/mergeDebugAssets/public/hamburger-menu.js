/**
 * Script centralizado para menú hamburguesa
 * Versión simplificada y robusta para móvil
 */

export function initHamburgerMenu() {
  // Esperar un poco para asegurar que el DOM esté listo
  setTimeout(() => {
    setupHamburger();
  }, 100);
}

function setupHamburger() {
  const hamburger = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!hamburger || !mobileMenu) {
    console.warn("❌ Hamburger o mobileMenu no encontrados");
    return;
  }

  console.log("✓ Hamburger menu initialized");

  // Toggle menú - versión simple
  function toggleMenu() {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("show");
    document.body.classList.toggle("menu-open");
  }

  // Click en hamburguesa
  hamburger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🖱️ Click en hamburguesa");
    toggleMenu();
  });

  // Click en enlace cierra menú
  const navLinks = mobileMenu.querySelectorAll("a, button");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (hamburger.classList.contains("active")) {
        console.log("🔗 Click en enlace, cerrando menú");
        toggleMenu();
      }
    });
  });

  // Click fuera cierra menú
  document.addEventListener("click", (e) => {
    if (
      hamburger.classList.contains("active") &&
      !hamburger.contains(e.target) &&
      !mobileMenu.contains(e.target)
    ) {
      console.log("📍 Click fuera del menú, cerrando");
      toggleMenu();
    }
  });

  // Escape cierra menú
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && hamburger.classList.contains("active")) {
      console.log("⌨️ Escape presionado, cerrando menú");
      toggleMenu();
    }
  });
}

// Auto-inicializar
initHamburgerMenu();
