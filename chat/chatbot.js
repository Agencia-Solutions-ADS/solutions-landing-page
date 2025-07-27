// Variable para la URL de tu API de Google Apps Script
// ¡¡¡IMPORTANTE!!! Asegúrate de que esta URL sea la que obtienes al publicar tu Web App en Google Apps Script
const endpointURL = "https://script.google.com/macros/s/AKfycbwdqoPfxDQh-5GqD1-RoML6Nhv1tmIRuS5SnFpPw_cRJKjACPfhqP-S3Q3kLgBV8OHZ0A/exec"; // ¡ACTUALIZA CON TU PROPIA URL DE DESPLIEGUE!

// Variable para la cotización del dólar (Ej: Dólar Blue Argentina)
// ¡IMPORTANTE!: Actualizar este valor manualmente según la cotización actual.
const DOLAR_BLUE_COTIZACION = 1300; // Ejemplo: 1 dólar = 1300 pesos argentinos (ACTUALIZAR ESTE VALOR)

// Variables globales para mantener el estado de la conversación y los datos del usuario
let conversationState = 'initial';
let userData = {
    nombre: '',
    email: '',
    whatsapp: '',
    presupuesto: '',
    rubro: '', // No usado aún en el flujo principal, pero listo
    interes: '', // No usado aún en el flujo principal, pero listo
    planSugerido: '',
    canalContacto: '',
    fechaContacto: '', // No usado aún en el flujo principal, pero listo
    horaContacto: '' // No usado aún en el flujo principal, pero listo
};

// Objeto que almacena la información detallada de los planes y servicios de Solutions Ads
const solutionsAdsInfo = {
    planes: {
        "standard": {
            nombre: "Plan Standard",
            precio: "$299 USD/mes",
            descripcion: "Ideal para emprendedores y nuevos negocios que buscan establecer una presencia digital sólida y generar sus primeras ventas. Incluye Diseño Gráfico Básico (5 piezas mensuales), Publicidad Digital Inicial (gestión de 1 campaña en Meta Ads, presupuesto publicitario no incluido) y Asesoría inicial de Marketing Estratégico.",
            publico: "Emprendedores, profesionales independientes y micro-negocios con presupuesto limitado y ambición de crecer.",
            diferenciador: "Acceso profesional y accesible para despegar en el mundo digital, con acompañamiento experto."
        },
        "empresas": {
            nombre: "Plan Empresas",
            precio: "$499 USD/mes",
            descripcion: "Dirigido a pymes y negocios establecidos que buscan escalar sus resultados, aumentar la captación de leads y potenciar sus ventas. Incluye Diseño Gráfico Avanzado (hasta 15 piezas mensuales), Publicidad Digital Integral (gestión de hasta 3 campañas optimizadas en Meta Ads y Google Ads, presupuesto publicitario no incluido), Marketing Estratégico Integral (embudos de venta, automatizaciones básicas, optimización de conversión) y Reportes Mensuales Detallados.",
            publico: "Pequeñas y medianas empresas, comercios y servicios que buscan un crecimiento sostenido y maximizar su ROI en marketing digital.",
            diferenciador: "Estrategia multi-canal con alto enfoque en la conversión para un crecimiento empresarial tangible y medible."
        },
        "expertos": {
            nombre: "Plan Expertos",
            precio: "$949 USD/mes",
            descripcion: "Para profesionales, líderes de opinión y empresas que desean posicionarse como referentes, escalar a gran escala y maximizar su autoridad. Incluye Diseño Gráfico Premium (ilimitado), Publicidad Digital Pro (multi-plataforma: Meta Ads, Google Ads, LinkedIn Ads con remarketing y segmentación profunda), Marketing Estratégico y Automatización avanzada (ecosistemas digitales complejos, CRM, SEO, fidelización), Mentorías Personalizadas en Ventas y Conversión, y Análisis Predictivo y Optimización Constante.",
            publico: "Consultores, coaches, formadores, agencias y empresas con alto potencial de crecimiento que buscan expansión ambiciosa y liderazgo de mercado.",
            diferenciador: "Acompañamiento estratégico de élite, soluciones personalizadas y mentoría directa para alcanzar el máximo potencial."
        }
    },
    servicios: {
        "diseño gráfico": {
            nombre: "Servicio de Diseño Gráfico",
            precio: "Desde $199 USD (por pieza o paquete de inicio)",
            descripcion: "Creación de logotipos, identidad de marca, manuales, piezas para redes sociales, banners, infografías, folletos digitales y material para presentaciones.",
            publico: "Cualquier empresa o profesional que necesite material visual de alta calidad, coherente y estratégico para su comunicación y campañas.",
            diferenciador: "Unimos creatividad artística con visión de marketing para que cada diseño no solo sea atractivo, sino que impulse tus objetivos comerciales."
        },
        "publicidad digital": {
            nombre: "Servicio de Publicidad Digital (Gestión de Campañas)",
            precio: "Desde $299 USD (gestión de campaña básica) + presupuesto de anuncios",
            descripcion: "Configuración, gestión y optimización proactiva de campañas en Meta Ads (Facebook/Instagram), Google Ads (Búsqueda, Display, YouTube) o TikTok Ads. Incluye investigación de audiencias, creación de anuncios, optimización diaria y reportes con insights.",
            publico: "Negocios que buscan un ROI claro en publicidad, potenciar su alcance y resultados, o externalizar la gestión compleja de sus campañas.",
            diferenciador: "Expertos certificados que no solo gestionan, sino que optimizan constantemente tus campañas para asegurar que cada dólar invertido trabaje al máximo."
        },
        "marketing estratégico": {
            nombre: "Servicio de Marketing Estratégico (Consultoría/Implementación)",
            precio: "Desde $249 USD (por consultoría de 1 hora) / Proyectos bajo cotización",
            descripcion: "Desarrollo e implementación de embudos de venta personalizados, automatizaciones de email marketing, auditorías y optimización SEO, y consultorías profundas para diseñar la hoja de ruta digital más efectiva.",
            publico: "Empresas que necesitan una dirección estratégica clara, soluciones a medida para captación de leads, o apoyo especializado en implementación de herramientas avanzadas.",
            diferenciador: "No solo te damos el 'qué', sino el 'cómo'. Te proporcionamos la estrategia y te ayudamos a implementarla para que veas resultados concretos."
        },
        "mentorias en ventas": {
            nombre: "Servicio de Mentorías en Ventas y Conversión",
            precio: "Desde $199 USD (por sesión de 1 hora)",
            descripcion: "Sesiones personalizadas (1 a 1 o grupales) para entrenar equipos de venta, optimizar procesos de cierre, manejar objeciones, construir guiones efectivos y mejorar las tasas de conversión. Incluye material y seguimiento.",
            publico: "Equipos de ventas, emprendedores y profesionales que desean perfeccionar sus habilidades de negociación, cerrar más tratos y transformar conversaciones en oportunidades.",
            diferenciador: "Entrenamiento práctico y directamente aplicable de la mano de expertos, con técnicas probadas para transformar prospectos en clientes leales."
        }
    }
};

