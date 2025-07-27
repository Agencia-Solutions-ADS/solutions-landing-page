// --- chatbot_test.js ---

// ¡¡¡IMPORTANTE!!! Pega aquí la URL de tu nuevo despliegue de Apps Script 'ChatbotLuca_TestAPI'
const endpointURL = "https://script.google.com/macros/s/AKfycbwCi9Lm3S67GzF0qEF_y9Id7hskm-SK8xQotkRARJRBzw4qrW41WJCDrUJPRIaVYB-DLg/exec"; // ¡TU URL REAL AQUÍ! // <<< ¡ACTUALIZA CON TU PROPIA URL DE DESPLIEGUE!

document.addEventListener("DOMContentLoaded", () => {
    // Selecciona los elementos HTML (usando los mismos IDs de tu chatbot original)
    const chatbotContainer = document.getElementById("chatbot-container");
    const chatbotToggleButton = document.getElementById("chatbot-toggle-button");
    const chatbotCloseButton = document.getElementById("chatbot-close-button");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotSendButton = document.getElementById("chatbot-send-button");

    // --- DEBUGGING: Revisa si los elementos se encuentran ---
    console.log("Elemento chatbotContainer:", chatbotContainer);
    console.log("Elemento chatbotToggleButton:", chatbotToggleButton);
    console.log("Elemento chatbotCloseButton:", chatbotCloseButton);
    console.log("Elemento chatbotMessages:", chatbotMessages);
    console.log("Elemento chatbotInput:", chatbotInput);
    console.log("Elemento chatbotSendButton:", chatbotSendButton);
    // --- FIN DEBUGGING ---


    function agregarMensaje(texto, autor = "bot") {
        const div = document.createElement("div");
        div.className = `message ${autor}`; // Usando las clases de tu style.css
        div.textContent = texto;
        chatbotMessages.appendChild(div);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    async function enviarMensajeDePrueba() {
        const userMessage = chatbotInput.value.trim();
        if (!userMessage) {
            agregarMensaje("Por favor, escribe un mensaje de prueba.", "bot");
            return;
        }

        agregarMensaje(userMessage, "user"); // Muestra lo que el usuario escribió
        chatbotInput.value = ""; // Limpia el input

        try {
            agregarMensaje("Enviando mensaje de prueba a la API...", "bot");
            
            const response = await fetch(endpointURL, {
                method: 'POST',
                mode: 'cors', // Crucial para la comunicación entre dominios
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ testMessage: userMessage }) // Envía un objeto simple
            });

            if (response.ok) {
                const result = await response.json();
                agregarMensaje(`API respondió: ${result.message || JSON.stringify(result)}`, "bot");
                console.log("Respuesta completa de la API de prueba:", result);
            } else {
                const errorText = await response.text();
                agregarMensaje(`Error de la API: ${response.status} - ${errorText}`, "bot");
                console.error("Error en la respuesta de la API de prueba:", response.status, errorText);
            }
        } catch (error) {
            agregarMensaje(`Error de conexión: ${error.message}. Revisa la consola.`, "bot");
            console.error("Error de fetch en chatbot_test.js:", error);
        }
    }

    // --- Funcionalidad de Abrir/Cerrar Chatbot (Añadida de nuevo) ---
    if (chatbotToggleButton) { // Verifica que el elemento existe antes de añadir el listener
        chatbotToggleButton.addEventListener("click", () => {
            chatbotContainer.classList.toggle("hidden");
            chatbotToggleButton.classList.toggle("hidden");
            if (!chatbotContainer.classList.contains("hidden")) {
                // Mensaje de bienvenida inicial (solo si está vacío)
                if (chatbotMessages.children.length === 0) {
                    agregarMensaje("¡Hola! Soy un bot de prueba. Escribe un mensaje para ver si los datos se guardan.", "bot");
                }
                chatbotInput.focus();
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            }
        });
    } else {
        console.error("Error: chatbotToggleButton no encontrado. Asegúrate que el ID 'chatbot-toggle-button' esté en tu HTML.");
    }

    if (chatbotCloseButton) { // Verifica que el elemento existe
        chatbotCloseButton.addEventListener("click", () => {
            chatbotContainer.classList.add("hidden");
            chatbotToggleButton.classList.remove("hidden");
        });
    } else {
        console.error("Error: chatbotCloseButton no encontrado. Asegúrate que el ID 'chatbot-close-button' esté en tu HTML.");
    }
    // --- FIN Funcionalidad de Abrir/Cerrar Chatbot ---


    // Reemplaza los listeners del chatbot original con los de la prueba
    if (chatbotSendButton) {
        chatbotSendButton.addEventListener("click", enviarMensajeDePrueba);
    } else {
        console.error("Error: chatbotSendButton no encontrado.");
    }

    if (chatbotInput) {
        chatbotInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                enviarMensajeDePrueba();
            }
        });
    } else {
        console.error("Error: chatbotInput no encontrado.");
    }

    // Mensaje de inicio de la prueba (solo si el contenedor no está oculto al principio y no hay mensajes)
    // Este mensaje se mostrará automáticamente si el chatbot no está hidden al cargar o después de abrirlo
    if (!chatbotContainer.classList.contains("hidden") && chatbotMessages.children.length === 0) {
        agregarMensaje("¡Hola! Soy un bot de prueba. Escribe un mensaje para ver si los datos se guardan.", "bot");
    }
});