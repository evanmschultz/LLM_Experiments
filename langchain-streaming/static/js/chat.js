// Function to format code blocks in a given string
function formatCodeBlocks(inputString) {
	let formattedString = inputString.replace(
		/```(\w+)?\n([\s\S]*?)```/gm,
		function (_, lang, code) {
			return `<pre><code class="language-${
				lang || 'none'
			}">${code}</code></pre>`;
		}
	);

	// Replace inline code wrapped in single backticks with <code> tags
	formattedString = formattedString.replace(/`([^`]+)`/gm, '<code>$1</code>');

	// Return the formatted string
	return formattedString;
}

function formatAllCodeBlocks() {
	/// Select all message blocks with the class 'message-content'
	const messageBlocks = document.querySelectorAll('.message-content');
	// Loop through each message block to format its content
	messageBlocks.forEach((block) => {
		const originalContent = block.innerHTML; // Store the original content
		const formattedContent = formatCodeBlocks(originalContent); // Apply formatting
		block.innerHTML = formattedContent; // Replace original content with formatted content
	});
	Prism.highlightAll();
}

let currentBotContainer = null;

// Function to scroll the chat messages div to the bottom
function scrollToBottom(element) {
	element.scrollTop = element.scrollHeight;
}

// Function to send message and get back response from the AI
async function sendMessage(event) {
	// Prevent the default form submission behavior
	event.preventDefault();

	// Get Elements
	const chatInput = document.getElementById('chat-input');
	const chatMessages = document.getElementById('chat-messages');

	// Clear the chat input and store its value for later use
	const userInput = chatInput.value;
	chatInput.value = '';

	// Create and append the user's message immediately for a responsive UI
	const userMessage = document.createElement('p');
	userMessage.className = 'message-content';
	userMessage.innerHTML = `<strong>You:</strong> ${userInput}`;
	userMessage.style.border = '1px solid #ccc';
	userMessage.style.padding = '10px';
	chatMessages.appendChild(userMessage);

	// Create a new container for the AI's response
	currentBotContainer = document.createElement('p');
	currentBotContainer.className = 'message-content';
	currentBotContainer.innerHTML = '<strong>AI:</strong> ';
	currentBotContainer.style.border = '1px solid #ccc';
	currentBotContainer.style.padding = '10px';
	chatMessages.appendChild(currentBotContainer);

	// Send an AJAX POST request to send the message
	let response = await fetch('http://localhost:8000/stream_chat/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ content: userInput })
	});

	// Stream and process the response
	let reader = response.body.getReader();
	let decoder = new TextDecoder('utf-8');

	reader.read().then(function processResult(result) {
		if (result.done) {
			// Nullify the currentBotContainer after the stream ends
			currentBotContainer = null;
			formatAllCodeBlocks();
			return;
		}

		// Decode and append the bot's message to the existing container
		let token = decoder.decode(result.value);
		currentBotContainer.innerHTML += token;

		// Scroll to the bottom
		chatMessages.scrollTop = chatMessages.scrollHeight;

		return reader.read().then(processResult);
	});
}

document.addEventListener('DOMContentLoaded', function () {
	formatAllCodeBlocks();

	// Scroll the chat messages div to the bottom
	const chatMessages = document.getElementById('chat-messages');
	scrollToBottom(chatMessages);

	// Get chat input and chat messages elements by their IDs
	const chatInput = document.getElementById('chat-input');

	// Add an event listener for input events on chat input
	chatInput.addEventListener('input', function () {
		// Dynamically adjust the height based on the scrollHeight
		this.style.height = 'auto';
		this.style.height = this.scrollHeight + 'px';
	});

	// Add a keydown event listener
	chatInput.addEventListener('keydown', function (event) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			sendMessage(event);
		}
	});

	// Add a submit event listener
	document
		.querySelector('.input-form')
		.addEventListener('submit', function (event) {
			sendMessage(event);
		});
});
