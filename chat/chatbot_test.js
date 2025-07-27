// chatbot_test.js (dentro de la carpeta 'chat')

// La URL de tu Netlify Function. Debe ser una ruta absoluta desde la raíz del dominio.
// Si tu sitio se publica desde la raíz (ej. solutionsads.netlify.app/),
// y tu función está en /.netlify/functions/, entonces esta ruta es correcta.
const API_ENDPOINT_URL = "/.netlify/functions/proxy-apps-script";

// ... el resto de tu código JS se mantiene igual ...

// --- Variables y elementos del DOM ---
const chatboxMessages = document.getElementById('chatbox-messages');
const chatboxInput = document.getElementById('chatbox-input');
const chatboxSendButton = document.getElementById('chatbox-send-button');

// --- Funciones del Chatbot ---

function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatboxMessages.appendChild(messageElement);
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
}

async function enviarMensajeDePrueba() {
    const message = chatboxInput.value.trim();
    if (message === '') {
        return;
    }

    addMessage('user', message);
    chatboxInput.value = '';

    addMessage('bot', 'Enviando mensaje a través del proxy de Netlify...');

    try {
        const payload = {
            action: 'saveTestMessage',
            testMessage: message,
            timestamp: new Date().toISOString()
        };

        // Llama a la Netlify Function
        const response = await fetch(API_ENDPOINT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error en el proxy: ${response.status} - ${errorData.message || 'Error desconocido.'}`);
        }

        const data = await response.json();
        addMessage('bot', `Respuesta final: ${data.message || 'Éxito, pero sin mensaje específico.'}`);

    } catch (error) {
        console.error('Error de conexión al enviar mensaje:', error);
        addMessage('bot', `Error de conexión. Falló al comunicarse con el proxy. Detalles: ${error.message}`);
    }
}

// --- Event Listeners ---
chatboxSendButton.addEventListener('click', enviarMensajeDePrueba);
chatboxInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        enviarMensajeDePrueba();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    addMessage('bot', '¡Hola! Soy un bot de prueba. Escribe un mensaje para ver si los datos se guardan.');
});