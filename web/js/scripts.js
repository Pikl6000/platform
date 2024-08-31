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

    document.getElementById('people').addEventListener('click', async function() {
        const container = document.querySelector('.selection');
        container.innerHTML = '';

        loadData();


    });

    document.getElementById('chats').addEventListener('click', async function() {
        const container = document.querySelector('.selection');
        container.innerHTML = '';

        loadChatData();


    });

    loadChatData();
});

document.addEventListener('DOMContentLoaded', () => {
    // Deleguj udalosti na rodičovský element
    document.querySelector('.selection').addEventListener('click', async function(event) {
        if (event.target.classList.contains('user-list-item')) {
            const userId = event.target.id;
            document.querySelector('.user-text-info-text').textContent = event.target.textContent.trim();

            try {
                const response = await fetch(`http://localhost:3000/api/chats/chat/${userId}`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to create or fetch chat');
                    window.location.assign('login.html');
                }

                const { chatId } = await response.json();

                // Oznám úspešné vytvorenie alebo načítanie chatu
                alert(`Chat s ID ${chatId} bol úspešne vytvorený alebo načítaný.`);

                // Alternatívne môžeš použiť napríklad konzolový výstup:
                console.log(`Chat s ID ${chatId} bol úspešne vytvorený alebo načítaný.`);

            } catch (error) {
                console.error('Error creating or fetching chat:', error);
                alert('Nastala chyba pri vytváraní alebo načítaní chatu.');
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Získaj všetky elementy s triedou 'user-list-item'
    const userItems = document.querySelectorAll('.user-list-item');

    // Prejdi cez všetky elementy a pridaj 'click' event listener
    userItems.forEach(item => {
        item.addEventListener('click', async function() {

            try {
                // Získaj ID chatu alebo vytvor nový
                const response = await fetch(`http://localhost:3000/api/chats/chat/${userId}`, {
                    credentials: 'include'
                });
                const { chatId } = await response.json();

                // Získaj správy pre tento chat
                const messagesResponse = await fetch(`http://localhost:3000/api/chats/messages/${chatId}`, {
                    credentials: 'include'
                });
                const messages = await messagesResponse.json();

                // Zobraz správy v UI
                displayMessages(messages);
            } catch (error) {
                console.error('Error fetching chat or messages:', error);
            }
        });
    });
});

// Funkcia na zobrazenie správ v UI
function displayMessages(messages) {
    const messagesContainer = document.querySelector('.messages-box .container-fluid');
    messagesContainer.innerHTML = ''; // Vyčisti staré správy

    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.textContent = message.message; // Pridaj text správy
        messagesContainer.appendChild(messageElement);
    });
}



async function loadChat() {
    if (!await verifyToken()){
        window.location.assign('login.html');
        alert("Error, please login again");
    }

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
    if (!await verifyToken()){
        window.location.assign('login.html');
        alert("Error, please login again");
    }

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
        container.innerHTML = '';

        const h = document.createElement('h1');
        h.classList.add('chat-text');
        h.textContent = "Users";
        container.appendChild(h);

        // Vytvorenie zoznamu (ul element)
        const ul = document.createElement('ul');
        ul.classList.add('list-group');

        // Iterácia cez používateľov a ich pridanie do zoznamu
        data.forEach(user => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'user-list-item');
            li.id = `${user.id}`;

            const userName = document.createElement('span');
            userName.classList.add('badge', 'rounded-pill', 'list-user-item', 'p-0');
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

async function loadChatData() {
    if (!await verifyToken()){
        window.location.assign('login.html');
        alert("Error, please login again");
    }

    try {
        // Načítaj token z localStorage
        let token = localStorage.getItem('token');

        // Volanie funkcie na načítanie chatov a používateľov
        let response = await fetchWithToken('http://localhost:3000/api/chats/chats', token);
        let data = await response.json(); // Získaj JSON z odpovede

        if (!data) {
            // Ak sa token nedá použiť, pokús sa o obnovu tokenu
            token = await refreshAccessToken();
            if (!token) throw new Error('Unable to refresh token');

            // Volanie funkcie na načítanie dát s obnoveným tokenom
            response = await fetchWithToken('http://localhost:3000/api/chats/chats', token);
            data = await response.json();
            if (!data || data.error) throw new Error('Unable to fetch data after refreshing token');
        }

        // Pokračuj s načítanými dátami
        console.log(data);

        const container = document.querySelector('.selection');
        container.innerHTML = '';

        const h = document.createElement('h1');
        h.classList.add('chat-text');
        h.textContent = "Chats";
        container.appendChild(h);

        // Vytvorenie zoznamu (ul element)
        const ul = document.createElement('ul');
        ul.classList.add('list-group');

        // Iterácia cez chaty a ich pridanie do zoznamu
        data.forEach(chat => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'user-list-item');
            li.dataset.chatId = chat.chatId; // Použitie data atribútu pre chatId

            const userName = document.createElement('span');
            userName.classList.add('badge', 'rounded-pill', 'list-user-item', 'p-0');
            userName.textContent = `${chat.name} ${chat.lastname}`;
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
            const errorText = await response.text(); // Získajte text odpovede pre podrobnejšie chybové správy
            console.error('Fetch error:', errorText);
            if (response.status === 401) return null; // Token je neplatný
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
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

document.getElementById('sendButton').addEventListener('click', async () => {
    // Získanie hodnoty z input polí
    const message = document.getElementById('message').value;
    const chatId = document.getElementById('chatId').value;
    const receiverId = document.getElementById('receiverId').value;

    if (!message.trim()) {
        alert('Message cannot be empty');
        return;
    }

    try {
        const token = localStorage.getItem('token'); // Získanie tokenu z localStorage

        // Odošli správu na server
        const response = await fetch('http://localhost:3000/api/chats/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                chatId,
                message,
                to: receiverId // ID príjemcu
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Message sent:', data);

        // Vyčistenie input pola správy
        document.getElementById('message').value = '';
    } catch (error) {
        console.error('Error sending message:', error);
    }
});

async function verifyToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found in localStorage');
        return false;
    }

    try {
        const response = await fetch('http://localhost:3000/api/verify', {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        if (result.valid) {
            console.log('Token is valid');
            return true;
        } else {
            console.log('Token is invalid');
            return false;
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        return false;
    }
}
