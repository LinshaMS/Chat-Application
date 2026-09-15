const registerForm = document.getElementById("registerForm");

const registerMessage =
    document.getElementById("registerMessage");


registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    try {

        const response = await fetch("/api/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                email,
                password
            })

        });


        const data = await response.json();


        if (!response.ok) {

            registerMessage.textContent =
                data.message || "Registration failed";

            return;
        }


        registerMessage.textContent =
            "Registration successful! Redirecting...";


        setTimeout(() => {

            window.location.href = "/login.html";

        }, 1000);


    } catch (error) {

        console.error(error);

        registerMessage.textContent =
            "Something went wrong. Please try again.";

    }

});