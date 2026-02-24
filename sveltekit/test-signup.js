const email = "test" + Date.now() + "@example.com";
const body = {
    email,
    password: "password123",
    name: "Test User",
    role: "USER_PROCUREMENT"
};

console.log("Testing sign up with:", email);

fetch("http://localhost:5173/api/auth/sign-up/email", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
})
    .then(async res => {
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    })
    .catch(err => {
        console.error("Fetch error:", err);
    });
