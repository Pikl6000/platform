document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Načítanie session dát
    const sessionData = JSON.parse(localStorage.getItem('session'));

    if (sessionData && sessionData.user) {
        console.log('User is logged in:', sessionData.user);
        // Načítaj chat a ďalšie údaje
        loadData();
    } else {
        console.log('User is not logged in');
        showLogin();
    }

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
        const lastName = document.getElementById('registerLastName').value;

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    lastName,
                    joineddate: new Date(),
                    lastonlinedate: new Date()
                })
            });

            if (response.ok) {
                alert('Registration successful!');
                showLogin();
            } else {
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
        const username = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Zahŕňaj cookies pri CORS požiadavkách
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const sessionData = await response.json();
                localStorage.setItem('session', JSON.stringify(sessionData)); // Uloženie session dát
                localStorage.setItem('jwtToken', sessionData.token); // Uloženie JWT tokenu
                console.log('Session stored in localStorage:', localStorage.getItem('session'));
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