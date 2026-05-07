let passwordsLoaded = false;
window.allPasswords = [];

// 🌐 API
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://securevault-backend-xpsb.onrender.com";

function getToken() {
    return localStorage.getItem("token");
}

// 🔔 TOAST
function showToast(msg){
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.classList.add("show");
    setTimeout(()=>t.classList.remove("show"),2000);
}

// 💪 PASSWORD STRENGTH
function checkStrength() {
    const pass = document.getElementById("password").value;
    const bar = document.getElementById("strengthBar");
    const text = document.getElementById("strengthText");

    let strength = 0;

    if (pass.length > 6) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;

    if (strength <= 1) {
        bar.style.width = "25%";
        bar.style.background = "red";
        text.innerText = "Weak";
    } else if (strength === 2) {
        bar.style.width = "50%";
        bar.style.background = "orange";
        text.innerText = "Medium";
    } else {
        bar.style.width = "100%";
        bar.style.background = "green";
        text.innerText = "Strong";
    }
}

// 🔐 GENERATE PASSWORD
function generatePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";

    for (let i = 0; i < 12; i++) {
        pass += chars[Math.floor(Math.random() * chars.length)];
    }

    document.getElementById("password").value = pass;
    checkStrength();
}

// 👁️ TOGGLE PASSWORD INPUT
function toggleInputPassword() {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
}

// ================= SAVE =================
async function savePassword(){
    const token = getToken();

    if (!token) {
        showToast("Login first ❌");
        return;
    }

    const website = document.getElementById("website").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if(!website || !username || !password){
        showToast("Fill all fields");
        return;
    }

    try{
        const res = await fetch(`${API_URL}/api/password/add`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer " + token
            },
            body:JSON.stringify({website,username,password})
        });

        if (!res.ok) {
            throw new Error("Save failed");
        }

        const data = await res.json();
        showToast(data.message || "Saved");

        if(passwordsLoaded) loadPasswords();

        clearInputs();

    }catch(err){
        console.log(err);
        showToast("Save failed ❌");
    }
}

// ================= LOAD =================
async function loadPasswords(){
    const token = getToken();

    if (!token) return;

    try{
        const res = await fetch(`${API_URL}/api/password/`,{
            headers:{ "Authorization":"Bearer " + token }
        });

        if (!res.ok) throw new Error("Load failed");

        const data = await res.json();

        window.allPasswords = data || [];
        displayPasswords(window.allPasswords);
        passwordsLoaded = true;

    }catch(err){
        console.log(err);
        showToast("Load failed ❌");
    }
}

// ================= DISPLAY =================
function displayPasswords(data) {
    const container = document.getElementById("list");
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

// ================= DELETE =================
async function deletePassword(id){
    const token = getToken();

    if (!token) return;

    await fetch(`${API_URL}/api/password/${id}`,{
        method:"DELETE",
        headers:{ "Authorization":"Bearer " + token }
    });

    showToast("Deleted");
    loadPasswords();
}

// ================= UPDATE =================
async function updatePassword(id, website, username, password) {
    const token = getToken();

    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/api/password/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type":"application/json",
                "Authorization":"Bearer " + token
            },
            body: JSON.stringify({ website, username, password })
        });

        if (!res.ok) throw new Error("Update failed");

        const data = await res.json();
        showToast(data.message || "Updated");

        if (passwordsLoaded) loadPasswords();

    } catch (err) {
        console.log(err);
        showToast("Update failed ❌");
    }
}

// ================= HELPERS =================
function togglePass(btn, pass) {
    const el = btn.closest(".pass-row").querySelector(".pass");
    el.innerText = (el.innerText === "••••••") ? pass : "••••••";
}

function copyPassword(pass){
    navigator.clipboard.writeText(pass);
    showToast("Copied");
}

function editPassword(id, website, username, password) {
    const newWebsite = prompt("Edit Website:", website);
    if (newWebsite === null) return;

    const newUsername = prompt("Edit Username:", username);
    if (newUsername === null) return;

    const newPassword = prompt("Edit Password:", password);
    if (newPassword === null) return;

    if (!newWebsite.trim() || !newUsername.trim() || !newPassword.trim()) {
        showToast("Fields cannot be empty ❗");
        return;
    }

    updatePassword(id, newWebsite, newUsername, newPassword);
}

function clearInputs(){
    document.getElementById("website").value="";
    document.getElementById("username").value="";
    document.getElementById("password").value="";
    document.getElementById("strengthBar").style.width = "0%";
    document.getElementById("strengthText").innerText = "";
}