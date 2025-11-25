import { login } from "./auth-firebase.js";

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await login(email, password);
    window.location.href = "index.html";
  } catch (err) {
    errorMsg.textContent = "Credenciales incorrectas.";
  }
});
