import { signup } from "./auth-firebase.js";

const form = document.getElementById("signupForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = form.username.value;
  const email = form.email.value;
  const password = form.password.value;

  try {
    await signup(username, email, password);
    // Al crear la cuenta, redirigir al inicio; el guard mostrará el modal si no aceptó
    window.location.href = "index.html";
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});
