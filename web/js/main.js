document.addEventListener('DOMContentLoaded', () => {
    // Zobrazenie prihlasovacej stránky
    function showLogin() {
        window.location.assign('login.html');
    }

    // Zobrazenie hlavnej stránky
    function showMainPage() {
        window.location.assign('index.html');
    }

    // Odhlásenie používateľa
    document.getElementById('logout').addEventListener('click', async function() {
        try {
            const response = await fetch('http://localhost:3000/api/logout', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                alert('Logged out successfully');
                localStorage.removeItem('session'); // Odstránenie session dát z localStorage
                showLogin();
            } else {
                const errorText = await response.text();
                alert(`Error: ${errorText}`);
            }
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Logout failed');
        }
    });

    // Načítanie dát pri načítaní stránky
    loadData();
    checkSession();
    handleForms();
});

async function loadChat() {
    try {
        // Zavolanie API na získanie chatov a údajov o používateľovi
        const chatsResponse = await fetch('http://localhost:3000/api/chats/', {
            method: 'GET',
            credentials: 'include'
        });

        if (!chatsResponse.ok) throw new Error(`HTTP error! status: ${chatsResponse.status}`);

        const { chats, currentUser } = await chatsResponse.json();
        const userId = currentUser.id;

        if (chats.length > 0) {
            const firstChatId = chats[0].chatId;
            const messagesResponse = await fetch(`http://localhost:3000/api/messages/${firstChatId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!messagesResponse.ok) throw new Error(`HTTP error! status: ${messagesResponse.status}`);

            const messages = await messagesResponse.json();
            const messagesBox = document.querySelector('.messages-box .container-fluid');
            messagesBox.innerHTML = '';

            messages.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.textContent = `${msg.message} (${msg.sendTime})`;
                messagesBox.appendChild(messageElement);
            });
        }
    } catch (error) {
        console.error('Error loading chat data:', error);
    }
}

async function loadData() {
    try {
        const response = await fetch('http://localhost:3000/api/users', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        const container = document.querySelector('.selection');
        container.innerHTML = '';

        const ul = document.createElement('ul');
        ul.classList.add('list-group');

        data.forEach(user => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'user-list-item');

            const sp = document.createElement('span');
            sp.classList.add('badge', 'rounded-pill', 'list-user-item');
            sp.textContent = `${user.name} ${user.lastname}`;

            li.appendChild(sp);
            ul.appendChild(li);
        });

        container.appendChild(ul);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function checkSession() {
    try {
        const response = await fetch('http://localhost:3000/api/getSession', {
            credentials: 'include'
        });

        const text = await response.text();
        console.log(text); // Bude vypisovať "Username: ..." alebo "No session data found"
    } catch (error) {
        console.error('Chyba pri kontrole session:', error);
    }
}

function handleForms() {
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
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const sessionData = await response.json();
                localStorage.setItem('session', JSON.stringify(sessionData));
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
}
