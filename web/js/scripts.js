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
        document.getElementById('message').value = '';

        loadData();
    });

    document.getElementById('chats').addEventListener('click', async function() {
        const container = document.querySelector('.selection');
        container.innerHTML = '';
        document.getElementById('message').value = '';

        await loadChatData();
    });

    loadChatData();
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('message').value = '';
    // Deleguj udalosti na rodičovský element
    document.querySelector('.selection').addEventListener('click', async function(event) {
        if (event.target.classList.contains('user-list-item')) {
            const userId = event.target.id;

            try {
                const response = await fetch(`http://localhost:3000/api/chats/chat/${userId}`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (!response.ok) {
                    window.location.assign('login.html');
                    throw new Error('Failed to create or fetch chat');
                }

                const { chatId } = await response.json();

                // Oznám úspešné vytvorenie alebo načítanie chatu
                alert(`Chat s ID ${chatId} bol úspešne vytvorený alebo načítaný.`);
                window.location.assign('index.html');

                // Alternatívne môžeš použiť napríklad konzolový výstup:
                console.log(`Chat s ID ${chatId} bol úspešne vytvorený alebo načítaný.`);

            } catch (error) {
                console.error('Error creating or fetching chat:', error);
                alert('Nastala chyba pri vytváraní alebo načítaní chatu.');
            }
        }
    });

    document.querySelector('.selection').addEventListener('click', async function(event) {
        if (event.target.classList.contains('chat-list-item')) {
            // Získaj ID chatu z atribútu dataset
            const chatId = event.target.dataset.chatId;
            const recipientId = event.target.dataset.userId;

            // Nastav text obsahujúci názov chatu
            document.querySelector('.user-text-info-text').textContent = event.target.textContent.trim();

            // Nastav data-chat-id a data-recipient-id
            document.querySelector('.user-text-info-text').setAttribute('data-chat-id', chatId);
            document.querySelector('.user-text-info-text').setAttribute('data-recipient-id', recipientId);

            try {
                // Načítaj správy pre tento chat
                const token = localStorage.getItem('token');
                const messagesResponse = await fetch(`http://localhost:3000/api/chats/messages/${chatId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!messagesResponse.ok) {
                    if (messagesResponse.status === 401) {
                        window.location.assign('login.html');
                    }
                    throw new Error('Failed to fetch messages for the chat');
                }

                const messages = await messagesResponse.json();

                // Zobraz správy v UI
                displayMessages(messages);

                //document.getElementById('chatId').value = chatId;

            } catch (error) {
                console.error('Error fetching chat messages:', error);
                alert('Nastala chyba pri načítaní správ z chatu.');
            }
        }
    });
});

function loadMessages() {
    const chatId = document.querySelector('.user-text-info-text').dataset.chatId;
    const token = localStorage.getItem('token');

    fetch(`http://localhost:3000/api/chats/messages/${chatId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(messages => {
            displayMessages(messages); // Znovu vykresli správy
        })
        .catch(error => console.error('Error fetching messages:', error));
}
setInterval(loadMessages, 5000);


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

function scrollToBottom() {
    const messagesContainer = document.querySelector('.messages-box');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Funkcia na zobrazenie správ v UI
function displayMessages(messages) {
    const recipientId = document.querySelector('.user-text-info-text').dataset.recipientId;
    console.log('Recipient ID:', recipientId);
    const messagesContainer = document.querySelector('.messages-box-list');
    messagesContainer.innerHTML = ''; // Vyčisti staré správy

    // Vytvorenie zoznamu (ul element)
    const ul = document.createElement('ul');
    ul.classList.add('messages-chat-group');
    messagesContainer.appendChild(ul);

    messages.forEach(message => {
        const li = document.createElement('li');

        if (recipientId == message.sender_id) {
            li.classList.add('chat-list-item-sender', 'chat-list-item', 'list-group-item', 'd-flex', 'justify-content-start', 'ps-2', 'p-1', 'align-items-center');
        }
        else {
            li.classList.add('chat-list-item-recipient', 'chat-list-item', 'list-group-item', 'd-flex', 'justify-content-end', 'pe-2', 'p-1', 'align-items-center');
        }

        li.textContent = message.message;
        console.log(message);
        ul.appendChild(li);
    });

    scrollToBottom();
    document.getElementById('message').value = '';
}

async function loadData() {
    if (!await verifyToken()){
        window.location.assign('login.html');
        alert("Error, please login again");
        return;
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
    let token = localStorage.getItem('token');
    let data = await fetchWithToken('http://localhost:3000/api/chats/chats', token);

    if (data) {
        console.log('Chat data:', data);
        displayChatData(data); // Volanie funkcie na zobrazenie alebo ďalšie spracovanie dát
    } else {
        console.error('No data received');
    }
}

function displayChatData(chats) {
    const container = document.querySelector('.selection');
    container.innerHTML = '';

    const h = document.createElement('h1');
    h.classList.add('chat-text');
    h.textContent = "Chats";
    container.appendChild(h);

    const ul = document.createElement('ul');
    ul.classList.add('list-group');

    chats.forEach(chat => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'chat-list-item');
        li.dataset.chatId = chat.chatId;
        li.dataset.userId = chat.userId;

        const userName = document.createElement('span');
        userName.classList.add('badge', 'rounded-pill', 'list-user-item', 'p-0');
        userName.textContent = `${chat.chatname}`;
        li.appendChild(userName);

        ul.appendChild(li);
    });

    container.appendChild(ul);

    document.getElementById('message').value = '';
}

// Funkcia na načítanie dát s daným tokenom
async function fetchWithToken(url, token) {
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include"
        });

        console.log('Response:', response);
        console.log('Response Status:', response.status);
        console.log('Response Status Text:', response.statusText);

        if (!response.ok) {
            const errorText = await response.text(); // Získajte text odpovede pre podrobnejšie chybové správy
            console.error('Fetch error:', errorText);
            if (response.status === 401) return null; // Token je neplatný
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const data = await response.json(); // Vráti načítané dáta
        console.log('Fetched Data:', data);
        return data;
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


async function sendMessage() {
    const message = document.getElementById('message').value;
    const chatId = document.querySelector('.user-text-info-text').dataset.chatId;
    const recipientId = document.querySelector('.user-text-info-text').dataset.recipientId;
    console.log('Chat ID:', chatId);
    console.log('Recipient ID:', recipientId);

    if (!message.trim()) {
        alert('Message cannot be empty');
        return;
    }

    try {
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:3000/api/chats/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                chatId,
                message,
                to: recipientId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Message sent:', data);

        // Po odoslaní správy načítaj správy znova, aby si aktualizoval chat s novou správou
        const messagesResponse = await fetch(`http://localhost:3000/api/chats/messages/${chatId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (messagesResponse.ok) {
            const messages = await messagesResponse.json();
            displayMessages(messages);
        }

        // Vyčisti input pole správy
        document.getElementById('message').value = '';

    } catch (error) {
        console.error('Error sending message:', error);
    }

    // Vyčistenie inputu po odoslaní
    document.getElementById('message').value = '';
}

// Odoslanie správy tlačidlom
document.getElementById('sendButton').addEventListener('click', sendMessage);

// Odoslanie správy klávesom Enter
document.getElementById('message').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
        event.preventDefault();
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
