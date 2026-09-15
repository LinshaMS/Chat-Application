const loginForm = document.getElementById("loginForm");

const loginMessage = document.getElementById("loginMessage");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;


    try {

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });


        const data = await response.json();


        if (!response.ok) {

            loginMessage.textContent = data.message;

            return;
        }


        // Store JWT
        localStorage.setItem("token", data.token);


        // Store user information
        localStorage.setItem("userId", data.user.id);

        localStorage.setItem("username", data.user.username);


        // Go to chat page
        window.location.href = "/";

    } catch (error) {

        console.error(error);

        loginMessage.textContent =
            "Something went wrong. Please try again.";

    }

});