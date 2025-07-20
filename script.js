// solutions/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos para el FORMULARIO SUPERIOR
    const registrationFormTop = document.getElementById('downloadForm');
    const sendCodeBtnTop = document.getElementById('sendCodeBtn');
    const verificationCodeInputTop = document.getElementById('verificationCode'); // Obtener directamente el input del código
    const verificationCodeGroupTop = registrationFormTop.querySelector('.verification-code-group');
    const verifyCodeBtnTop = document.getElementById('verifyCodeBtn');
    const statusMessageTop = registrationFormTop.querySelector('.form-message');
    const downloadBtnTop = document.getElementById('downloadBtn');
    const nameInputTop = document.getElementById('name');
    const emailInputTop = document.getElementById('email');
    const phoneInputTop = document.getElementById('phone');


    // Referencias a los elementos para el FORMULARIO INFERIOR
    const registrationFormBottom = document.getElementById('downloadFormBottom');
    const sendCodeBtnBottom = document.getElementById('sendCodeBtnBottom');
    const verificationCodeInputBottom = document.getElementById('verificationCodeBottom'); // Obtener directamente el input del código
    const verificationCodeGroupBottom = registrationFormBottom.querySelector('.verification-code-group-bottom');
    const verifyCodeBtnBottom = document.getElementById('verifyCodeBtnBottom');
    const statusMessageBottom = registrationFormBottom.querySelector('.form-message');
    const downloadBtnBottom = document.getElementById('downloadBtnBottom');
    const nameInputBottom = document.getElementById('nameBottom');
    const emailInputBottom = document.getElementById('emailBottom');
    const phoneInputBottom = document.getElementById('phoneBottom');


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
    async function handleSendCode(formType, nameInput, emailInput, phoneInput, messageElement, verificationGroupElement, sendBtnElement, downloadBtnElement) {
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

        sendBtnElement.disabled = true; // Deshabilitar botón para evitar múltiples envíos
        downloadBtnElement.disabled = true; // Asegurar que el botón de descarga está deshabilitado
        downloadBtnElement.style.cursor = 'not-allowed';

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
                sendBtnElement.style.display = 'block'; // Mostrar de nuevo si hubo error
            }
        } catch (error) {
            console.error('Error al solicitar código:', error);
            showStatus(messageElement, 'Ocurrió un error de red. Intenta de nuevo más tarde.', true);
            sendBtnElement.style.display = 'block'; // Mostrar de nuevo si hubo error
        } finally {
            hideStatus(messageElement);
            sendBtnElement.disabled = false; // Re-habilitar después del intento
        }
    }

    // Función genérica para manejar la verificación del código
    async function handleVerifyCode(formType, codeInput, messageElement, downloadBtnElement, verificationGroupElement, sendBtnElement, formInputs) {
        const userInputCode = codeInput.value.trim();

        if (!userInputCode) {
            showStatus(messageElement, 'Por favor, ingresa el código de verificación.', true);
            hideStatus(messageElement);
            return;
        }

        showStatus(messageElement, 'Verificando código...');
        messageElement.style.color = 'orange';

        // Deshabilitar botones de verificación para ambos formularios mientras se procesa
        verifyCodeBtnTop.disabled = true;
        verifyCodeBtnBottom.disabled = true;

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
                
                verificationGroupElement.style.display = 'none'; // Ocultar campo de código
                sendBtnElement.style.display = 'none'; // También ocultar el botón "Enviar Código" si ya se verificó

                // Deshabilitar los campos de entrada del formulario para evitar cambios
                formInputs.forEach(input => input.disabled = true);
                // Asegúrate de que el botón de descarga habilitado no se deshabilite
                downloadBtnElement.disabled = false;

            } else {
                showStatus(messageElement, data.message || 'Código incorrecto o expirado.', true);
                downloadBtnElement.disabled = true; // Mantener deshabilitado si falla
            }
        } catch (error) {
            console.error('Error al verificar código:', error);
            showStatus(messageElement, 'Ocurrió un error de red al verificar. Intenta de nuevo más tarde.', true);
            downloadBtnElement.disabled = true; // Mantener deshabilitado si hay error
        } finally {
            hideStatus(messageElement);
            verifyCodeBtnTop.disabled = false; // Re-habilitar
            verifyCodeBtnBottom.disabled = false; // Re-habilitar
        }
    }

    // Función genérica para manejar la descarga del PDF y resetear el formulario
    function handleDownloadAndReset(messageElement, downloadBtnElement, sendBtnElement, verificationGroupElement, formElement, verificationCodeInput, formInputs) {
        // Redirige al PDF
        window.location.href = './Guia-Técnicas-Cierres-Venta.pdf'; // <<-- ¡AJUSTA ESTA RUTA A TU PDF!
        showStatus(messageElement, '¡Descarga iniciada! Revisa tus descargas.', false);

        // Resetear el formulario y UI
        formElement.reset();
        sendBtnElement.style.display = 'block'; // Mostrar botón de enviar código
        verificationGroupElement.style.display = 'none'; // Ocultar campo de código
        downloadBtnElement.disabled = true; // Deshabilitar botón de descarga
        downloadBtnElement.style.cursor = 'not-allowed';
        verificationCodeInput.value = ''; // Limpiar el campo del código

        // Re-habilitar todos los campos de entrada del formulario
        formInputs.forEach(input => input.disabled = false);

        // Limpiar estado temporal
        if (formElement.id === 'downloadForm') {
            currentPhoneNumber.top = '';
            currentName.top = '';
            currentEmail.top = '';
        } else if (formElement.id === 'downloadFormBottom') {
            currentPhoneNumber.bottom = '';
            currentName.bottom = '';
            currentEmail.bottom = '';
        }
    }

    // Configurar Event Listeners para el FORMULARIO SUPERIOR
    if (registrationFormTop) {
        const formInputsTop = [nameInputTop, emailInputTop, phoneInputTop]; // Lista de inputs para este form

        sendCodeBtnTop.addEventListener('click', () => {
            handleSendCode('top', nameInputTop, emailInputTop, phoneInputTop, statusMessageTop, verificationCodeGroupTop, sendCodeBtnTop, downloadBtnTop);
        });

        verifyCodeBtnTop.addEventListener('click', () => {
            handleVerifyCode('top', verificationCodeInputTop, statusMessageTop, downloadBtnTop, verificationCodeGroupTop, sendCodeBtnTop, formInputsTop);
        });

        downloadBtnTop.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir cualquier acción por defecto
            handleDownloadAndReset(statusMessageTop, downloadBtnTop, sendCodeBtnTop, verificationCodeGroupTop, registrationFormTop, verificationCodeInputTop, formInputsTop);
        });
    }

    // Configurar Event Listeners para el FORMULARIO INFERIOR
    if (registrationFormBottom) {
        const formInputsBottom = [nameInputBottom, emailInputBottom, phoneInputBottom]; // Lista de inputs para este form

        sendCodeBtnBottom.addEventListener('click', () => {
            handleSendCode('bottom', nameInputBottom, emailInputBottom, phoneInputBottom, statusMessageBottom, verificationCodeGroupBottom, sendCodeBtnBottom, downloadBtnBottom);
        });

        verifyCodeBtnBottom.addEventListener('click', () => {
            handleVerifyCode('bottom', verificationCodeInputBottom, statusMessageBottom, downloadBtnBottom, verificationCodeGroupBottom, sendCodeBtnBottom, formInputsBottom);
        });

        downloadBtnBottom.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir cualquier acción por defecto
            handleDownloadAndReset(statusMessageBottom, downloadBtnBottom, sendCodeBtnBottom, verificationCodeGroupBottom, registrationFormBottom, verificationCodeInputBottom, formInputsBottom);
        });
    }
});