document.addEventListener('DOMContentLoaded', () => {
    function showLogin() {
        window.location.assign('login.html');
    }

    if (!verifyToken()){
        alert("Error, please login again");
        showLogin();
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
        removeChatData();

        loadData();
    });

    document.getElementById('chats').addEventListener('click', async function() {
        const container = document.querySelector('.selection');
        container.innerHTML = '';
        removeChatData();

        await loadChatData();
    });

    document.getElementById('profile').addEventListener('click', async function() {
        const container = document.querySelector('.selection');
        container.innerHTML = '';
        removeChatData();

        await loadProfile();
    });

    loadChatData();
});

// Create chat
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('message').value = '';
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
                alert(`Chat ${chatId} was created or fetched.`);
                window.location.assign('index.html');

                console.log(`Chat ${chatId} was created or fetched.`);

            } catch (error) {
                console.error('Error creating or fetching chat:', error);
                alert('Error occurred while creating or fetching chat. Please try again later.');
            }
        }
    });

    document.querySelector('.selection').addEventListener('click', async function(event) {
        if (event.target.classList.contains('chat-list-item')) {
            // Remove selected state from other targets
            document.querySelectorAll('.list-group-item-users-selected').forEach(item => {
                item.classList.remove('list-group-item-users-selected');
            });

            event.target.classList.add('list-group-item-users-selected');
            // Get ids
            const chatId = event.target.dataset.chatId;
            const recipientId = event.target.dataset.userId;

            // Set help variables
            document.querySelector('.user-text-info-text').textContent = event.target.textContent.trim();
            document.querySelector('.user-text-info-text').setAttribute('data-chat-id', chatId);
            document.querySelector('.user-text-info-text').setAttribute('data-recipient-id', recipientId);

            const container2 = document.querySelector('.user-text-info');

            if (!container2.querySelector('img')) {
                const image = document.createElement('img');
                image.src = 'images/icons/edit.svg';
                image.alt = 'Edit Icon';
                image.classList.add('ps-3', 'chat-edit-button');
                image.addEventListener('click', () => {
                    editChatName();
                });

                container2.appendChild(image);
            }

            try {
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

                displayMessages(messages);
            } catch (error) {
                console.error('Error fetching chat messages:', error);
                alert('Error occurred while fetching chat messages. Please try again later.');
            }
        }
    });
});

function loadMessages() {
    const chatId = document.querySelector('.user-text-info-text').dataset.chatId;
    const token = localStorage.getItem('token');

    if (chatId){
        fetch(`http://localhost:3000/api/chats/messages/${chatId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(messages => {
                displayMessages(messages);
            })
            .catch(error => console.error('Error fetching messages:', error));
    }
}
setInterval(loadMessages, 5000);


document.addEventListener('DOMContentLoaded', () => {
    const userItems = document.querySelectorAll('.user-list-item');

    userItems.forEach(item => {
        item.addEventListener('click', async function() {

            try {
                const response = await fetch(`http://localhost:3000/api/chats/chat/${userId}`, {
                    credentials: 'include'
                });
                const { chatId } = await response.json();

                const messagesResponse = await fetch(`http://localhost:3000/api/chats/messages/${chatId}`, {
                    credentials: 'include'
                });
                const messages = await messagesResponse.json();

                displayMessages(messages);
            } catch (error) {
                console.error('Error fetching chat or messages:', error);
            }
        });
    });
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

