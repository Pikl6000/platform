document.addEventListener('DOMContentLoaded', () => {
    function showLogin() {
        window.location.assign('login.html');
    }

    // Logout
    document.getElementById('logout').addEventListener('click', async function() {
        try {
            const response = await fetch('http://localhost:3000/logout', {
                method: 'GET', // Ak váš server vyžaduje GET metódu
                credentials: 'include' // Uistite sa, že posielate cookies na server (ak používate cookies na sledovanie relácie)
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
});




async function loadData() {
    try {
        const response = await fetch('http://localhost:3000/api/users');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Data received:', data);

        // Vyber div s triedou "selection"
        const container = document.querySelector('.selection');

        // Vyčisti predchádzajúci obsah
        container.innerHTML = '';

        // Vytvor zoznam
        const ul = document.createElement('ul');
        ul.classList.add('list-group');

        data.forEach(user => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', "user-list-item");

            const sp = document.createElement('span');
            sp.classList.add('badge', 'rounded-pill', 'list-user-item');
            sp.textContent = `${user.name} ${user.lastname}`;

            li.appendChild(sp);
            ul.appendChild(li);
        });

        // Pridaj zoznam do kontajnera
        container.appendChild(ul);
    } catch (error) {
        console.error('Error loading data:', error);
        const container = document.querySelector('.selection');
        container.textContent = `Error loading data: ${error.message}`;
    }
}

document.addEventListener('DOMContentLoaded', loadData);


document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Zmeň ID používateľa podľa potreby
        const userId = 1;

        // Načítaj zoznam chatov
        const chatsResponse = await fetch(`/api/chats/${userId}`);
        const chats = await chatsResponse.json();

        if (chats.length > 0) {
            // Načítaj správy pre prvý chat
            const firstChatId = chats[0].chatId;
            const messagesResponse = await fetch(`/api/messages/${firstChatId}`);
            const messages = await messagesResponse.json();

            // Vyber div pre správy
            const messagesBox = document.querySelector('.messages-box .container-fluid');
            messagesBox.innerHTML = '';  // Vyčisti obsah

            // Zobraz správy
            messages.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.textContent = `${msg.message} (${msg.sendTime})`;  // Môžeš prispôsobiť formát zobrazenia
                messagesBox.appendChild(messageElement);
            });
        }
    } catch (error) {
        console.error('Error loading chat data:', error);
    }
});

document.getElementById('sendButton').addEventListener('click', async function() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;
    const chatId = 1; // Zmeň na aktuálne chatId
    const fromUserId = 1; // Zmeň na ID aktuálneho používateľa
    const toUserId = 2; // Zmeň na ID prijímateľa

    if (message.trim() !== '') {
        try {
            const response = await fetch('http://localhost:3000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: fromUserId,
                    to: toUserId,
                    chatId: chatId,
                    message: message
                })
            });

            if (response.ok) {
                messageInput.value = ''; // Vyčistiť input po úspešnom odoslaní
                console.log('Message sent successfully');
                // Môžeš tu tiež zavolať funkciu na obnovenie správ v messages-box
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    } else {
        console.log('Message is empty');
    }
});
