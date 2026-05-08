let passwordsLoaded = false;
window.allPasswords = [];

// 🌐 API
const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://securevault-backend-xpsb.onrender.com";

// ================= UI =================
function showRegister() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "block";
}

function showLogin() {
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
}

// ================= LOGIN =================
async function login() {
    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: document.getElementById("loginUsername").value,
                password: document.getElementById("loginPassword").value
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Login failed ❌");
            return;
        }

        localStorage.setItem("token", data.token);

        document.getElementById("loginSection").style.display = "none";
        document.getElementById("registerSection").style.display = "none";
        document.getElementById("dashboardSection").style.display = "block";

        showToast("Login success ✅");

    } catch (err) {
        console.log(err);
        alert("Server error ❌");
    }
}

// ================= REGISTER =================
async function register() {
    try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: document.getElementById("registerUsername").value,
                password: document.getElementById("registerPassword").value
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Register failed ❌");
            return;
        }

        showToast("Registered ✅");
        showLogin();

    } catch (err) {
        console.log(err);
        alert("Server error ❌");
    }
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("token");
    document.getElementById("dashboardSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
}

// ================= TOAST =================
function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.innerText = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2000);
}

// ================= PASSWORD STRENGTH (FINAL FIXED) =================
function checkStrength(password) {
    const bar = document.getElementById("strengthFill");
    const text = document.getElementById("strengthText");

    if (!bar || !text) return;

    let strength = 0;

    if (password.length > 5) strength++;
    if (password.length > 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    let percent = (strength / 5) * 100;

    let color = "red";
    let label = "Weak";

    if (strength >= 2) {
        color = "orange";
        label = "Medium";
    }
    if (strength >= 4) {
        color = "#22c55e";
        label = "Strong";
    }

    bar.style.width = percent + "%";
    bar.style.background = color;
    text.innerText = "Strength: " + label;
}

// ================= GENERATE PASSWORD =================
function generatePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";

    for (let i = 0; i < 12; i++) {
        pass += chars[Math.floor(Math.random() * chars.length)];
    }

    document.getElementById("password").value = pass;
    checkStrength(pass);
}

// ================= SAVE =================
async function savePassword() {
    const token = localStorage.getItem("token");

    if (!token) {
        showToast("Login first ❌");
        return;
    }

    const website = document.getElementById("website").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!website || !username || !password) {
        showToast("Fill all fields");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/password/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ website, username, password })
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        showToast(data.message || "Saved ✅");

        if (passwordsLoaded) loadPasswords();

        clearInputs();

    } catch (err) {
        console.log(err);
        showToast("Save failed ❌");
    }
}

// ================= LOAD =================
async function loadPasswords() {
    const token = localStorage.getItem("token");

    if (!token) {
        showToast("Login first ❌");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/password/`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        window.allPasswords = data || [];
        displayPasswords(window.allPasswords);
        passwordsLoaded = true;

    } catch (err) {
        console.log(err);
        showToast("Load failed ❌");
    }
}

// ================= DISPLAY =================
function displayPasswords(data) {
    const container = document.getElementById("list");
    if (!container) return;

    container.innerHTML = "";

    if (!data || data.length === 0) {
        container.innerHTML = "<p>No passwords saved yet</p>";
        return;
    }

    data.forEach(item => {
        const div = document.createElement("div");

        div.innerHTML = `
            <div class="card">
                <p><strong>${item.website}</strong></p>
                <p>${item.username}</p>

                <div class="pass-row">
                    <span class="pass">••••••</span>

                    <div class="actions">
                        <button onclick="togglePass(this, '${item.password}')">👁️</button>
                        <button onclick="copyPassword('${item.password}')">📋</button>
                        <button onclick="editPassword('${item._id}', '${item.website}', '${item.username}', '${item.password}')">✏️</button>
                        <button onclick="deletePassword('${item._id}')">🗑️</button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(div);
    });
}

// ================= SEARCH =================
function filterPasswords() {
    const q = document.getElementById("searchBar").value.toLowerCase();

    const filtered = window.allPasswords.filter(i =>
        i.website.toLowerCase().includes(q)
    );

    displayPasswords(filtered);
}

// ================= HELPERS =================
function togglePass(btn, pass) {
    const el = btn.closest(".pass-row").querySelector(".pass");
    el.innerText = (el.innerText === "••••••") ? pass : "••••••";
}

function copyPassword(pass) {
    navigator.clipboard.writeText(pass);
    showToast("Copied");
}

async function deletePassword(id) {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/api/password/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });

    showToast("Deleted");
    loadPasswords();
}

function clearInputs() {
    document.getElementById("website").value = "";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}