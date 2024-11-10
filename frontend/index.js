import { backend } from 'declarations/backend';

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const fileContent = document.getElementById('fileContent');

sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});

async function handleUserInput() {
    const input = userInput.value.trim();
    if (input === '') return;

    appendMessage('You', input);
    userInput.value = '';

    if (input.startsWith('/')) {
        await handleCommand(input);
    } else {
        await sendToAI(input);
    }
}

async function handleCommand(command) {
    const [cmd, ...args] = command.split(' ');
    switch (cmd.toLowerCase()) {
        case '/edit':
            await editFiles(args);
            break;
        case '/create':
            await createFiles(args.join(' '));
            break;
        case '/add':
            await addFiles(args);
            break;
        case '/debug':
            await debugLastResponse();
            break;
        case '/reset':
            await resetContext();
            break;
        case '/review':
            await reviewCode(args);
            break;
        case '/planning':
            await generatePlan(args.join(' '));
            break;
        default:
            appendMessage('System', 'Unknown command. Please try again.');
    }
}

async function sendToAI(message) {
    try {
        const response = await backend.chatWithAI(message);
        appendMessage('Grok', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function editFiles(files) {
    try {
        const instruction = await promptUser('Enter edit instruction:');
        const response = await backend.editFiles(files, instruction);
        appendMessage('Grok', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function createFiles(instruction) {
    try {
        const response = await backend.createFiles(instruction);
        appendMessage('Grok', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function addFiles(files) {
    try {
        const response = await backend.addFiles(files);
        appendMessage('System', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function debugLastResponse() {
    try {
        const response = await backend.getLastResponse();
        appendMessage('System', `Last AI Response: ${response}`);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function resetContext() {
    try {
        await backend.resetContext();
        appendMessage('System', 'Chat context and added files have been reset.');
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function reviewCode(files) {
    try {
        const response = await backend.reviewCode(files);
        appendMessage('Grok', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function generatePlan(instruction) {
    try {
        const response = await backend.generatePlan(instruction);
        appendMessage('Grok', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function promptUser(message) {
    return new Promise((resolve) => {
        const userResponse = prompt(message);
        resolve(userResponse);
    });
}