function scrollToBottom() {
    const messagesContainer = document.querySelector('.messages-box');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Funkcia na zobrazenie správ v UI
function displayMessages(messages) {
    const recipientId = document.querySelector('.user-text-info-text').dataset.recipientId;
    console.log('Recipient ID:', recipientId);
    const messagesContainer = document.querySelector('.messages-box-list');
    messagesContainer.innerHTML = '';


    const ul = document.createElement('ul');
    ul.classList.add('messages-chat-group', 'pb-2');
    messagesContainer.appendChild(ul);

    messages.forEach(message => {
        const li = document.createElement('li');
        li.classList.add('message-item');

        const container = document.createElement('div');

        const text = document.createElement('span');

        // Pridanie tried podľa odosielateľa
        if (recipientId == message.sender_id) {
            text.classList.add('chat-list-item-recipient', 'message-box');
            container.classList.add('recipient-container'); // Kontajner pre prijímateľa
        } else {
            text.classList.add('chat-list-item-sender', 'message-box');
            container.classList.add('sender-container'); // Kontajner pre odosielateľa
        }

        text.textContent = message.message;
        container.appendChild(text);
        li.appendChild(container);

        ul.appendChild(li);
    });

    scrollToBottom();
}

async function loadData() {
    if (!await verifyToken()){
        window.location.assign('login.html');
        alert("Error, please login again");
        return;
    }

    try {
        let token = localStorage.getItem('token');
        let data = await fetchWithToken('http://localhost:3000/api/users/', token);

        if (!data) {
            token = await refreshAccessToken();
            if (!token) throw new Error('Unable to refresh token');

            data = await fetchWithToken('http://localhost:3000/api/users/', token);
            if (!data) throw new Error('Unable to fetch data after refreshing token');
        }

        console.log(data);

        const container = document.querySelector('.selection');
        container.innerHTML = '';

        const h = document.createElement('h1');
        h.classList.add('chat-text', 'mb-1');
        h.textContent = "Users";
        container.appendChild(h);

        // Vytvorenie zoznamu (ul element)
        const ul = document.createElement('ul');
        ul.classList.add('list-group');

        // Iterácia cez používateľov a ich pridanie do zoznamu
        data.forEach(user => {
            const li = document.createElement('li');
            li.classList.add('list-group-item-users', 'd-flex', 'justify-content-between', 'align-items-center', 'user-list-item');
            li.id = `${user.id}`;

            const userName = document.createElement('span');
            userName.classList.add('badge', 'rounded-pill', 'list-user-item-text', 'p-0');
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
        displayChatData(data);
    } else {
        console.error('No data received');
    }
}

function displayChatData(chats) {
    const container = document.querySelector('.selection');
    container.innerHTML = '';

    const h = document.createElement('h1');
    h.classList.add('chat-text', 'mb-1');
    h.textContent = "Chats";
    container.appendChild(h);

    const ul = document.createElement('ul');
    ul.classList.add('list-group');

    chats.forEach(chat => {
        const li = document.createElement('li');
        li.classList.add('list-group-item-users', 'd-flex', 'justify-content-between', 'align-items-center', 'chat-list-item');
        li.dataset.chatId = chat.chatId;
        li.dataset.userId = chat.userId;

        const userName = document.createElement('span');
        userName.classList.add('badge', 'rounded-pill', 'list-user-item-text', 'p-0');
        userName.textContent = `${chat.chatname}`;
        li.appendChild(userName);

        ul.appendChild(li);
    });

    container.appendChild(ul);

    document.getElementById('message').value = '';
}

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
            const errorText = await response.text();
            console.error('Fetch error:', errorText);
            if (response.status === 401) return null;
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
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
            return token;
        }
        return null;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
}

// Function that removes data showed on screen to prep for new content
function removeChatData(){
    document.querySelector('.user-text-info-text').removeAttribute('data-chat-id');
    document.querySelector('.user-text-info-text').removeAttribute('data-recipient-id');
    document.querySelector('.user-text-info-text').textContent = '';

    const messagesContainer = document.querySelector('.messages-box-list');
    messagesContainer.innerHTML = '';
    const container2 = document.querySelector('.message-bar');
    container2.classList.remove('d-none');
    const container3 = document.querySelector('.chat-bar');
    container3.classList.remove('d-none');
    const img = document.querySelector('.chat-edit-button');
    if (img) img.remove();
    const container4 = document.querySelector('.messages-box');
    container4.classList.remove('d-none');

    document.getElementById('message').value = '';
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
    else if (!chatId || !recipientId) {
        alert('Open a Chat first!');
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

        document.getElementById('message').value = '';

    } catch (error) {
        console.error('Error sending message:', error);
    }

    document.getElementById('message').value = '';
}

// Send message
document.getElementById('sendButton').addEventListener('click', sendMessage);
document.getElementById('message').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
        event.preventDefault();
    }
});

