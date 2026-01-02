const chatWindow = document.getElementById('chat-window');
const form = document.getElementById('chat-form');
const messageInput = document.getElementById('message');

const createMessageElement = (role, text, timestamp) => {
    const container = document.createElement('div');
    container.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'bot' ? 'AI' : 'You';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;

    const time = document.createElement('span');
    time.className = 'timestamp';
    time.textContent = timestamp;

    bubble.appendChild(time);
    container.appendChild(avatar);
    container.appendChild(bubble);
    return container;
};

const appendMessage = (role, text, timestamp) => {
    const element = createMessageElement(role, text, timestamp);
    chatWindow.appendChild(element);
    chatWindow.scrollTop = chatWindow.scrollHeight;
};

const renderHistory = (history = []) => {
    chatWindow.innerHTML = '';
    history.forEach((entry) => appendMessage(entry.role, entry.text, entry.timestamp));
};

const sendMessage = async (text) => {
    const payload = { message: text };
    const response = await fetch('chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('Unable to reach the chat service.');
    }

    return response.json();
};

const restoreHistory = async () => {
    try {
        const response = await fetch('chat.php');
        if (!response.ok) {
            throw new Error('Unable to load chat history.');
        }
        const data = await response.json();
        renderHistory(data.history);
    } catch (error) {
        appendMessage('bot', error.message, new Date().toLocaleTimeString());
    }
};

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    const timestamp = new Date().toLocaleTimeString();
    appendMessage('user', text, timestamp);
    messageInput.value = '';

    try {
        const data = await sendMessage(text);
        const replyTimestamp = new Date().toLocaleTimeString();
        appendMessage('bot', data.reply, replyTimestamp);
    } catch (error) {
        appendMessage('bot', error.message, new Date().toLocaleTimeString());
    }
});

restoreHistory();
