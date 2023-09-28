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
	console.log('format code blocks called');
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
// Scroll the chat messages div to the bottom (for scrolling function)
const chatMessages = document.getElementById('chat-messages');

// Function to scroll the chat messages div to the bottom
function scrollToBottom(element) {
	console.log('scrollToBottom');
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

	// Send the user's message over the WebSocket
	websocket.send(userInput);
}

let websocket = new WebSocket('ws://localhost:8000/ws');

websocket.onopen = function (event) {
	console.log('WebSocket is open now.');
};

websocket.onclose = function (event) {
	// Format all code blocks again since new message has been received
	formatAllCodeBlocks();
	scrollToBottom(chatMessages);

	console.log('WebSocket is closed now.');
};

websocket.onmessage = function (event) {
	console.log('WebSocket message received:', event);

	// Check for the special message indicating the end of the response
	let messageData;
	try {
		messageData = JSON.parse(event.data);
	} catch (e) {
		// Not a JSON object, just proceed
	}

	if (messageData && messageData.end_of_response) {
		// Special message received, nullify the currentBotContainer
		currentBotContainer = null;

		// Optionally close the WebSocket if you desire
		// websocket.close();

		// Format all code blocks since the AI response is complete
		formatAllCodeBlocks();
		scrollToBottom(chatMessages);
	} else {
		// If currentBotContainer is null, create a new container for the AI's response
		if (!currentBotContainer) {
			currentBotContainer = document.createElement('p');
			currentBotContainer.className = 'message-content';
			currentBotContainer.innerHTML = '<strong>AI:</strong> ';
			currentBotContainer.style.border = '1px solid #ccc';
			currentBotContainer.style.padding = '10px';
			chatMessages.appendChild(currentBotContainer);
		}

		// Append the received message to the AI's response container
		currentBotContainer.innerHTML += event.data;

		// Scroll to the bottom
		// scrollToBottom(chatMessages);
	}
};

document.addEventListener('DOMContentLoaded', function () {
	formatAllCodeBlocks();

	// Scroll the chat messages div to the bottom
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
