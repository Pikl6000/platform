document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    function showLogin() {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    }

    function showRegister() {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }

    function showMainPage() {
        window.location.assign('index.html');
    }

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegister();
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });

    // Spracovanie registrácie
    document.getElementById('registrationFormSubmit').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const name = document.getElementById('registerName').value;
        const lastname = document.getElementById('registerLastName').value;

        // Skontrolujte, či sú všetky povinné hodnoty vyplnené
        if (!email || !password || !name || !lastname) {
            alert('All fields are required!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    lastname,
                    joineddate: new Date().toISOString(),
                    lastonline: new Date().toISOString()
                }),
                credentials: 'include'
            });

            if (response.ok) {
                alert('Registration successful!');
                document.getElementById('registerEmail').value = '';
                document.getElementById('registerPassword').value = '';
                document.getElementById('registerName').value = '';
                document.getElementById('registerLastName').value = '';
                showLogin();
            } else {
                document.getElementById('registerEmail').value = '';
                document.getElementById('registerPassword').value = '';
                document.getElementById('registerName').value = '';
                document.getElementById('registerLastName').value = '';
                const errorText = await response.text();
                alert(`Registration failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed: Server error');
        }
    });

    // Spracovanie prihlásenia
    document.getElementById('loginFormSubmit').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem('token', token);
                showMainPage();
            } else {
                const errorText = await response.text();
                alert(`Login failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred');
        }
    });

    showLogin();
});

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (token) {
        try {
            console.log("Check token with api");
            const response = await fetch('http://localhost:3000/api/users/verifyToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                window.location.href = 'index.html';
                console.log("Check token 8=D");
            }
        } catch (error) {
            console.error('Error verifying token:', error);
        }
    }
});