async function editChatName() {
    const chatId = document.querySelector('.user-text-info-text').dataset.chatId;

    // Check for open chat
    if (!chatId) {
        alert('Nie je vybraný žiadny chat!');
        return;
    }

    // Get user input
    const currentName = document.querySelector('.user-text-info-text').textContent.trim();
    const newName = prompt('Zadajte nový názov chatu:', currentName);

    if (!newName || newName.trim() === '' || newName.length > 20) {
        alert('Enter valid name, no empty spaces and max 20 characters');
        return;
    }

    // Try change to newName
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/chats/update/${chatId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({ name: newName , chatId})
        });

        // Skontroluj odpoveď servera
        if (response.ok) {
            alert('Chat name changed successfully!');
            document.querySelector('.user-text-info-text').textContent = newName;

            // Reload page
            removeChatData();
            loadChatData();

        } else {
            alert('Error changing chat name!');
        }
    } catch (error) {
        console.error('Error changing chat name:', error);
        alert('Error changing chat name!');
    }
}

// Profile page
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

function createListItem(text, id) {
    const li = document.createElement('li');
    li.classList.add('user-setting-list-item', 'd-flex', 'justify-content-between', 'align-items-center');
    li.id = id;

    const span = document.createElement('span');
    span.classList.add('badge', 'rounded-pill', 'list-user-item-text', 'p-0');
    span.textContent = text;
    li.appendChild(span);

    return li;
}

function createUserItem(text, id, value) {
    const li = document.createElement('li');
    li.classList.add('user-setting-list-value', 'd-flex', 'justify-content-start', 'align-items-center');
    li.id = id;

    const span = document.createElement('span');
    span.classList.add('badge', 'rounded-pill', 'ps-3', 'user-text-prefix');
    span.textContent = text;

    const span2 = document.createElement('span');
    span2.classList.add('badge', 'rounded-pill', 'ps-3', 'user-text-value');
    span2.textContent = value;

    li.appendChild(span);
    li.appendChild(span2);

    return li;
}

// Load user data and display them
async function createUserInformationPage(){
    if (!await verifyToken()) {
        window.location.assign('login.html');
        alert("Error, please login again");
        return;
    }

    try{
        const token = localStorage.getItem('token');

        const decodedToken = parseJwt(token);
        const userId = decodedToken.id;

        const response = await fetch(`http://localhost:3000/api/users/profile/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Failed to fetch profile data");

        // Get JSON
        const userData = await response.json();
        console.log(userData);

        const container = document.querySelector('.messages-box-list');
        container.innerHTML = '';
        const ul = document.createElement('ul');

        ul.classList.add('user-setting-list','user-setting-page');

        container.appendChild(ul);
        ul.appendChild(createUserItem(`First Name : `, "p-settings", userData.name));
        ul.appendChild(createUserItem(`Last Name : `, "p-settings", userData.lastname));
        ul.appendChild(createUserItem(`Email : `, "p-settings", userData.email));
        ul.appendChild(createUserItem(`Phone Number : `, "p-settings", userData.number));

        const date1 = new Date(userData.birthday);
        const year1 = date1.getFullYear();
        const month1 = String(date1.getMonth() + 1).padStart(2, '0');
        const day1 = String(date1.getDate()).padStart(2, '0');
        const dateString1 = `${day1}.${month1}.${year1}`;
        ul.appendChild(createUserItem(`Birthday : `, "p-settings", dateString1));

        const date = new Date(userData.joineddate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${day}.${month}.${year}`;
        ul.appendChild(createUserItem(`Profile Created : `, "p-settings", dateString));
    }
    catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert("Failed to load profile data");
    }
}



// TODO still not implemented
async function createProfilePicturePage() {
    alert("This feature is not implemented yet. Please try again later.");
    return;

    if (!await verifyToken()) {
        window.location.assign('login.html');
        alert("Error, please login again");
        return;
    }

    try{
    }
    catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert("Failed to load profile data");
    }
    alert("Picture");
}

