document.addEventListener('DOMContentLoaded', () => {
    function showLogin() {
        window.location.assign('login.html');
    }

    loadData();

    // Logout
    document.getElementById('logout').addEventListener('click', async function() {
        try {
            const response = await fetch('http://localhost:3000/logout', {
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

});

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Zavolanie API na získanie chatov a údajov o používateľovi
        const chatsResponse = await fetch(`http://localhost:3000/api/chats/`, {
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
});

async function loadData() {
    try {
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log('Data received:', data);

        const container = document.querySelector('.selection');
        container.innerHTML = ''; // Vyčistenie predchádzajúceho obsahu

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

        container.appendChild(ul); // Pridanie zoznamu do kontajnera
    } catch (error) {
        console.error('Error loading data:', error);
        const container = document.querySelector('.selection');
        container.textContent = `Error loading data: ${error.message}`;
    }
}
