// Cookie management and consent banner

function setCookie(name, value, days = 365) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/;SameSite=Strict";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

function deleteCookie(name) {
  setCookie(name, "", -1);
}

// Show cookie consent banner
function showCookieBanner() {
  const cookieConsent = getCookie("cookieConsent");
  if (cookieConsent) {
    return; // User already made a choice
  }

  // Create banner HTML
  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: #ecf0f1;
    padding: 16px 20px;
    z-index: 9999;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  `;

  // Banner text
  const textDiv = document.createElement('div');
  textDiv.style.cssText = 'flex: 1; min-width: 250px;';
  textDiv.innerHTML = `
    <strong>🍪 Uso de Cookies</strong><br>
    Utilizamos cookies para mejorar tu experiencia, recordar tus preferencias y análisis. 
    <a href="privacy.html" style="color: #3498db; text-decoration: none; font-weight: bold;">Lee nuestro Aviso de Privacidad</a>
  `;

  // Buttons container
  const buttonsDiv = document.createElement('div');
  buttonsDiv.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap;';

  // Accept button
  const acceptBtn = document.createElement('button');
  acceptBtn.textContent = 'Aceptar';
  acceptBtn.style.cssText = `
    padding: 10px 20px;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.3s;
  `;
  acceptBtn.onmouseover = () => acceptBtn.style.background = '#229954';
  acceptBtn.onmouseout = () => acceptBtn.style.background = '#27ae60';
  acceptBtn.onclick = () => {
    setCookie("cookieConsent", "accepted", 365);
    banner.style.display = 'none';
  };

  // Reject button
  const rejectBtn = document.createElement('button');
  rejectBtn.textContent = 'Rechazar';
  rejectBtn.style.cssText = `
    padding: 10px 20px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.3s;
  `;
  rejectBtn.onmouseover = () => rejectBtn.style.background = '#c0392b';
  rejectBtn.onmouseout = () => rejectBtn.style.background = '#e74c3c';
  rejectBtn.onclick = () => {
    setCookie("cookieConsent", "rejected", 365);
    banner.style.display = 'none';
  };

  buttonsDiv.appendChild(acceptBtn);
  buttonsDiv.appendChild(rejectBtn);

  banner.appendChild(textDiv);
  banner.appendChild(buttonsDiv);
  document.body.appendChild(banner);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', showCookieBanner);