// Helper function to create text elements for editable settings in profile
function createEditItem(text, id, value) {
    const li = document.createElement('li');
    li.classList.add('d-flex', 'justify-content-between', 'align-items-center');
    li.id = id;

    const form = document.createElement('form');
    form.classList.add('form');
    li.appendChild(form);

    const fieldDiv = document.createElement('div');
    fieldDiv.classList.add('field');
    form.appendChild(fieldDiv);

    const input = document.createElement('input');
    input.type = 'text';
    input.id = id;
    input.required = true;
    input.value = value;

    const label = document.createElement('label');
    label.textContent = text;
    label.setAttribute('for', id);

    fieldDiv.appendChild(input);
    fieldDiv.appendChild(label);

    return li;
}

// Show editable user information with option to rewrite
async function createProfileSettingsPage() {
    if (!await verifyToken()) {
        window.location.assign('login.html');
        alert("Error, please login again");
        return;
    }

    try{
        const token = localStorage.getItem('token');

        const decodedToken = parseJwt(token);
        const userId = decodedToken.id;

        const response = await fetch(`http://localhost:3000/api/users/profile/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Failed to fetch profile data");

        // Get JSON
        const userData = await response.json();
        console.log(userData);

        const container = document.querySelector('.messages-box-list');
        container.innerHTML = '';
        const ul = document.createElement('ul');

        ul.classList.add('user-setting-list','user-setting-page');

        container.appendChild(ul);
        ul.appendChild(createEditItem("First Name", "firstname-edit", userData.name));
        ul.appendChild(createEditItem("Last Name", "lastname-edit", userData.lastname));
        ul.appendChild(createEditItem("Phone Number", "phoneNumber-edit", userData.number));

        // Save button
        const button = document.createElement('input');
        button.type = 'submit';
        button.classList.add('submit-button');
        button.value = 'Save';
        ul.appendChild(button);

        button.addEventListener('click', async function(){
            const firstName = document.getElementById('firstname-edit').value;
            const lastName = document.getElementById('lastname-edit').value;
            const phoneNumber = document.getElementById('phoneNumber-edit').value;

            if (!firstName || !lastName || !phoneNumber) {
                alert("Please fill all fields");
                return;
            }
        })



    }
    catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert("Failed to load profile data");
    }
}

// Load profile section of page and generate new buttons
async function loadProfile() {
    if (!await verifyToken()) {
        window.location.assign('login.html');
        alert("Error, please login again");
        return;
    }

    try {
        // Create user setting buttons
        const container = document.querySelector('.selection');
        container.innerHTML = '';
        const container2 = document.querySelector('.message-bar');
        container2.classList.add('d-none');
        const container3 = document.querySelector('.chat-bar');
        container3.classList.add('d-none');

        const h = document.createElement('h1');
        h.classList.add('chat-text', 'mb-2');
        h.textContent = "Settings";
        container.appendChild(h);

        const ul = document.createElement('ul');
        ul.classList.add('user-setting-list');

        const userInfoItem = createListItem('User Information', "p-profile");
        userInfoItem.classList.add('user-setting-list-item-selected');
        const profilePictureItem = createListItem('Profile Picture', "p-picture");
        const profileSettingsItem = createListItem('Profile Settings', "p-settings");

        ul.appendChild(userInfoItem);
        ul.appendChild(profilePictureItem);
        ul.appendChild(profileSettingsItem);

        userInfoItem.addEventListener('click', () => {
            createUserInformationPage();

            userInfoItem.classList.add('user-setting-list-item-selected');
            profilePictureItem.classList.remove('user-setting-list-item-selected');
            profileSettingsItem.classList.remove('user-setting-list-item-selected');
        });

        profilePictureItem.addEventListener('click', () => {
            createProfilePicturePage();

            userInfoItem.classList.remove('user-setting-list-item-selected');
            profilePictureItem.classList.add('user-setting-list-item-selected');
            profileSettingsItem.classList.remove('user-setting-list-item-selected');
        });

        profileSettingsItem.addEventListener('click', () => {
            createProfileSettingsPage();

            userInfoItem.classList.remove('user-setting-list-item-selected');
            profilePictureItem.classList.remove('user-setting-list-item-selected');
            profileSettingsItem.classList.add('user-setting-list-item-selected');
        });

        container.appendChild(ul);

        // Create user page
        await createUserInformationPage();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert("Failed to load profile data");
    }
}
