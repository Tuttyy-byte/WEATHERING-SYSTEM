
const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});


let users = JSON.parse(localStorage.getItem("nbsc_users")) || [];


if (!users.find(u => u.email === "demo@nbsc.edu")) {
  users.push({ name: "Demo Professor", email: "demo@nbsc.edu", password: "demo123" });
  localStorage.setItem("nbsc_users", JSON.stringify(users));
}

function saveUsers() {
  localStorage.setItem("nbsc_users", JSON.stringify(users));
}

document.getElementById("signupForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const errorDiv = document.getElementById("signupError");

  if (!name || !email || !password) {
    errorDiv.innerText = "All fields are required.";
    return;
  }
  if (users.find(u => u.email === email)) {
    errorDiv.innerText = "Email already registered. Please sign in.";
    return;
  }
  users.push({ name, email, password });
  saveUsers();
  
  localStorage.setItem("nbsc_current_user", JSON.stringify({ name, email }));
 
  window.location.href = "dashboard.html";
});


document.getElementById("signinForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const errorDiv = document.getElementById("loginError");

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    errorDiv.innerText = "Invalid email or password.";
    return;
  }
  localStorage.setItem("nbsc_current_user", JSON.stringify({ name: user.name, email: user.email }));
  window.location.href = "dashboard.html";
});


document.getElementById("forgotPasswordLink").addEventListener("click", function(e) {
  e.preventDefault();
  alert("Please contact the NBSC Registrar's Office or use demo@nbsc.edu / demo123 to login.");
});