// Contraseñas para el modo aprendizaje (se mantendrán si decidimos reintroducir la lógica)
const activationPassword = "learnModeOn";
const deactivationPassword = "learnModeOff";

document.addEventListener("DOMContentLoaded", () => {
    // Selectores de elementos HTML (usando los IDs que ya tienes en tu HTML y en el código principal)
    const chatbotContainer = document.getElementById("chatbot-container");
    const chatbotToggleButton = document.getElementById("chatbot-toggle-button");
    const chatbotCloseButton = document.getElementById("chatbot-close-button");
    const chatbotMessages = document.getElementById("chatbot-messages"); // Donde se añaden los mensajes
    const chatbotInput = document.getElementById("chatbot-input"); // El input de texto
    const chatbotSendButton = document.getElementById("chatbot-send-button"); // El botón de enviar

    // --- Funcionalidad de Abrir/Cerrar Chatbot ---
    chatbotToggleButton.addEventListener("click", () => {
        chatbotContainer.classList.toggle("hidden");
        chatbotToggleButton.classList.toggle("hidden");
        if (!chatbotContainer.classList.contains("hidden")) {
            if (chatbotMessages.children.length === 0) {
                // Mensaje de bienvenida inicial - ¡Actualizado para preguntar el nombre!
                agregarMensaje("¡Hola! Soy Luca, tu asistente de Solutions Ads. ¿Con quién tengo el gusto de hablar y en qué puedo ayudarte hoy?", "bot");
                conversationState = 'waiting_for_name'; // Establece el estado para esperar el nombre
            }
            chatbotInput.focus();
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    });

    chatbotCloseButton.addEventListener("click", () => {
        chatbotContainer.classList.add("hidden");
        chatbotToggleButton.classList.remove("hidden");
    });

    // --- Funciones de Utilidad del Chatbot (adaptadas para lógica local) ---

    /**
     * Agrega un mensaje a la interfaz del chat.
     * @param {string} texto - El contenido del mensaje.
     * @param {string} autor - 'user' o 'bot'.
     */
    function agregarMensaje(texto, autor = "bot") {
        const div = document.createElement("div");
        div.className = `message ${autor}`;
        div.textContent = texto;
        chatbotMessages.appendChild(div);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    /**
     * Detección de interés basada en palabras clave del usuario.
     * @param {string} mensaje - Mensaje del usuario.
     * @returns {string} Nivel de interés: 'decidido', 'muy interesado', 'interesado', 'A definir'.
     */
    function detectarInteres(mensaje) {
        const msg = mensaje.toLowerCase();
        if (msg.includes("quiero contratar") || msg.includes("necesito urgente") || msg.includes("quiero cerrar")) return "decidido";
        if (msg.includes("quiero saber") || msg.includes("me interesa") || msg.includes("cotización")) return "muy interesado";
        if (msg.includes("pregunta") || msg.includes("info") || msg.includes("duda")) return "interesado";
        return "A definir";
    }

    /**
     * Sugiere un plan basado en palabras clave del usuario.
     * @param {string} mensaje - Mensaje del usuario.
     * @returns {string} Nombre del plan sugerido.
     */
    function sugerirPlan(mensaje) {
        const msg = mensaje.toLowerCase();
        if (msg.includes("empezando") || msg.includes("pequeña empresa") || msg.includes("autónomo") || msg.includes("bajo presupuesto")) return "Plan Standard";
        if (msg.includes("empresa") || msg.includes("negocio establecido") || msg.includes("crecimiento")) return "Plan Empresas";
        if (msg.includes("escala") || msg.includes("mentoría") || msg.includes("líder") || msg.includes("experto")) return "Plan Expertos";
        return "A definir";
    }

    /**
     * Capitaliza la primera letra de una cadena y el resto en minúsculas.
     * @param {string} str - La cadena a capitalizar.
     * @returns {string} La cadena con la primera letra capitalizada.
     */
    function capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Envía los datos del usuario a la hoja de Google Sheets a través de Google Apps Script.
     */
    async function sendDataToGoogleSheet() {
        console.log("Intentando enviar datos a Google Sheet:", userData); // Para depuración

        try {
            const response = await fetch(endpointURL, {
                method: 'POST',
                mode: 'cors', // Necesario para peticiones entre dominios
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData) // Convierte el objeto userData a una cadena JSON
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Datos enviados con éxito:", result);
                // Aquí podrías agregar una confirmación visual al usuario si lo deseas
                // Por ejemplo: agregarMensaje("¡Tu información ha sido enviada con éxito a nuestro equipo!", "bot");
            } else {
                const errorText = await response.text();
                console.error("Error al enviar datos:", response.status, errorText);
                // Manejo de errores: Informar al usuario o reintentar
                // agregarMensaje("Hubo un problema al enviar tu información. Por favor, inténtalo de nuevo o contáctanos directamente.", "bot");
            }
        } catch (error) {
            console.error("Error de red o CORS al enviar datos:", error);
            // Manejo de errores de conexión
            // agregarMensaje("Hubo un problema de conexión al enviar tu información. Por favor, verifica tu internet.", "bot");
        }
    }


    /**
     * Lógica de respuesta del bot, ahora completamente local.
     * Aquí integraremos los 'if's y la lógica de conversación.
     * @param {string} userMessage - Mensaje del usuario.
     */
    function processUserMessageLocally(userMessage) {
        let botResponse = "";
        let newState = conversationState;

        const lowerCaseMessage = userMessage.toLowerCase();

        // Lógica del modo aprendizaje (simulada localmente)
        if (lowerCaseMessage.includes(activationPassword) && conversationState !== 'learning_mode_active') {
            botResponse = "Modo aprendizaje activado. ¡Hola maestro! (En modo local, esta función es solo una simulación).";
            newState = 'learning_mode_active';
        } else if (lowerCaseMessage.includes(deactivationPassword) && conversationState === 'learning_mode_active') {
            botResponse = "Modo aprendizaje desactivado. Volviendo al modo normal.";
            newState = 'initial';
        } else if (newState === 'learning_mode_active') {
            botResponse = "En modo local, no puedo 'aprender' permanentemente. Pero entiendo que quisiste enseñarme algo.";
        }

        // --- Lógica Principal del Chatbot ---
        if (!botResponse) { // Si el modo aprendizaje no generó una respuesta

            // *** LÓGICA REVISADA: Manejo de la presentación del usuario y captura del nombre ***
            if (newState === 'waiting_for_name') {
                let userProvidedName = '';
                let remainingMessage = userMessage.trim(); // Inicialmente, todo el mensaje es "remaining"

                // Expresión regular para extraer el nombre de forma más flexible
                // Busca patrones como "soy [nombre]", "mi nombre es [nombre]", "hola [nombre]", o solo el nombre al inicio
                // Captura el nombre y el resto del mensaje para procesarlo aparte
                const nameExtractionPattern = /(?:hola(?:,)?\s*)?(?:soy|mi nombre es)\s+([a-záéíóúüñ\s]+?)(?:\s+y\s+|\s+quiero\s+|\s+me\s+|\s+de\s+|\s*[,.!?].*|$)|(?:hola(?:,)?\s*)?([a-záéíóúüñ]+(?:\s[a-záéíóúüñ]+)*)(?:\s+y\s+|\s+quiero\s+|\s+me\s+|\s+de\s+|\s*[,.!?].*|$)/i;

                const nameMatch = userMessage.match(nameExtractionPattern);

                if (nameMatch) {
                    // El nombre puede estar en el grupo 1 (si hay "soy", "mi nombre es") o grupo 2 (si es solo un nombre inicial)
                    userProvidedName = (nameMatch[1] || nameMatch[2] || '').trim();

                    // Intentar extraer el resto del mensaje después del nombre
                    if (userProvidedName) {
                        const nameStartIndex = lowerCaseMessage.indexOf(userProvidedName.toLowerCase());
                        if (nameStartIndex !== -1) {
                            // Encontrar el índice donde termina el nombre en el mensaje original
                            const nameEndIndex = nameStartIndex + userProvidedName.length;
                            // El remainingMessage es lo que sigue al nombre
                            remainingMessage = userMessage.substring(nameEndIndex).trim();
                        }
                    }
                } else {
                    // Si la expresión regular no encuentra un patrón claro, se asume que todo el mensaje puede ser la consulta.
                    // No se extrae un nombre en este caso, o se deja como vacío.
                    userProvidedName = '';
                    remainingMessage = userMessage.trim();
                }

                // Limpiar el nombre de conectores o palabras introductorias si se colaron
                const commonNamePrefixes = ['hola', 'soy', 'mi', 'nombre', 'es', 'y'];
                const nameWords = userProvidedName.split(' ');
                if (nameWords.length > 0 && commonNamePrefixes.includes(nameWords[0].toLowerCase())) {
                    userProvidedName = nameWords.slice(1).join(' ').trim();
                }

                // Si el nombre aún está vacío o es una palabra común, no lo establecemos y Luca usará un saludo genérico
                if (userProvidedName && userProvidedName.length > 1) { // Asegura que el nombre tenga al menos 2 caracteres
                    userData.nombre = capitalizeFirstLetter(userProvidedName);
                    botResponse = `¡Mucho gusto, ${userData.nombre}!`;
                } else {
                    userData.nombre = ""; // Limpiar el nombre si no es válido
                    botResponse = `¡Hola!`;
                }

                newState = 'initial'; // Siempre pasa a 'initial' después del saludo inicial

                // Procesar el resto del mensaje (remainingMessage) para la consulta inicial
                if (remainingMessage) {
                    // Limpiamos frases introductorias de la consulta (ej. "quiero saber de los planes")
                    const cleanedRemainingMessage = remainingMessage.replace(/(quiero saber de|me gustaria consultar por|quiero saber|quisiera saber|me gustaria consultar|de los|los)\s*/i, '').trim();

                    if (cleanedRemainingMessage.includes("servicios") || cleanedRemainingMessage.includes("que ofrecen") || cleanedRemainingMessage.includes("planes") || cleanedRemainingMessage.includes("costos") || cleanedRemainingMessage.includes("precios")) {
                        const hasPlanes = cleanedRemainingMessage.includes("planes");
                        const hasServicios = cleanedRemainingMessage.includes("servicios") || cleanedRemainingMessage.includes("que ofrecen");
                        const hasCostos = cleanedRemainingMessage.includes("costos") || cleanedRemainingMessage.includes("precios");

                        if (hasPlanes && hasServicios && hasCostos) {
                            botResponse += " Veo que tu consulta está enfocada en los Planes, Servicios y Costos. ¿Por dónde te gustaría empezar? ¿Planes, Servicios o Costos?";
                            newState = 'asking_plan_service_cost_preference';
                        } else if (hasPlanes && hasServicios) {
                            botResponse += " Comprendo tu interés en Planes y Servicios. ¿Te gustaría empezar con los Planes o los Servicios?";
                            newState = 'asking_plan_service_preference';
                        } else if (hasPlanes && hasCostos) {
                            botResponse += " Entiendo, te interesan los Planes y sus Costos. ¿Preferirías que hablemos primero de los Planes o de los Costos?";
                            newState = 'asking_plan_cost_preference';
                        } else if (hasServicios && hasCostos) {
                            botResponse += " Perfecto, veamos los Servicios y sus Costos. ¿Por cuál te gustaría que empecemos? ¿Servicios o Costos?";
                            newState = 'asking_service_cost_preference';
                        } else if (hasPlanes) {
                            botResponse += ` Claro, con gusto te guío sobre nuestros Planes: ${solutionsAdsInfo.planes.standard.nombre}, ${solutionsAdsInfo.planes.empresas.nombre} y ${solutionsAdsInfo.planes.expertos.nombre}. ¿Cuál te gustaría conocer en más detalle?`;
                            newState = 'asking_for_plan_type';
                        } else if (hasServicios) {
                            botResponse += ` Excelente, te comento sobre nuestros Servicios: ${solutionsAdsInfo.servicios["diseño gráfico"].nombre}, ${solutionsAdsInfo.servicios["publicidad digital"].nombre}, ${solutionsAdsInfo.servicios["marketing estratégico"].nombre} y ${solutionsAdsInfo.servicios["mentorias en ventas"].nombre}. ¿Cuál te interesa más?`;
                            newState = 'asking_for_service_type';
                        } else if (hasCostos) {
                            botResponse += " Entiendo, buscas información sobre costos. Para poder orientarte mejor, ¿cuál de nuestros planes o servicios te llamó la atención, o tienes algún presupuesto en mente?";
                            newState = 'asking_for_cost_details_or_budget'; // Nuevo estado
                        } else {
                            // Si no encaja en las categorías de consulta, pero hay un remaining message
                            botResponse += " Ahora sí, dime, ¿en qué más puedo asistirte hoy?";
                        }
                    } else {
                        // Si el resto del mensaje no es una consulta conocida, simplemente pregunta de nuevo.
                        botResponse += " Ahora sí, dime, ¿en qué puedo asistirte hoy?";
                    }
                } else {
                    // Si no hay "remainingMessage", simplemente pide la consulta.
                    botResponse += " Ahora sí, dime, ¿en qué puedo asistirte hoy?";
                }
            }
            // Si el usuario directamente dice "mi nombre es..." o "soy..." sin que se lo hayamos preguntado antes,
            // y el estado NO es 'waiting_for_name'. Esta es una mejora para que si se saltan la pregunta inicial,
            // aún así intente capturar el nombre.
            else if (lowerCaseMessage.includes("mi nombre es ") || lowerCaseMessage.includes("soy ")) {
                let userProvidedName = '';
                let tempRemainingMessage = userMessage.trim();

                const nameExtractionPattern = /(?:hola(?:,)?\s*)?(?:soy|mi nombre es)\s+([a-záéíóúüñ\s]+?)(?:\s+y\s+|\s+quiero\s+|\s+me\s+|\s+de\s+|\s*[,.!?].*|$)|(?:hola(?:,)?\s*)?([a-záéíóúüñ]+(?:\s[a-záéíóúüñ]+)*)(?:\s+y\s+|\s+quiero\s+|\s+me\s+|\s+de\s+|\s*[,.!?].*|$)/i;
                const nameMatch = userMessage.match(nameExtractionPattern);

                if (nameMatch) {
                    userProvidedName = (nameMatch[1] || nameMatch[2] || '').trim();
                    if (userProvidedName) {
                        const nameStartIndex = lowerCaseMessage.indexOf(userProvidedName.toLowerCase());
                        if (nameStartIndex !== -1) {
                            const nameEndIndex = nameStartIndex + userProvidedName.length;
                            tempRemainingMessage = userMessage.substring(nameEndIndex).trim();
                        }
                    }
                }

                const commonNamePrefixes = ['hola', 'soy', 'mi', 'nombre', 'es', 'y'];
                const nameWords = userProvidedName.split(' ');
                if (nameWords.length > 0 && commonNamePrefixes.includes(nameWords[0].toLowerCase())) {
                    userProvidedName = nameWords.slice(1).join(' ').trim();
                }

                if (userProvidedName && userProvidedName.length > 1) {
                    userData.nombre = capitalizeFirstLetter(userProvidedName);
                    botResponse = `¡Hola, ${userData.nombre}!`;
                } else {
                    botResponse = `¡Hola!`;
                }

                // Ahora intenta procesar la parte restante del mensaje como una consulta
                const cleanedTempRemainingMessage = tempRemainingMessage.replace(/(quiero saber de|me gustaria consultar por|quiero saber|quisiera saber|me gustaria consultar|de los|los)\s*/i, '').trim();

                if (cleanedTempRemainingMessage.includes("servicios") || cleanedTempRemainingMessage.includes("que ofrecen") || cleanedTempRemainingMessage.includes("planes") || cleanedTempRemainingMessage.includes("costos") || cleanedTempRemainingMessage.includes("precios")) {
                    const hasPlanes = cleanedTempRemainingMessage.includes("planes");
                    const hasServicios = cleanedTempRemainingMessage.includes("servicios") || cleanedTempRemainingMessage.includes("que ofrecen");
                    const hasCostos = cleanedTempRemainingMessage.includes("costos") || cleanedTempRemainingMessage.includes("precios");

                    if (hasPlanes && hasServicios && hasCostos) {
                        botResponse += " Veo que tu consulta está enfocada en los Planes, Servicios y Costos. ¿Por dónde te gustaría empezar? ¿Planes, Servicios o Costos?";
                        newState = 'asking_plan_service_cost_preference';
                    } else if (hasPlanes && hasServicios) {
                        botResponse += " Comprendo tu interés en Planes y Servicios. ¿Te gustaría empezar con los Planes o los Servicios?";
                        newState = 'asking_plan_service_preference';
                    } else if (hasPlanes && hasCostos) {
                        botResponse += " Entiendo, te interesan los Planes y sus Costos. ¿Preferirías que hablemos primero de los Planes o de los Costos?";
                        newState = 'asking_plan_cost_preference';
                    } else if (hasServicios && hasCostos) {
                        botResponse += " Perfecto, veamos los Servicios y sus Costos. ¿Por cuál te gustaría que empecemos? ¿Servicios o Costos?";
                        newState = 'asking_service_cost_preference';
                    } else if (hasPlanes) {
                        botResponse += ` Claro, con gusto te guío sobre nuestros Planes: ${solutionsAdsInfo.planes.standard.nombre}, ${solutionsAdsInfo.planes.empresas.nombre} y ${solutionsAdsInfo.planes.expertos.nombre}. ¿Cuál te gustaría conocer en más detalle?`;
                        newState = 'asking_for_plan_type';
                    } else if (hasServicios) {
                        botResponse += ` Excelente, te comento sobre nuestros Servicios: ${solutionsAdsInfo.servicios["diseño gráfico"].nombre}, ${solutionsAdsInfo.servicios["publicidad digital"].nombre}, ${solutionsAdsInfo.servicios["marketing estratégico"].nombre} y ${solutionsAdsInfo.servicios["mentorias en ventas"].nombre}. ¿Cuál te interesa más?`;
                        newState = 'asking_for_service_type';
                    } else if (hasCostos) {
                        botResponse += " Entiendo, buscas información sobre costos. Para poder orientarte mejor, ¿cuál de nuestros planes o servicios te llamó la atención, o tienes algún presupuesto en mente?";
                        newState = 'asking_for_cost_details_or_budget'; // Nuevo estado
                    } else {
                        botResponse += " ¿En qué más puedo asistirte hoy?";
                    }
                } else {
                    botResponse += " ¿En qué más puedo asistirte hoy?";
                }
                newState = 'initial'; // Siempre vuelve a initial después de este saludo
            }
            // Si el nombre ya está registrado y el usuario solo saluda (no preguntamos el nombre)
            else if (lowerCaseMessage.includes("hola") || lowerCaseMessage.includes("buenas")) {
                if (userData.nombre) {
                    botResponse = `¡Hola ${userData.nombre}! ¿En qué más puedo ayudarte?`;
                } else {
                    botResponse = "¡Hola! ¿Cómo puedo ayudarte hoy?";
                }
            }
            else if (lowerCaseMessage.includes("edad") || lowerCaseMessage.includes("genero") || lowerCaseMessage.includes("nombre real")) {
                botResponse = "Mi función está relacionada exclusivamente con los servicios de Solutions Ads. Todo lo demás es irrelevante. ¿En qué puedo asistirte con tu negocio?";
            }
            // --- NUEVA LÓGICA PARA RESPONDER SOBRE PLANES Y SERVICIOS (SIN PRECIO INICIAL) ---
            else if (conversationState === 'asking_for_plan_type' || lowerCaseMessage.includes("plan standard") || lowerCaseMessage.includes("plan empresas") || lowerCaseMessage.includes("plan expertos")) {
                let planKey = '';
                if (lowerCaseMessage.includes("plan standard")) planKey = "standard";
                else if (lowerCaseMessage.includes("plan empresas")) planKey = "empresas";
                else if (lowerCaseMessage.includes("plan expertos")) planKey = "expertos";

                // --- DEBUGGING CONSOLE LOGS ---
                console.log("--- DEBUG INFO for Plan ---");
                console.log("userMessage:", userMessage);
                console.log("lowerCaseMessage:", lowerCaseMessage);
                console.log("conversationState (before update):", conversationState);
                console.log("planKey determined:", planKey);
                // --- END DEBUGGING LOGS ---

                const planInfo = solutionsAdsInfo.planes[planKey];

                // --- DEBUGGING CONSOLE LOGS AFTER planInfo assignment ---
                console.log("planInfo (from solutionsAdsInfo.planes):", planInfo);
                console.log("----------------------------");
                // --- END DEBUGGING LOGS ---

                if (planInfo) {
                    // Si ya estamos preguntando por un plan o el usuario lo menciona directamente
                    if (newState !== 'asking_for_plan_type') { // Si viene de otro estado, establecemos el plan sugerido
                        userData.planSugerido = planInfo.nombre;
                    }

                    botResponse = `¡Excelente elección! El ${planInfo.nombre} es perfecto para ti. Está dirigido a ${planInfo.publico}. ${planInfo.descripcion} Su principal diferenciador es: "${planInfo.diferenciador}".\n\nEste plan es ideal para negocios como el tuyo, que buscan un crecimiento sostenido. ¿Te suena esto como la solución que tu empresa necesita para el siguiente nivel, ${userData.nombre || 'Estimado/a'}?`;
                    newState = 'confirming_value_before_price';
                } else if (newState === 'asking_for_plan_type') {
                    botResponse = "Por favor, especifica el plan: ¿Standard, Empresas o Expertos?";
                } else if (lowerCaseMessage.includes("planes") && !lowerCaseMessage.includes("precios") && !lowerCaseMessage.includes("costos")) {
                    botResponse = `Claro, con gusto te guío sobre nuestros Planes: ${solutionsAdsInfo.planes.standard.nombre}, ${solutionsAdsInfo.planes.empresas.nombre} y ${solutionsAdsInfo.planes.expertos.nombre}. ¿Cuál te gustaría conocer en más detalle?`;
                    newState = 'asking_for_plan_type';
                }
            }
            else if (conversationState === 'asking_for_service_type' || lowerCaseMessage.includes("diseño gráfico") || lowerCaseMessage.includes("publicidad digital") || lowerCaseMessage.includes("marketing estratégico") || lowerCaseMessage.includes("mentorias en ventas")) {
                let serviceKey = '';
                if (lowerCaseMessage.includes("diseño gráfico") || lowerCaseMessage.includes("diseño grafico")) serviceKey = "diseño gráfico";
                else if (lowerCaseMessage.includes("publicidad digital")) serviceKey = "publicidad digital";
                else if (lowerCaseMessage.includes("marketing estratégico") || lowerCaseMessage.includes("marketing estrategico")) serviceKey = "marketing estratégico";
                else if (lowerCaseMessage.includes("mentorias en ventas") || lowerCaseMessage.includes("mentorias de ventas")) serviceKey = "mentorias en ventas";

                // --- DEBUGGING CONSOLE LOGS ---
                console.log("--- DEBUG INFO for Service ---");
                console.log("userMessage:", userMessage);
                console.log("lowerCaseMessage:", lowerCaseMessage);
                console.log("conversationState (before update):", conversationState);
                console.log("serviceKey determined:", serviceKey);
                // --- END DEBUGGING LOGS ---

                const serviceInfo = solutionsAdsInfo.servicios[serviceKey];

                // --- DEBUGGING CONSOLE LOGS AFTER serviceInfo assignment ---
                console.log("serviceInfo (from solutionsAdsInfo.servicios):", serviceInfo);
                console.log("----------------------------");
                // --- END DEBUGGING LOGS ---

                if (serviceInfo) {
                    botResponse = `¡Claro! Nuestro ${serviceInfo.nombre} está diseñado para ${serviceInfo.publico}. Este servicio incluye: ${serviceInfo.descripcion} Su principal ventaja es que: "${serviceInfo.diferenciador}".\n\n¿Te suena esto como la solución que tu negocio necesita para un impulso significativo, ${userData.nombre || 'Estimado/a'}?`;
                    newState = 'confirming_value_before_price_service'; // Nuevo estado para servicios
                    userData.planSugerido = serviceInfo.nombre; // Usamos planSugerido para almacenar el servicio en foco
                } else if (newState === 'asking_for_service_type') {
                    botResponse = "Por favor, indícame qué servicio te interesa: ¿Diseño, Publicidad Digital, Marketing Estratégico o Mentorías en Ventas?";
                } else if (lowerCaseMessage.includes("servicios") && !lowerCaseMessage.includes("precios") && !lowerCaseMessage.includes("costos")) {
                    botResponse = `Excelente, te comento sobre nuestros Servicios: ${solutionsAdsInfo.servicios["diseño gráfico"].nombre}, ${solutionsAdsInfo.servicios["publicidad digital"].nombre}, ${solutionsAdsInfo.servicios["marketing estratégico"].nombre} y ${solutionsAdsInfo.servicios["mentorias en ventas"].nombre}. ¿Cuál te interesa más?`;
                    newState = 'asking_for_service_type';
                }
            }
            // --- FIN NUEVA LÓGICA PARA RESPONDER SOBRE PLANES Y SERVICIOS (SIN PRECIO INICIAL) ---

            // --- Lógica para confirmar valor antes de dar precio (Plan) ---
            else if (newState === 'confirming_value_before_price') {
                const planKey = userData.planSugerido.toLowerCase().replace('plan ', ''); // Obtiene la clave del plan
                const planInfo = solutionsAdsInfo.planes[planKey];

                if (lowerCaseMessage.includes("si") || lowerCaseMessage.includes("me suena") || lowerCaseMessage.includes("absolutamente") || lowerCaseMessage.includes("claro") || lowerCaseMessage.includes("ok") || lowerCaseMessage.includes("perfecto")) {
                    botResponse = `¡Magnífico, ${userData.nombre || 'Estimado/a'}! Con esa seguridad, puedo decirte que la inversión para el ${planInfo.nombre} es de **${planInfo.precio}**. Como te comentaba, está diseñado para darte resultados tangibles y medibles. Si este plan te garantiza ese crecimiento y esos clientes que deseas, ¿sería una inversión que considerarías seria para tu negocio?`;
                    newState = 'waiting_for_price_reaction'; // Espera la reacción al precio o al cierre de Alex Dey
                } else if (lowerCaseMessage.includes("no") || lowerCaseMessage.includes("no mucho") || lowerCaseMessage.includes("no me convence")) {
                    botResponse = `Entiendo. Quizás necesitas algo diferente. ¿Podrías decirme qué resultados específicos estás buscando o si hay algún otro plan/servicio que te interese más?`;
                    newState = 'initial'; // Vuelve a un estado más general
                } else if (lowerCaseMessage.includes("cuanto cuesta") || lowerCaseMessage.includes("precio") || lowerCaseMessage.includes("costo") || lowerCaseMessage.includes("valor")) {
                    botResponse = `¡Excelente pregunta, ${userData.nombre || 'Estimado/a'}! Entiendo que el costo es importante al tomar una decisión. Antes de darte el valor, quiero asegurarme de que el ${planInfo.nombre} es exactamente lo que necesitas para alcanzar esos resultados que buscas. Si este plan te garantiza ese crecimiento y esos clientes que deseas, ¿sería una inversión que considerarías seria para tu negocio?`;
                    newState = 'waiting_for_price_reaction';
                }
                else {
                    botResponse = `Para que podamos avanzar, ${userData.nombre || 'Estimado/a'}, ¿este plan te suena como la solución que tu empresa necesita para el siguiente nivel, o tienes alguna otra pregunta antes de que hablemos de la inversión?`;
                }
            }
            // --- Lógica para confirmar valor antes de dar precio (Servicio) ---
            else if (newState === 'confirming_value_before_price_service') {
                const serviceKey = userData.planSugerido.toLowerCase(); // El servicio está en planSugerido
                const serviceInfo = solutionsAdsInfo.servicios[serviceKey];

                if (lowerCaseMessage.includes("si") || lowerCaseMessage.includes("me suena") || lowerCaseMessage.includes("absolutamente") || lowerCaseMessage.includes("claro") || lowerCaseMessage.includes("ok") || lowerCaseMessage.includes("perfecto")) {
                    botResponse = `¡Excelente, ${userData.nombre || 'Estimado/a'}! Teniendo claro que es lo que buscas, puedo decirte que la inversión para nuestro ${serviceInfo.nombre} es de **${serviceInfo.precio}**. Como te comentaba, está diseñado para un impulso significativo. Si este servicio te garantiza alcanzar tus metas, ¿sería una inversión que considerarías prioritaria para tu negocio?`;
                    newState = 'waiting_for_price_reaction_service'; // Nuevo estado para servicios
                } else if (lowerCaseMessage.includes("no") || lowerCaseMessage.includes("no mucho") || lowerCaseMessage.includes("no me convence")) {
                    botResponse = `Entiendo. Quizás necesitas algo diferente. ¿Podrías decirme qué resultados específicos estás buscando o si hay algún otro plan/servicio que te interese más?`;
                    newState = 'initial';
                } else if (lowerCaseMessage.includes("cuanto cuesta") || lowerCaseMessage.includes("precio") || lowerCaseMessage.includes("costo") || lowerCaseMessage.includes("valor")) {
                    botResponse = `¡Excelente pregunta, ${userData.nombre || 'Estimado/a'}! Entiendo que el costo es importante al tomar una decisión. Antes de darte el valor, quiero asegurarme de que el ${serviceInfo.nombre} es exactamente lo que necesitas para alcanzar esos resultados que buscas. Si este servicio te garantiza alcanzar tus metas, ¿sería una inversión que considerarías prioritaria para tu negocio?`;
                    newState = 'waiting_for_price_reaction_service';
                }
                else {
                    botResponse = `Para que podamos avanzar, ${userData.nombre || 'Estimado/a'}, ¿este servicio te suena como la solución que tu negocio necesita para un impulso significativo, o tienes alguna otra pregunta antes de que hablemos de la inversión?`;
                }
            }
            // --- Lógica de Manejo de Objeción por Precio y Ofrecer Descuento ---
            else if (newState === 'waiting_for_price_reaction' || newState === 'waiting_for_price_reaction_service' || newState === 'asking_for_cost_details_or_budget') {
                const currentPlanOrService = userData.planSugerido ? (userData.planSugerido.toLowerCase().includes('plan') ? solutionsAdsInfo.planes[userData.planSugerido.toLowerCase().replace('plan ', '')] : solutionsAdsInfo.servicios[userData.planSugerido.toLowerCase()]) : null;

                const matchNegativePrice = lowerCaseMessage.match(/(caro|mucho|no me alcanza|no tengo|excede|demasiado|no es mi presupuesto|puedo pagar)/);
                const matchPositivePrice = lowerCaseMessage.match(/(ok|bien|consideraria|si|me interesa|adelante|perfecto|suena bien)/);
                // Captura números seguidos o no de 'pesos', 'ars', 'usd', '$' o solo el número
                const matchNumericBudget = lowerCaseMessage.match(/(\d+(\.?\d{3})*(,\d+)?)\s*(pesos|ars|usd|\$)?/);

                if (matchNegativePrice) {
                    userData.presupuesto = "Demasiado alto"; // Marca que el precio es alto para el usuario
                    botResponse = `Entiendo perfectamente que la inversión inicial pueda parecerte considerable, ${userData.nombre || 'Estimado/a'}. Pero déjame decirte algo importante: si me confirmas ahora mismo que estás listo para dar este paso y llevar tu negocio al siguiente nivel con ${currentPlanOrService ? currentPlanOrService.nombre : 'nuestros servicios'}, **podría conseguirte un descuento especial que haría esta decisión mucho más accesible y atractiva. ¿Te gustaría que explore esa opción para ti, ${userData.nombre || 'Estimado/a'}?**`;
                    newState = 'offering_discount'; // Nuevo estado para gestionar el descuento
                } else if (matchPositivePrice) {
                    botResponse = `¡Excelente, ${userData.nombre || 'Estimado/a'}! Me alegra que veas el valor en esta inversión. Para que podamos coordinar una reunión y hablar más a fondo sobre cómo Solutions Ads puede impulsar tu negocio, ¿prefieres que te contactemos por teléfono o por WhatsApp? Así te aseguras de elegir el método que te sea más cómodo.`;
                    newState = 'asking_contact_method';
                } else if (matchNumericBudget) {
                    let rawAmount = parseFloat(matchNumericBudget[1].replace(/\./g, '').replace(/,/g, '.')); // Manejar puntos y comas
                    let currencyUnit = (matchNumericBudget[4] || '').toLowerCase();
                    let amountInUsd;

                    if (currencyUnit === 'usd' || (currencyUnit === '$' && rawAmount < 1000)) { // Asumimos USD si dice USD o $ y el número es pequeño (para evitar confundir $1000 ARS con $1000 USD)
                        amountInUsd = rawAmount;
                    } else { // Asumimos ARS por defecto o si es un número grande con $
                        amountInUsd = rawAmount / DOLAR_BLUE_COTIZACION;
                        currencyUnit = 'ARS'; // Para mostrar en la respuesta
                    }

                    userData.presupuesto = `${rawAmount} ${currencyUnit.toUpperCase()} (~${amountInUsd.toFixed(2)} USD)`;

                    let suggestedPlanOrService = null;
                    // Los precios de los planes están en USD, así que comparamos directamente con amountInUsd
                    if (amountInUsd >= 900) { // Presupuesto para Expertos
                        suggestedPlanOrService = solutionsAdsInfo.planes.expertos;
                    } else if (amountInUsd >= 450) { // Presupuesto para Empresas
                        suggestedPlanOrService = solutionsAdsInfo.planes.empresas;
                    } else if (amountInUsd >= 200) { // Presupuesto para Standard o Servicios individuales
                        suggestedPlanOrService = solutionsAdsInfo.planes.standard;
                    } else {
                        suggestedPlanOrService = null; // Demasiado bajo para los planes principales
                    }

                    if (suggestedPlanOrService) {
                        botResponse = `Entiendo, ${userData.nombre || 'Estimado/a'}, tu presupuesto de aproximadamente ${rawAmount} ${currencyUnit.toUpperCase()} (${amountInUsd.toFixed(2)} USD) es un excelente punto de partida. Considerando eso, creo que el **${suggestedPlanOrService.nombre}** podría ser una opción muy interesante para ti. Su precio es de ${suggestedPlanOrService.precio}. ¿Te gustaría que te cuente más sobre cómo este plan se ajusta a tus necesidades y te ayuda a alcanzar tus objetivos?`;
                        userData.planSugerido = suggestedPlanOrService.nombre; // Actualiza el plan sugerido
                        newState = 'confirming_value_before_price'; // Volvemos al estado de confirmar valor para el nuevo plan
                    } else {
                        botResponse = `Comprendo tu presupuesto de ${rawAmount} ${currencyUnit.toUpperCase()} (${amountInUsd.toFixed(2)} USD). Nuestros planes y servicios inician desde ${solutionsAdsInfo.planes.standard.precio}. Sin embargo, estoy seguro de que podemos encontrar una solución que se adapte a tus necesidades. ¿Te gustaría que te contacte un especialista para explorar opciones personalizadas que se ajusten a tu presupuesto, ${userData.nombre || 'Estimado/a'}?`;
                        newState = 'asking_contact_method';
                    }
                }
                else {
                    botResponse = `Entiendo. Para avanzar, ¿el precio del ${currentPlanOrService ? currentPlanOrService.nombre : 'plan/servicio que te mencioné'} se alinea con lo que esperabas, o hay algo más que te gustaría considerar antes de tomar una decisión, ${userData.nombre || 'Estimado/a'}?`;
                }
            }
            // --- Lógica para ofrecer descuento ---
            else if (newState === 'offering_discount') {
                if (lowerCaseMessage.includes("si") || lowerCaseMessage.includes("me gustaria") || lowerCaseMessage.includes("a ver") || lowerCaseMessage.includes("interesa")) {
                    botResponse = `¡Excelente, ${userData.nombre || 'Estimado/a'}! Me encanta esa actitud. Permíteme hacer las gestiones internas para asegurarte la mejor propuesta. Para ello, y para que puedas aprovechar este beneficio exclusivo, ¿te gustaría que te contacte un especialista de nuestro equipo con esa oferta personalizada y coordinar los detalles, o prefieres que lo hagamos directamente por aquí? Así te aseguras de tener toda la información y tomar la mejor decisión para tu negocio.`;
                    newState = 'asking_contact_method'; // Pasa al estado de pedir contacto
                } else {
                    botResponse = `Entiendo. Si cambias de opinión o quieres explorar otras opciones, aquí estoy. ¿Hay algo más en lo que pueda ayudarte ahora, ${userData.nombre || 'Estimado/a'}?`;
                    newState = 'initial';
                }
            }
            // --- CIERRE DE VENTA (Ejemplo de Alex Dey: Cierre por Opción) ---
            else if (lowerCaseMessage.includes("agendar") || lowerCaseMessage.includes("cita") || lowerCaseMessage.includes("reunion") || lowerCaseMessage.includes("contactarme") || lowerCaseMessage.includes("hablar con un asesor")) {
                let namePart = userData.nombre ? `, ${userData.nombre}` : '';
                botResponse = `¡Excelente! Para que podamos coordinar una reunión y hablar más a fondo sobre cómo Solutions Ads puede impulsar tu negocio${namePart}, ¿prefieres que te contactemos por teléfono o por WhatsApp? Así te aseguras de elegir el método que te sea más cómodo.`;
                newState = 'asking_contact_method';
            }
            else if (newState === 'asking_contact_method') {
                if (lowerCaseMessage.includes("whatsapp")) {
                    botResponse = `¡Perfecto! El WhatsApp es muy práctico. Para poder agendarte, ¿me podrías proporcionar tu número de WhatsApp y tu email, ${userData.nombre || 'Estimado/a'}? Es una forma segura de asegurarnos de que la comunicación fluya sin problemas y no perdamos ningún detalle importante.`;
                    newState = 'waiting_for_whatsapp_email';
                    userData.canalContacto = "WhatsApp";
                } else if (lowerCaseMessage.includes("telefono") || lowerCaseMessage.includes("llamada")) {
                    botResponse = `¡Claro! Una llamada es ideal para resolver dudas al instante. Para poder agendarla, ¿me podrías proporcionar tu número de teléfono y tu email, ${userData.nombre || 'Estimado/a'}? Así podemos confirmar los detalles y asegurarnos de que tengas toda la información necesaria.`;
                    newState = 'waiting_for_whatsapp_email';
                    userData.canalContacto = "Teléfono";
                } else {
                    botResponse = `No te entendí bien, ${userData.nombre || 'Estimado/a'}. ¿Prefieres que te contacte por WhatsApp o por teléfono para agendar la reunión?`;
                }
            }
            else if (newState === 'waiting_for_whatsapp_email') {
                const phoneMatch = userMessage.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}/);
                const emailMatch = userMessage.match(/[\w.-]+@([\w-]+\.)+[\w-]{2,4}/);

                let capturedPhone = phoneMatch ? phoneMatch[0].replace(/\s|-|\(|\)/g, '') : null;
                let capturedEmail = emailMatch ? emailMatch[0] : null;

                if (capturedPhone) {
                    userData.whatsapp = capturedPhone; // Asumimos que es WhatsApp si el canal elegido es WhatsApp
                    // Si el usuario da un teléfono y el canal elegido no era WhatsApp, lo seteamos igual por si acaso
                    if (!userData.canalContacto || userData.canalContacto === "Teléfono") {
                        userData.whatsapp = capturedPhone; // Usamos whatsapp para almacenar el número, puede ser de teléfono también
                    }
                }
                if (capturedEmail) {
                    userData.email = capturedEmail;
                }

                if (userData.whatsapp && userData.email) {
                    botResponse = `¡Excelente, ${userData.nombre || 'Estimado/a'}! He registrado tu número ${userData.whatsapp} y tu email ${userData.email}. En breve uno de nuestros especialistas se pondrá en contacto contigo para coordinar los detalles de tu reunión. ¿Hay algo más en lo que pueda ayudarte mientras tanto o has tomado ya la mejor decisión para tu negocio?`;
                    newState = 'initial'; // Reinicia el estado después de capturar la información
                    sendDataToGoogleSheet(); // <--- LLAMADA PARA ENVIAR LOS DATOS A GOOGLE SHEETS
                } else if (userData.whatsapp && !userData.email) {
                    botResponse = `Genial, tengo tu número ${userData.whatsapp}. Solo me faltaría tu email para que uno de nuestros especialistas pueda enviarte la confirmación y cualquier detalle adicional. ¿Me lo podrías proporcionar, ${userData.nombre || 'Estimado/a'}?`;
                } else if (!userData.whatsapp && userData.email) {
                    botResponse = `Perfecto, tengo tu email ${userData.email}. Solo me faltaría tu número de teléfono o WhatsApp para coordinar la reunión. ¿Me lo podrías dar, ${userData.nombre || 'Estimado/a'}?`;
                } else {
                    botResponse = `Para poder agendar la reunión y asegurarnos de que tengas toda la información, necesito tanto tu número de ${userData.canalContacto || 'teléfono/WhatsApp'} como tu email. ¿Me los podrías escribir, ${userData.nombre || 'Estimado/a'}?`;
                }
            }
            // Manejo de la pregunta inicial si el usuario solo pregunta por "costos" o "precios" directamente
            else if (lowerCaseMessage.includes("costos") || lowerCaseMessage.includes("precios")) {
                botResponse = "Entiendo, buscas información sobre costos. Para poder orientarte mejor, ¿cuál de nuestros planes o servicios te llamó la atención, o tienes algún presupuesto en mente?";
                newState = 'asking_for_cost_details_or_budget'; // Nuevo estado
            }
            else if (lowerCaseMessage.includes("servicios") || lowerCaseMessage.includes("que ofrecen") || lowerCaseMessage.includes("planes")) {
                const hasPlanes = lowerCaseMessage.includes("planes");
                const hasServicios = lowerCaseMessage.includes("servicios") || lowerCaseMessage.includes("que ofrecen");

                if (hasPlanes && hasServicios) {
                    botResponse = "Comprendo tu interés en Planes y Servicios. ¿Te gustaría empezar con los Planes o los Servicios?";
                    newState = 'asking_plan_service_preference';
                } else if (hasPlanes) {
                    botResponse = `Claro, con gusto te guío sobre nuestros Planes: ${solutionsAdsInfo.planes.standard.nombre}, ${solutionsAdsInfo.planes.empresas.nombre} y ${solutionsAdsInfo.planes.expertos.nombre}. ¿Cuál te gustaría conocer en más detalle?`;
                    newState = 'asking_for_plan_type';
                } else if (hasServicios) {
                    botResponse = `Excelente, te comento sobre nuestros Servicios: ${solutionsAdsInfo.servicios["diseño gráfico"].nombre}, ${solutionsAdsInfo.servicios["publicidad digital"].nombre}, ${solutionsAdsInfo.servicios["marketing estratégico"].nombre} y ${solutionsAdsInfo.servicios["mentorias en ventas"].nombre}. ¿Cuál te interesa más?`;
                    newState = 'asking_for_service_type';
                }
            }
            else if (lowerCaseMessage.includes("vender") || lowerCaseMessage.includes("más clientes") || lowerCaseMessage.includes("mas clientes")) {
                botResponse = "Si lo que estás buscando es vender más y captar clientes, necesitas una estrategia de publicidad digital y marketing digital con enfoque en conversión. ¿Te gustaría que lo veamos juntos? Podemos usar técnicas de venta probadas para maximizar tus resultados.";
            }
            else {
                // Respuesta por defecto si nada más coincide
                botResponse = "Estoy aquí para ayudarte con diseño, publicidad y ventas. ¿Podrías darme más detalles o hacer otra pregunta?";
            }
        }

        // Actualizar el estado global de la conversación
        conversationState = newState;

        // Mostrar la respuesta del bot
        agregarMensaje(botResponse, "bot");
    }

    // --- Event Listeners para el Input y Botón de Enviar ---
    chatbotSendButton.addEventListener("click", () => {
        const userMessage = chatbotInput.value.trim();
        if (userMessage) {
            agregarMensaje(userMessage, "user");
            chatbotInput.value = ""; // Limpiar el input
            processUserMessageLocally(userMessage); // Procesar el mensaje
        }
    });

    chatbotInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            chatbotSendButton.click(); // Simular clic en el botón de enviar
        }
    });
});