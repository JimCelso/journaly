// guards.js
import { auth, db } from "./firebase-init.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameEl = document.getElementById("usernameDisplay");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      let username =
        user.displayName ||
        (user.email ? user.email.split("@")[0] : "Usuario");

      if (snap.exists() && snap.data().username) {
        username = snap.data().username;
      }

      if (usernameEl) usernameEl.textContent = username;

      // Comprobar aceptación de términos/privacidad
      try {
        const data = snap.exists() ? snap.data() : {};
        const acceptedPrivacy = !!data.accepted_privacy;
        const acceptedTerms = !!data.accepted_terms;

        if (!acceptedPrivacy || !acceptedTerms) {
          // Mostrar modal de consentimiento y bloquear interacción hasta aceptar
          showConsentModal(user.uid, ref, data);
        }
      } catch (e) {
        console.warn('Error comprobando aceptación legal:', e);
      }
    } catch (err) {
      console.error("Error cargando username:", err);
    }
  });
});


// Crea y muestra un modal con los contenidos de privacy.html y terms.html
async function showConsentModal(uid, userDocRef, userData) {
  const overlay = document.createElement('div');
  overlay.id = 'consentOverlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.6)';
  overlay.style.zIndex = '99999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  const modal = document.createElement('div');
  modal.style.width = '90%';
  modal.style.maxWidth = '980px';
  modal.style.maxHeight = '85%';
  modal.style.overflow = 'auto';
  modal.style.background = '#fff';
  const isSmall = window.innerWidth <= 640;
  if (isSmall) {
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.maxHeight = 'none';
    modal.style.inset = '0';
    modal.style.zIndex = '100000';
  } else {
    modal.style.width = '90%';
    modal.style.maxWidth = '980px';
    modal.style.maxHeight = '85vh';
  }
  modal.style.overflow = 'hidden';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  modal.style.background = '#fff';
  modal.style.borderRadius = isSmall ? '0' : '8px';
  modal.style.padding = '16px';
  modal.style.boxShadow = isSmall ? 'none' : '0 8px 30px rgba(0,0,0,0.3)';

  // Header
  const h = document.createElement('h2');
  h.textContent = 'Términos y Aviso de Privacidad';
  h.style.margin = '0 0 12px 0';
  h.style.fontSize = isSmall ? '1.2rem' : '1.5rem';
  modal.appendChild(h);

  // Content container (flex for two columns on desktop, column on mobile)
  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = isSmall ? 'column' : 'row';
  content.style.gap = '12px';
  content.style.flex = '1 1 auto';
  content.style.overflow = 'auto';
  content.style.minHeight = '0';

  const left = document.createElement('div');
  left.style.flex = isSmall ? '1 1 auto' : '1 1 45%';
  left.style.minWidth = isSmall ? '0' : '280px';
  left.style.overflow = 'auto';
  left.style.maxHeight = 'none';

  const right = document.createElement('div');
  right.style.flex = isSmall ? '1 1 auto' : '1 1 45%';
  right.style.minWidth = isSmall ? '0' : '280px';
  right.style.overflow = 'auto';
  right.style.maxHeight = 'none';

  content.appendChild(left);
  content.appendChild(right);
  modal.appendChild(content);

  try {
    const [pResp, tResp] = await Promise.all([
      fetch('privacy.html'),
      fetch('terms.html')
    ]);

    if (pResp.ok) {
      const pText = await pResp.text();
      left.innerHTML = extractBodyContent(pText) || '<p>No se pudo cargar el aviso de privacidad.</p>';
    } else {
      left.innerHTML = '<p>No se pudo cargar el aviso de privacidad.</p>';
    }

    if (tResp.ok) {
      const tText = await tResp.text();
      right.innerHTML = extractBodyContent(tText) || '<p>No se pudieron cargar los términos.</p>';
    } else {
      right.innerHTML = '<p>No se pudieron cargar los términos.</p>';
    }
  } catch (fetchErr) {
    left.innerHTML = '<p>Error cargando contenidos.</p>';
    right.innerHTML = '<p>Error cargando contenidos.</p>';
    console.error('Error fetching legal pages:', fetchErr);
  }

  const controls = document.createElement('div');
  controls.style.marginTop = '12px';
  controls.style.display = 'flex';
  controls.style.flexDirection = 'column';
  controls.style.gap = '8px';
  controls.style.position = 'sticky';
  controls.style.bottom = '0';
  controls.style.background = 'linear-gradient(rgba(255,255,255,0), #fff)';
  controls.style.paddingTop = '8px';

  const chkPrivacy = document.createElement('input');
  chkPrivacy.type = 'checkbox';
  chkPrivacy.id = 'chkPrivacy';
  const lblPrivacy = document.createElement('label');
  lblPrivacy.htmlFor = 'chkPrivacy';
  lblPrivacy.textContent = 'He leído y acepto el Aviso de Privacidad';

  const chkTerms = document.createElement('input');
  chkTerms.type = 'checkbox';
  chkTerms.id = 'chkTerms';
  const lblTerms = document.createElement('label');
  lblTerms.htmlFor = 'chkTerms';
  lblTerms.textContent = 'He leído y acepto los Términos de Uso';

  const btnAccept = document.createElement('button');
  btnAccept.textContent = 'Aceptar y continuar';
  btnAccept.disabled = true;
  btnAccept.style.padding = '10px 14px';
  btnAccept.style.borderRadius = '6px';
  btnAccept.style.border = 'none';
  btnAccept.style.background = '#0078d4';
  btnAccept.style.color = '#fff';
  btnAccept.style.fontSize = '1rem';

  const btnLogout = document.createElement('button');
  btnLogout.textContent = 'Cerrar sesión';
  btnLogout.style.padding = '10px 14px';
  btnLogout.style.borderRadius = '6px';
  btnLogout.style.border = '1px solid #ccc';
  btnLogout.style.background = '#fff';
  btnLogout.style.color = '#333';

  const chkRow1 = document.createElement('div');
  chkRow1.appendChild(chkPrivacy);
  chkRow1.appendChild(lblPrivacy);
  const chkRow2 = document.createElement('div');
  chkRow2.appendChild(chkTerms);
  chkRow2.appendChild(lblTerms);

  controls.appendChild(chkRow1);
  controls.appendChild(chkRow2);

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.marginTop = '8px';
  actions.appendChild(btnAccept);
  actions.appendChild(btnLogout);

  modal.appendChild(controls);
  modal.appendChild(actions);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Mobile: ensure controls are visible and reachable (no special positioning needed since modal is fullscreen)
  function applyMobileControls() {
    const small = window.innerWidth <= 640;
    if (small) {
      controls.style.position = '';
      controls.style.paddingTop = '16px';
      controls.style.paddingBottom = '12px';
      controls.style.background = '#f5f5f5';
      controls.style.borderTop = '1px solid #ddd';
      controls.style.marginTop = '12px';
      actions.style.flexDirection = 'column';
      actions.querySelectorAll('button').forEach(b => { b.style.width = '100%'; b.style.padding = '14px 16px'; b.style.margin = '6px 0'; });
    } else {
      controls.style.position = '';
      controls.style.paddingTop = '8px';
      controls.style.paddingBottom = '';
      controls.style.background = '';
      controls.style.borderTop = '';
      controls.style.marginTop = '12px';
      actions.style.flexDirection = 'row';
      actions.querySelectorAll('button').forEach(b => { b.style.width = ''; b.style.padding = ''; b.style.margin = ''; });
    }
  }

  // increase label click area (so tapping the label toggles checkbox reliably)
  [lblPrivacy, lblTerms].forEach(lbl => {
    lbl.style.cursor = 'pointer';
    lbl.style.userSelect = 'none';
    lbl.style.padding = '10px 6px';
    lbl.style.display = 'inline-block';
  });

  // wire label clicks for reliability on some webviews
  lblPrivacy.addEventListener('click', () => { chkPrivacy.checked = !chkPrivacy.checked; updateAcceptEnabled(); });
  lblTerms.addEventListener('click', () => { chkTerms.checked = !chkTerms.checked; updateAcceptEnabled(); });

  applyMobileControls();
  window.addEventListener('resize', applyMobileControls);

  function updateAcceptEnabled() {
    btnAccept.disabled = !(chkPrivacy.checked && chkTerms.checked);
  }

  chkPrivacy.addEventListener('change', updateAcceptEnabled);
  chkTerms.addEventListener('change', updateAcceptEnabled);

  btnLogout.addEventListener('click', () => {
    try { window.location.href = 'login.html'; } catch (e) { console.warn(e); }
  });

  btnAccept.addEventListener('click', async () => {
    btnAccept.disabled = true;
    btnAccept.textContent = 'Guardando...';
    try {
      const now = new Date();
      await updateDoc(userDocRef, {
        accepted_privacy: true,
        accepted_terms: true,
        accepted_at: now
      });

      overlay.remove();
    } catch (updErr) {
      console.error('Error guardando aceptación:', updErr);
      alert('No se pudo guardar la aceptación. Intenta de nuevo.');
      btnAccept.disabled = false;
      btnAccept.textContent = 'Aceptar y continuar';
    }
  });
}

function extractBodyContent(htmlText) {
  try {
    const m = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (m && m[1]) return m[1];
    return htmlText;
  } catch (e) {
    return null;
  }
}
