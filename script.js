// solutions/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos para el FORMULARIO SUPERIOR
    const registrationFormTop = document.getElementById('downloadForm'); // <<-- CORREGIDO ID
    const sendCodeBtnTop = document.getElementById('sendCodeBtn');
    const verificationCodeGroupTop = registrationFormTop.querySelector('.verification-code-group');
    const verifyCodeBtnTop = document.getElementById('verifyCodeBtn');
    const statusMessageTop = registrationFormTop.querySelector('.form-message'); // Nuevo: Mensaje específico para cada form
    const downloadBtnTop = document.getElementById('downloadBtn');

    // Referencias a los elementos para el FORMULARIO INFERIOR
    const registrationFormBottom = document.getElementById('downloadFormBottom');
    const sendCodeBtnBottom = document.getElementById('sendCodeBtnBottom');
    const verificationCodeGroupBottom = registrationFormBottom.querySelector('.verification-code-group-bottom'); // Usar clase específica
    const verifyCodeBtnBottom = document.getElementById('verifyCodeBtnBottom');
    const statusMessageBottom = registrationFormBottom.querySelector('.form-message'); // Nuevo: Mensaje específico para cada form
    const downloadBtnBottom = document.getElementById('downloadBtnBottom');

    // Estado global para cada formulario
    let currentPhoneNumber = { top: '', bottom: '' };
    let currentName = { top: '', bottom: '' };
    let currentEmail = { top: '', bottom: '' };

    // Función para mostrar mensajes de estado para un formulario específico
    function showStatus(messageElement, message, isError = false) {
        messageElement.textContent = message;
        messageElement.style.color = isError ? 'red' : 'green';
        messageElement.style.display = 'block';
    }

    // Ocultar mensaje de estado después de un tiempo
    function hideStatus(messageElement) {
        setTimeout(() => {
            messageElement.style.display = 'none';
            messageElement.textContent = '';
        }, 5000); // Ocultar después de 5 segundos
    }

    // Función de validación de email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Función genérica para manejar el envío del código
    async function handleSendCode(formType, nameInput, emailInput, phoneInput, messageElement, verificationGroupElement, sendBtnElement, verifyBtnElement) {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        let phoneNumber = phoneInput.value.trim();

        if (!name || !email || !phoneNumber) {
            showStatus(messageElement, 'Por favor, completa todos los campos.', true);
            hideStatus(messageElement);
            return;
        }

        if (!isValidEmail(email)) {
            showStatus(messageElement, 'Por favor, ingresa una dirección de correo electrónico válida (ej. usuario@dominio.com).', true);
            hideStatus(messageElement);
            return;
        }

        if (!phoneNumber.startsWith('+') || phoneNumber.replace(/\D/g, '').length < 10) {
            showStatus(messageElement, 'Formato de número de teléfono inválido. Debe incluir código de país (ej. +54911...).', true);
            hideStatus(messageElement);
            return;
        }

        currentPhoneNumber[formType] = phoneNumber;
        currentName[formType] = name;
        currentEmail[formType] = email;

        showStatus(messageElement, 'Enviando código de verificación...');
        messageElement.style.color = 'orange';

        // Deshabilitar botón para evitar múltiples envíos
        sendBtnElement.disabled = true;

        try {
            const response = await fetch('/.netlify/functions/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: currentPhoneNumber[formType],
                    name: currentName[formType],
                    email: currentEmail[formType]
                })
            });

            const data = await response.json();

            if (response.ok) {
                showStatus(messageElement, data.message || 'Código enviado con éxito. Por favor, verifica tu teléfono.');
                verificationGroupElement.style.display = 'block'; // Mostrar campo de código
                sendBtnElement.style.display = 'none'; // Ocultar botón de enviar código
            } else {
                showStatus(messageElement, data.message || 'Error al enviar el código.', true);
            }
        } catch (error) {
            console.error('Error al solicitar código:', error);
            showStatus(messageElement, 'Ocurrió un error de red. Intenta de nuevo más tarde.', true);
        } finally {
            hideStatus(messageElement);
            sendBtnElement.disabled = false; // Re-habilitar si es necesario, o mantener deshabilitado
        }
    }

    // Función genérica para manejar la verificación del código
    async function handleVerifyCode(formType, codeInput, messageElement, downloadBtnElement, verificationGroupElement) {
        const userInputCode = codeInput.value.trim();

        if (!userInputCode) {
            showStatus(messageElement, 'Por favor, ingresa el código de verificación.', true);
            hideStatus(messageElement);
            return;
        }

        showStatus(messageElement, 'Verificando código...');
        messageElement.style.color = 'orange';

        // Deshabilitar botón para evitar múltiples envíos
        verifyCodeBtnTop.disabled = true; // Asume que este botón es el que se presiona
        verifyCodeBtnBottom.disabled = true; // Deshabilita ambos por seguridad

        try {
            const response = await fetch('/.netlify/functions/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: currentPhoneNumber[formType],
                    userInputCode: userInputCode,
                    name: currentName[formType],
                    email: currentEmail[formType]
                })
            });

            const data = await response.json();

            if (response.ok) {
                showStatus(messageElement, data.message || 'Código validado. ¡Guía lista para descargar!');
                downloadBtnElement.disabled = false; // Habilitar botón de descarga
                downloadBtnElement.style.cursor = 'pointer'; // Cambiar cursor para indicar que es clickeable
                // Opcional: Ocultar la sección de verificación después de éxito
                verificationGroupElement.style.display = 'none';
                
                // Si el usuario hace clic en el botón de descarga, podríamos redirigir aquí.
                // Por ejemplo: downloadBtnElement.onclick = () => window.location.href = '/ruta-a-tu-guia.pdf';

            } else {
                showStatus(messageElement, data.message || 'Código incorrecto o expirado.', true);
            }
        } catch (error) {
            console.error('Error al verificar código:', error);
            showStatus(messageElement, 'Ocurrió un error de red al verificar. Intenta de nuevo más tarde.', true);
        } finally {
            hideStatus(messageElement);
            verifyCodeBtnTop.disabled = false; // Re-habilitar si es necesario
            verifyCodeBtnBottom.disabled = false; // Re-habilitar si es necesario
        }
    }

    // Configurar Event Listeners para el FORMULARIO SUPERIOR
    if (registrationFormTop) { // Asegurarse de que el elemento existe
        sendCodeBtnTop.addEventListener('click', () => {
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            handleSendCode('top', nameInput, emailInput, phoneInput, statusMessageTop, verificationCodeGroupTop, sendCodeBtnTop, verifyCodeBtnTop);
        });

        verifyCodeBtnTop.addEventListener('click', () => {
            const codeInput = document.getElementById('verificationCode');
            handleVerifyCode('top', codeInput, statusMessageTop, downloadBtnTop, verificationCodeGroupTop);
        });

        // Manejar el submit final del formulario (solo si el botón de descarga está habilitado)
        registrationFormTop.addEventListener('submit', (e) => {
            if (downloadBtnTop.disabled) {
                e.preventDefault(); // Evitar submit si no está validado
                showStatus(statusMessageTop, 'Por favor, valida tu número primero.', true);
                hideStatus(statusMessageTop);
            }
            // Si no está deshabilitado, el formulario se enviará normalmente.
            // Aquí podrías agregar la lógica para la descarga directa del PDF.
            else {
                e.preventDefault(); // Prevenir el envío real del formulario si quieres manejar la descarga con JS
                window.location.href = './Guia-Técnicas-Cierres-Venta.pdf'; // <<-- ¡AJUSTA ESTA RUTA A TU PDF!
                showStatus(statusMessageTop, '¡Descarga iniciada! Revisa tus descargas.', false);
                // Opcional: Resetear formulario después de la descarga
                registrationFormTop.reset();
                sendCodeBtnTop.style.display = 'block'; // Mostrar botón de enviar código
                verificationCodeGroupTop.style.display = 'none'; // Ocultar campo de código
                downloadBtnTop.disabled = true; // Deshabilitar botón de descarga
                downloadBtnTop.style.cursor = 'not-allowed';
            }
        });
    }

    // Configurar Event Listeners para el FORMULARIO INFERIOR
    if (registrationFormBottom) { // Asegurarse de que el elemento existe
        sendCodeBtnBottom.addEventListener('click', () => {
            const nameInput = document.getElementById('nameBottom');
            const emailInput = document.getElementById('emailBottom');
            const phoneInput = document.getElementById('phoneBottom');
            handleSendCode('bottom', nameInput, emailInput, phoneInput, statusMessageBottom, verificationCodeGroupBottom, sendCodeBtnBottom, verifyCodeBtnBottom);
        });

        verifyCodeBtnBottom.addEventListener('click', () => {
            const codeInput = document.getElementById('verificationCodeBottom');
            handleVerifyCode('bottom', codeInput, statusMessageBottom, downloadBtnBottom, verificationCodeGroupBottom);
        });

        // Manejar el submit final del formulario (solo si el botón de descarga está habilitado)
        registrationFormBottom.addEventListener('submit', (e) => {
            if (downloadBtnBottom.disabled) {
                e.preventDefault(); // Evitar submit si no está validado
                showStatus(statusMessageBottom, 'Por favor, valida tu número primero.', true);
                hideStatus(statusMessageBottom);
            }
            // Si no está deshabilitado, el formulario se enviará normalmente.
            else {
                e.preventDefault(); // Prevenir el envío real del formulario si quieres manejar la descarga con JS
                window.location.href = './Guia-Técnicas-Cierres-Venta.pdf'; // <<-- ¡AJUSTA ESTA RUTA A TU PDF!
                showStatus(statusMessageBottom, '¡Descarga iniciada! Revisa tus descargas.', false);
                // Opcional: Resetear formulario después de la descarga
                registrationFormBottom.reset();
                sendCodeBtnBottom.style.display = 'block'; // Mostrar botón de enviar código
                verificationCodeGroupBottom.style.display = 'none'; // Ocultar campo de código
                downloadBtnBottom.disabled = true; // Deshabilitar botón de descarga
                downloadBtnBottom.style.cursor = 'not-allowed';
            }
        });
    }
});