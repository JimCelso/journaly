/**
 * Script simple para menú hamburguesa - SIN módulos
 * Se puede usar directamente sin import/export
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
  function toggleMenu() {
    const isOpen = hamburger.classList.contains("active");
    
    if (isOpen) {
      hamburger.classList.remove("active");
      mobileMenu.classList.remove("show");
      document.body.classList.remove("menu-open");
      console.log("📴 Menú cerrado");
    } else {
      hamburger.classList.add("active");
      mobileMenu.classList.add("show");
      document.body.classList.add("menu-open");
      console.log("📱 Menú abierto");
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
        console.log("🔗 Cerrando menú tras click en enlace");
        toggleMenu();
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
      toggleMenu();
    }
  });

  // ESC cierra menú
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && hamburger.classList.contains("active")) {
      console.log("⌨️ ESC presionado, cerrando menú");
      toggleMenu();
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
