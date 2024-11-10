import { backend } from 'declarations/backend';
import { AuthClient } from "@dfinity/auth-client";

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const configButton = document.getElementById('configButton');
const apiKeyModal = document.getElementById('apiKeyModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const modelInput = document.getElementById('modelInput');
const saveApiConfigButton = document.getElementById('saveApiConfig');

let authClient;
let identity;

const baseUrl = 'https://api.x.ai/v1';
let apiKey = localStorage.getItem('xaiApiKey');
let selectedModel = localStorage.getItem('xaiModel') || '';

async function initAuth() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        identity = await authClient.getIdentity();
        handleAuthenticated();
    } else {
        await authClient.login({
            identityProvider: "https://identity.ic0.app/#authorize",
            onSuccess: handleAuthenticated,
        });
    }
}

function handleAuthenticated() {
    console.log("Authenticated");
    if (!apiKey || !selectedModel) {
        showApiKeyModal();
    }
}

function showApiKeyModal() {
    apiKeyModal.style.display = 'block';
    apiKeyInput.value = apiKey || '';
    modelInput.value = selectedModel || '';
}

saveApiConfigButton.addEventListener('click', () => {
    apiKey = apiKeyInput.value.trim();
    selectedModel = modelInput.value.trim();
    if (apiKey && selectedModel) {
        localStorage.setItem('xaiApiKey', apiKey);
        localStorage.setItem('xaiModel', selectedModel);
        apiKeyModal.style.display = 'none';
        appendMessage('System', `API configuration updated. Using model: ${selectedModel}`);
    } else {
        alert('Please enter both API key and model name');
    }
});

configButton.addEventListener('click', showApiKeyModal);

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
        case '/config':
            showApiKeyModal();
            break;
        default:
            appendMessage('System', 'Unknown command. Please try again.');
    }
}

async function sendToAI(message) {
    try {
        await backend.addMessage(message, true);
        const response = await callXAI(message);
        await backend.addMessage(response, false);
        appendMessage('AI', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function editFiles(files) {
    try {
        const instruction = await promptUser('Enter edit instruction:');
        const fileInfo = await backend.editFiles(files, instruction);
        const response = await callXAI(fileInfo);
        appendMessage('AI', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function createFiles(instruction) {
    try {
        const response = await callXAI(`Create files based on instruction: ${instruction}`);
        appendMessage('AI', response);
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
        const fileInfo = await backend.reviewCode(files);
        const response = await callXAI(fileInfo);
        appendMessage('AI', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function generatePlan(instruction) {
    try {
        const response = await callXAI(`Generate a plan for: ${instruction}`);
        appendMessage('AI', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender.toLowerCase()}`;
    
    const senderElement = document.createElement('div');
    senderElement.className = 'sender';
    senderElement.textContent = sender;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'content';
    
    if (sender === 'AI' && message.includes('```')) {
        const parts = message.split(/(```[\s\S]*?```)/g);
        parts.forEach(part => {
            if (part.startsWith('```') && part.endsWith('```')) {
                const code = part.slice(3, -3);
                const codeElement = document.createElement('pre');
                codeElement.className = 'code-block';
                codeElement.textContent = code;
                contentElement.appendChild(codeElement);
            } else {
                const textElement = document.createElement('p');
                textElement.textContent = part;
                contentElement.appendChild(textElement);
            }
        });
    } else {
        contentElement.textContent = message;
    }
    
    messageElement.appendChild(senderElement);
    messageElement.appendChild(contentElement);
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function promptUser(message) {
    return new Promise((resolve) => {
        const userResponse = prompt(message);
        resolve(userResponse);
    });
}

async function callXAI(prompt) {
    if (!apiKey || !selectedModel) {
        showApiKeyModal();
        throw new Error('Please set your X.ai API key and model name first.');
    }

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API Error:', response.status, errorData);
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('xaiApiKey');
                apiKey = null;
                showApiKeyModal();
                throw new Error('Invalid API key. Please enter a valid API key.');
            } else if (response.status === 404) {
                throw new Error(`The selected model (${selectedModel}) is not available. Please update your configuration with a valid model name.`);
            }
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.choices || data.choices.length === 0) {
            throw new Error('No response from AI');
        }
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling X.ai API:', error);
        throw new Error('Failed to get response from AI. Please check your API configuration and try again.');
    }
}

initAuth();
