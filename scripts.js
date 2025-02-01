document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const chatContainer = document.getElementById('chat-container');
    const usernameInput = document.getElementById('usernameInput');
    const loginButton = document.getElementById('loginButton');
    const messages = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    let username = '';

    // Fonction pour ajouter un message
    const appendMessage = (msg) => {
        const li = document.createElement('li');
        
        // Style spécial pour les messages système
        if (msg.username === 'System') {
            li.style.fontStyle = 'italic';
            li.style.color = '#666';
            li.textContent = msg.message;
        } else {
            li.textContent = `${msg.username}: ${msg.message}`;
        }
        
        messages.appendChild(li);
        messages.scrollTop = messages.scrollHeight; // Auto-scroll
    };

    // Fonction pour récupérer les messages initiaux
    const updateMessages = async () => {
        try {
            const response = await fetch('https://real-time-chat-supabase.onrender.com/get-messages');
            const messagesArray = await response.json();
            
            messages.innerHTML = '';
            messagesArray.forEach(msg => appendMessage(msg));
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des messages:", error);
        }
    };

    // Gestion de la connexion
    loginButton.addEventListener('click', async () => {
        username = usernameInput.value.trim();
        if (username) {
            loginContainer.style.display = 'none';
            chatContainer.style.display = 'block';
            
            try {
                const eventSource = new EventSource(`https://real-time-chat-supabase.onrender.com/events?username=${username}`);
                
                eventSource.onmessage = (event) => {
                    const msg = JSON.parse(event.data);
                    appendMessage(msg);
                };

                await updateMessages();
            } catch (error) {
                console.error("❌ Erreur lors de l'initialisation:", error);
            }
        }
    });

    // Fonction pour envoyer un message
    const sendMessage = async () => {
        const message = messageInput.value.trim();
        if (message) {
            try {
                await fetch('https://real-time-chat-supabase.onrender.com/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, message })
                });
                messageInput.value = '';
            } catch (error) {
                console.error("❌ Erreur lors de l'envoi du message:", error);
            }
        }
    };

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});