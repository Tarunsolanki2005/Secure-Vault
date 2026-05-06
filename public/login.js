async function login() {

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        console.log("LOGIN RESPONSE:", data);

        // ❌ HANDLE ERROR PROPERLY
        if (!res.ok || !data.token) {
            alert(data.message || "❌ Wrong username or password");
            return;
        }

        // ✅ SAVE TOKEN
        localStorage.setItem("token", data.token);

        console.log("TOKEN SAVED:", localStorage.getItem("token"));

        alert("Login successful ✅");

        // ✅ SWITCH UI SAFELY
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("registerSection").style.display = "none";
        document.getElementById("dashboardSection").style.display = "block";

    } catch (error) {
        console.log(error);
        alert("❌ Server error. Please try again.");
    }
}