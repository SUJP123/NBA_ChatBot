document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const chatBox = document.getElementById('chatbox');

  const socket = io();

  messageInput.addEventListener('input', () => {
      sendButton.disabled = messageInput.value.trim() === '';
  });

  sendButton.addEventListener('click', () => {
      const message = messageInput.value.trim();
      if (message) {
          socket.emit('message', message);
          chatBox.innerHTML += `<div class="user-message">You: ${message}</div>`;
          messageInput.value = '';
          sendButton.disabled = true;

          //Display a loading message
          chatBox.innerHTML += `<div id="loading">Loading...</div>`;
      }
  });

  socket.on('botMessage', (botMessage) => {
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
          loadingElement.remove(); 
      }

      chatBox.innerHTML += `<div class="bot-message">NBA Takes Bot: ${botMessage}</div>`; //Add response
  });
});
