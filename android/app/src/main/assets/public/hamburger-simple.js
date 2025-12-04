/**
 * Script simple para menú hamburguesa - SIN módulos
 * Optimizado para app nativa en móvil
 */

function initHamburgerMenu() {
  console.log("🍔 Iniciando Hamburger Menu");
  
  const hamburger = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!hamburger) {
    console.error("❌ #hamburgerBtn no encontrado");
    return;
  }
  if (!mobileMenu) {
    console.error("❌ #mobileMenu no encontrado");
    return;
  }

  console.log("✓ Elementos encontrados");

  // Función para alternar menú
  function toggleMenu(force) {
    const isOpen = hamburger.classList.contains("active");
    const shouldOpen = force !== undefined ? force : !isOpen;
    
    if (shouldOpen) {
      hamburger.classList.add("active");
      mobileMenu.classList.add("show");
      document.body.classList.add("menu-open");
      console.log("📱 Menú abierto");
    } else {
      hamburger.classList.remove("active");
      mobileMenu.classList.remove("show");
      document.body.classList.remove("menu-open");
      console.log("📴 Menú cerrado");
    }
  }

  // Click en hamburguesa
  hamburger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🖱️ Click en hamburguesa");
    toggleMenu();
  });

  // Click en enlaces cierra menú
  const links = mobileMenu.querySelectorAll("a, button");
  console.log(`📌 ${links.length} enlaces encontrados`);
  
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (hamburger.classList.contains("active")) {
        // No cerrar si es el botón de logout (dejarlo que ejecute su función)
        if (link.id !== "btnLogout") {
          console.log("🔗 Cerrando menú tras click en enlace");
          setTimeout(() => toggleMenu(false), 100);
        }
      }
    });
  });

  // Click fuera del menú lo cierra
  document.addEventListener("click", (e) => {
    const isClickOnHamburger = hamburger.contains(e.target);
    const isClickOnMenu = mobileMenu.contains(e.target);
    const isMenuOpen = hamburger.classList.contains("active");

    if (isMenuOpen && !isClickOnHamburger && !isClickOnMenu) {
      console.log("📍 Click fuera, cerrando menú");
      toggleMenu(false);
    }
  });

  // ESC cierra menú
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && hamburger.classList.contains("active")) {
      console.log("⌨️ ESC presionado, cerrando menú");
      toggleMenu(false);
    }
  });

  // Cerrar menú al cambiar orientación
  window.addEventListener("orientationchange", () => {
    if (hamburger.classList.contains("active")) {
      console.log("📐 Orientación cambió, cerrando menú");
      toggleMenu(false);
    }
  });

  console.log("✅ Hamburger Menu listo");
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHamburgerMenu);
} else {
  initHamburgerMenu();
}
