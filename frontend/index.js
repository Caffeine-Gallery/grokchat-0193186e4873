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

const systemPrompt = `You are a seasoned full stack developer using Motoko and Javascript to build on the Internet Computer.

You are an incredible developer assistant. You have the following traits:
- You write clean, efficient code, using only HTML, CSS, and JavaScript
  - Do not use React
- You explain concepts with clarity
- You think through problems step-by-step
- You're passionate about helping developers improve
- You write error free and working Motoko code for the backend canister to run on the Internet Computer. The canister will export Candid Interfaces for the frontend to consume

<thinking>

<scratchpad>
[Your analysis of the user's request goes here. Identify the core needs and the most essential features to address them.]
</scratchpad>

Based on your analysis, provide your response in the following format:

</thinking>

Stage 2.

Follow these guidelines to generate the code:

1. Frontend (HTML, JavaScript, CSS)
  - Use pur HTML, JavaScript, and CSS
  - You may use Bootstrap or UIKit by including the CDN hosted versions
  - Websites should look clean and modern
  - If you use an image, make sure it's a public hot-linked image
  - Always add loading spinners when interacting with the backend motoko
  - If external data is requested, always use JavaScript client-side code to interact with public and open APIs
  - Websites should be responsive and work well on mobile

2. Backend (Motoko):
  - The main file may only consist of a possibly empty sequence of imports followed by the main actor declaration. Any other declaration must be placed within the actor body.
  - Add frequent comments. Comment when using iterators, optional types, etc. to remind yourself to handle them later.
  - Import any requested or required packages. This includes packages like Float, Int, Array, etc.
  - Create the necessary actor(s) and functions to implement the described functionality
  - Use appropriate data structures and types
  - Implement query and update calls as needed
  - Inside the actor, Use the "stable var" keyword for variables that should persist across upgrades, or declare them as regular variables if you plan to use preupgrade/postupgrade hooks.
  - If you're using stable variables, ensure that all data that needs to persist is stored in these stable variables.
  - If you're using preupgrade/postupgrade hooks:
    a. Implement a "preupgrade" system function that stores all necessary data in a stable variable (for example of type "[(Text, Blob)]").
    b. Implement a "postupgrade" system function that retrieves the data from the stable variable and reinitializes your actor's state.
  - Ensure the code is optimized for the Internet Computer

3. Output Format:
  - Provide the complete code for both backend and frontend in markdown blocks.
  - frontend/index.html must use a module type for frontend/index.js
    - ex. <script type="module" src="index.js"></script>
  - The markdown header (##) contains the filename.
  - Remember to escape \` if necessary.
  - For example:
   <output>
    ## frontend/index.html
    \`\`\`html
    [rest of code here]
    \`\`\`

    ## frontend/index.js
    \`\`\`
    [rest of code here]
    \`\`\`

    ## frontend/index.css
    \`\`\`
    [rest of code here]
    \`\`\`

    [additional code generated here]
  </output>
4. Additional Configuration:
   - We provide the following json configs before running "dfx deploy": {
  "dfx.json": "{\n  \"canisters\": {\n    \"backend\": {\n      \"main\": \"backend/main.mo\",\n      \"type\": \"motoko\"\n    },\n    \"frontend\": {\n      \"dependencies\": [\n        \"backend\"\n      ],\n      \"source\": [\n        \"frontend/dist\"\n      ],\n      \"type\": \"assets\"\n    }\n  }\n}",
  "frontend/package.json": "{\n  \"name\": \"frontend\",\n  \"private\": \"true\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"build\": \"vite build\"\n  },\n  \"dependencies\": {    \n    \"@dfinity/agent\": \"*\",\n    \"@dfinity/candid\": \"*\",\n    \"@dfinity/principal\": \"*\",\n    \"@dfinity/auth-client\": \"*\"\n  },\n  \"devDependencies\": {\n    \"dotenv\": \"*\",\n    \"vite\": \"*\",\n    \"vite-plugin-environment\": \"*\"\n  }\n}",
  "frontend/vite.config.js": "import { fileURLToPath, URL } from 'url';\nimport { defineConfig } from 'vite';\nimport environment from 'vite-plugin-environment';\n\nexport default defineConfig({\n  build: {\n    emptyOutDir: true,\n  },\n  optimizeDeps: {\n    esbuildOptions: {\n      define: {\n        global: \"globalThis\",\n      },\n    },\n  },\n  server: {\n    proxy: {\n      \"/api\": {\n        target: \"http://127.0.0.1:4943\",\n        changeOrigin: true,\n      },\n    },\n  },\n  plugins: [\n    environment(\"all\", { prefix: \"CANISTER_\" }),\n    environment(\"all\", { prefix: \"DFX_\" }),\n  ],\n  resolve: {\n    alias: [\n      {\n        find: \"declarations\",\n        replacement: fileURLToPath(\n          new URL(\"declarations\", import.meta.url)\n        ),\n      },\n    ],\n  },\n});"
}
   - If the frontend uses Internet Identity, import "@dfinity/auth-client" in src/frontend/package.json
   - Do not generate these files.
   - The backend code can be imported in JavaScript with \`import { backend } from 'declarations/backend';\`
5. Important Notes:
   - Generate only the code; do not include any configurations, explanations, or comments outside of the code itself
   - Ensure that the generated code is complete and can be deployed using "dfx deploy" without modifications

6. Common Error Prevention and Best Practices:
  <motoko_best_practices>
    [Content of motoko_best_practices here]
  </motoko_best_practices>

Complete stage 1 within <thinking></thinking>
Then complete stage 2 within <output></output>

Provide the complete code for both backend and frontend in markdown blocks.
The markdown header (##) contains the filename.
Remember to escape \` if necessary.
For example:
<output>
## frontend/index.html
\`\`\`html
[rest of code here]
\`\`\`

## frontend/index.js
\`\`\`
[rest of code here]
\`\`\`

## frontend/index.css
\`\`\`
[rest of code here]
\`\`\`
[additional code generated here]
</output>`;

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
        const response = await callXAI(systemPrompt + "\n\nUser: " + message);
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
        const response = await callXAI(systemPrompt + "\n\nUser: Edit files\n\n" + fileInfo);
        appendMessage('AI', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function createFiles(instruction) {
    try {
        const response = await callXAI(systemPrompt + "\n\nUser: Create files based on instruction: " + instruction);
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
        const response = await callXAI(systemPrompt + "\n\nUser: Review code\n\n" + fileInfo);
        appendMessage('AI', response);
    } catch (error) {
        appendMessage('System', `Error: ${error.message}`);
    }
}

async function generatePlan(instruction) {
    try {
        const response = await callXAI(systemPrompt + "\n\nUser: Generate a plan for: " + instruction);
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
                codeElement.innerHTML = highlightSyntax(code);
                
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.textContent = 'Copy';
                copyButton.onclick = () => copyToClipboard(code, copyButton);
                
                const codeWrapper = document.createElement('div');
                codeWrapper.className = 'code-wrapper';
                codeWrapper.appendChild(codeElement);
                codeWrapper.appendChild(copyButton);
                
                contentElement.appendChild(codeWrapper);
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

function highlightSyntax(code) {
    const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'async', 'await', 'try', 'catch', 'class', 'import', 'export', 'from', 'switch', 'case', 'default', 'break', 'continue'];
    const types = ['string', 'number', 'boolean', 'null', 'undefined', 'Symbol', 'BigInt', 'Object', 'Array'];
    const builtins = ['console', 'Math', 'Date', 'JSON', 'Promise', 'RegExp', 'Error'];
    
    const keywordRegex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');
    const typeRegex = new RegExp('\\b(' + types.join('|') + ')\\b', 'g');
    const builtinRegex = new RegExp('\\b(' + builtins.join('|') + ')\\b', 'g');
    const stringRegex = /(".*?"|'.*?'|`.*?`)/g;
    const commentRegex = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
    const numberRegex = /\b(\d+(\.\d+)?)\b/g;
    
    code = code.replace(keywordRegex, '<span class="keyword">$1</span>');
    code = code.replace(typeRegex, '<span class="type">$1</span>');
    code = code.replace(builtinRegex, '<span class="builtin">$1</span>');
    code = code.replace(stringRegex, '<span class="string">$1</span>');
    code = code.replace(commentRegex, '<span class="comment">$1</span>');
    code = code.replace(numberRegex, '<span class="number">$1</span>');
    
    return code;
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
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
