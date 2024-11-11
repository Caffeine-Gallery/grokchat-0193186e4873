import { backend } from 'declarations/backend';

const messageInput = document.getElementById('messageInput');
const addMessageBtn = document.getElementById('addMessageBtn');
const messageList = document.getElementById('messageList');
const loadingSpinner = document.getElementById('loadingSpinner');

async function refreshMessages() {
    showLoading();
    try {
        const messages = await backend.getMessages();
        messageList.innerHTML = '';
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'list-group-item';
            messageElement.textContent = message.content;
            messageList.appendChild(messageElement);
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    } finally {
        hideLoading();
    }
}

addMessageBtn.addEventListener('click', async () => {
    const content = messageInput.value.trim();
    if (content) {
        showLoading();
        try {
            await backend.addMessage(content);
            messageInput.value = '';
            await refreshMessages();
        } catch (error) {
            console.error('Error adding message:', error);
        } finally {
            hideLoading();
        }
    }
});

function showLoading() {
    loadingSpinner.style.display = 'block';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Initial load of messages
refreshMessages();
