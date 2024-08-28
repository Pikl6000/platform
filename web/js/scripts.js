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
        let token = localStorage.getItem('token');

        const response = await fetch('http://localhost:3000/api/users', {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include"
        });

        if (response.status === 401) {
            token = await refreshAccessToken();
            if (!token) throw new Error('Unable to refresh token');

            const retryResponse = await fetch('http://localhost:3000/api/users', {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include"
            });

            if (!retryResponse.ok) throw new Error('Network response was not ok');
            const data = await retryResponse.json();
            // Pokračuj s dátami
        } else {
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            // Pokračuj s dátami
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function refreshAccessToken() {
    try {
        const response = await fetch('http://localhost:3000/api/refresh-token', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.accessToken);
            return data.accessToken;
        } else {
            throw new Error('Failed to refresh access token');
        }
    } catch (error) {
        console.error('Error refreshing access token:', error);
    }
}
