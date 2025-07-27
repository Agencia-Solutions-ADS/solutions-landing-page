// chatbot_test.js del chatbot

// La URL de tu API de Google Apps Script.
// Este marcador de posición será reemplazado por Netlify durante el despliegue.
const APPS_SCRIPT_API_URL = "__APPS_SCRIPT_API_URL_PLACEHOLDER__";

// --- Variables y elementos del DOM ---
const chatboxMessages = document.getElementById('chatbox-messages');
const chatboxInput = document.getElementById('chatbox-input');
const chatboxSendButton = document.getElementById('chatbox-send-button');

// --- Funciones del Chatbot ---

// Función para añadir un mensaje al chat
function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatboxMessages.appendChild(messageElement);
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight; // Auto-scroll
}

// Función para enviar un mensaje de prueba a la API (tu Google Apps Script)
async function enviarMensajeDePrueba() {
    const message = chatboxInput.value.trim();
    if (message === '') {
        return; // No enviar mensajes vacíos
    }

    addMessage('user', message); // Muestra el mensaje del usuario en el chat
    chatboxInput.value = ''; // Limpia el input

    addMessage('bot', 'Enviando mensaje de prueba a la API...'); // Mensaje de feedback

    try {
        const payload = {
            action: 'saveTestMessage', // Puedes definir una acción específica para tu endpoint de prueba si lo necesitas en Apps Script
            testMessage: message,
            timestamp: new Date().toISOString()
        };

        const response = await fetch(APPS_SCRIPT_API_URL, {
            method: 'POST',
            mode: 'cors', // Asegura el modo CORS para la petición
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // Si la respuesta no es 2xx, lanza un error
            const errorText = await response.text(); // Intenta leer el cuerpo de la respuesta para más detalles
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json(); // Parsea la respuesta JSON de tu Apps Script
        addMessage('bot', `Respuesta de la API: ${data.message || 'Éxito, pero sin mensaje específico.'}`);

        // Opcional: Si quieres mostrar los datos guardados en la hoja
        // addMessage('bot', `Datos guardados: ${JSON.stringify(data)}`);

    } catch (error) {
        console.error('Error de conexión al enviar mensaje a Apps Script:', error);
        addMessage('bot', 'Error de conexión. Falló al comunicarse con la API. Revisa la consola para más detalles.');
    }
}

// --- Event Listeners ---

// Evento al hacer click en el botón de enviar
chatboxSendButton.addEventListener('click', enviarMensajeDePrueba);

// Evento al presionar Enter en el input
chatboxInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        enviarMensajeDePrueba();
    }
});

// Mensaje de bienvenida inicial
document.addEventListener('DOMContentLoaded', () => {
    addMessage('bot', '¡Hola! Soy un bot de prueba. Escribe un mensaje para ver si los datos se guardan.');
});