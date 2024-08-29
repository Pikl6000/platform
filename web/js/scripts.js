document.addEventListener('DOMContentLoaded', () => {
    function showLogin() {
        window.location.assign('login.html');
    }

    // Logout
    document.getElementById('logout').addEventListener('click', async function() {
        try {
            await fetch('http://localhost:3000/api/logout', {
                method: 'GET',
                credentials: 'include'
            });

            localStorage.removeItem('token');

            alert('Logged out successfully');
            showLogin();
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Logout failed');
        }
    });

    loadData();
});

async function loadChat() {
    try {
        const token = localStorage.getItem('token');

        const chatsResponse = await fetch('http://localhost:3000/api/chats/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!chatsResponse.ok) throw new Error(`HTTP error! status: ${chatsResponse.status}`);

        const { chats, currentUser } = await chatsResponse.json();
        const userId = currentUser.id;

        if (chats.length > 0) {
            const firstChatId = chats[0].chatId;
            const messagesResponse = await fetch(`http://localhost:3000/api/messages/${firstChatId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
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
        // Načítaj token z localStorage
        let token = localStorage.getItem('token');

        // Volanie funkcie na načítanie dát
        let data = await fetchWithToken('http://localhost:3000/api/users/', token);

        if (!data) {
            // Ak sa token nedá použiť, pokús sa o obnovu tokenu
            token = await refreshAccessToken();
            if (!token) throw new Error('Unable to refresh token');

            // Volanie funkcie na načítanie dát s obnoveným tokenom
            data = await fetchWithToken('http://localhost:3000/api/users/', token);
            if (!data) throw new Error('Unable to fetch data after refreshing token');
        }

        // Pokračuj s načítanými dátami
        console.log(data);

        const container = document.querySelector('.selection');
        container.innerHTML = ''; // Vyčistenie predchádzajúceho obsahu

        // Vytvorenie zoznamu (ul element)
        const ul = document.createElement('ul');
        ul.classList.add('list-group');

        // Iterácia cez používateľov a ich pridanie do zoznamu
        data.forEach(user => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'user-list-item');

            const userName = document.createElement('span');
            userName.classList.add('badge', 'rounded-pill', 'list-user-item');
            userName.textContent = `${user.name} ${user.lastname}`;
            li.appendChild(userName);

            ul.appendChild(li);
        });

        // Pridanie zoznamu do kontajnera
        container.appendChild(ul);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Funkcia na načítanie dát s daným tokenom
async function fetchWithToken(url, token) {
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include"
        });

        if (!response.ok) {
            if (response.status === 401) return null; // Token je neplatný
            throw new Error('Network response was not ok');
        }

        return await response.json(); // Vráti načítané dáta
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

// Funkcia na obnovu tokenu
async function refreshAccessToken() {
    try {
        const response = await fetch('http://localhost:3000/api/users/refresh-token', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('token', token);
            return token; // Vráti obnovený token
        }
        return null; // Ak sa token nedá obnoviť
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
}