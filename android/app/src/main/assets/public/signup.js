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
    window.location.href = "login.html";
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});
