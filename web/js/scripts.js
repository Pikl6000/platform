document.addEventListener('DOMContentLoaded', () => {
    function showLogin() {
        window.location.assign('login.html');
    }

    // Logout
    document.getElementById('logout').addEventListener('click', async function() {
        try {
            const response = await fetch('http://localhost:3000/api/logout', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                alert('Logged out successfully');
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

    // Call loadData when DOM is fully loaded
    loadData();
});

async function loadChat() {
    try {
        const token = localStorage.getItem('jwtToken'); // Získanie tokenu z localStorage

        //Zavolanie API na získanie chatov a údajov o používateľovi
        const chatsResponse = await fetch(`http://localhost:3000/api/chats/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Pridanie tokenu do hlavičky
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
                    'Authorization': `Bearer ${token}`, // Pridanie tokenu do hlavičky
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
        const token = localStorage.getItem('jwtToken'); // Získanie tokenu z localStorage

        // Odoslanie GET požiadavky na backend
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Pridanie tokenu do hlavičky
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        // Kontrola, či bola požiadavka úspešná
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        // Parsing odpovede na JSON
        const data = await response.json();

        // Nájdenie kontajnera, kde sa zoznam používateľov zobrazí
        const container = document.querySelector('.selection');
        container.innerHTML = ''; // Vyčistenie predchádzajúceho obsahu

        // Vytvorenie zoznamu (ul element)
        const ul = document.createElement('ul');
        ul.classList.add('list-group');

        // Iterácia cez používateľov a ich pridanie do zoznamu
        data.forEach(user => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'user-list-item');

            const sp = document.createElement('span');
            sp.classList.add('badge', 'rounded-pill', 'list-user-item');
            sp.textContent = `${user.name} ${user.lastname}`;

            li.appendChild(sp);
            ul.appendChild(li);
        });

        // Pridanie zoznamu do kontajnera
        container.appendChild(ul);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}
