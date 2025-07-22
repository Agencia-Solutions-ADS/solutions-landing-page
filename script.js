// solutions/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos para el FORMULARIO SUPERIOR
    const registrationFormTop = document.getElementById('downloadForm');
    const sendCodeBtnTop = document.getElementById('sendCodeBtn');
    const verificationCodeInputTop = document.getElementById('verificationCode');
    const verificationCodeGroupTop = registrationFormTop.querySelector('.verification-code-group');
    const verifyCodeBtnTop = document.getElementById('verifyCodeBtn');
    const statusMessageTop = registrationFormTop.querySelector('.form-message');
    const downloadBtnTop = document.getElementById('downloadBtn');
    const nameInputTop = document.getElementById('name');
    const emailInputTop = document.getElementById('email');
    const phoneInputTop = document.getElementById('phone');

    // Referencias a los elementos del temporizador y reenvío para el FORMULARIO SUPERIOR
    const countdownTimerElementTop = document.getElementById('countdownTimerTop');
    const resendCodeBtnTop = document.getElementById('resendCodeBtnTop');


    // Referencias a los elementos para el FORMULARIO INFERIOR
    const registrationFormBottom = document.getElementById('downloadFormBottom');
    const sendCodeBtnBottom = document.getElementById('sendCodeBtnBottom');
    const verificationCodeInputBottom = document.getElementById('verificationCodeBottom');
    const verificationCodeGroupBottom = registrationFormBottom.querySelector('.verification-code-group-bottom');
    const verifyCodeBtnBottom = document.getElementById('verifyCodeBtnBottom');
    const statusMessageBottom = registrationFormBottom.querySelector('.form-message');
    const downloadBtnBottom = document.getElementById('downloadBtnBottom');
    const nameInputBottom = document.getElementById('nameBottom');
    const emailInputBottom = document.getElementById('emailBottom');
    const phoneInputBottom = document.getElementById('phoneBottom');

    // Referencias a los elementos del temporizador y reenvío para el FORMULARIO INFERIOR
    const countdownTimerElementBottom = document.getElementById('countdownTimerBottom');
    const resendCodeBtnBottom = document.getElementById('resendCodeBtnBottom');


    // Estado global para cada formulario
    let currentPhoneNumber = { top: '', bottom: '' };
    let currentName = { top: '', bottom: '' };
    let currentEmail = { top: '', bottom: '' };

    // Variables para el contador
    let countdownIntervalTop;
    let countdownIntervalBottom;
    const RESEND_TIMER_SECONDS = 300; // 5 minutos * 60 segundos


    // **************************************************************
    // INICIO: INTEGRACIÓN DE intl-tel-input (NUEVO)
    // **************************************************************

    // Inicializar intl-tel-input para el formulario superior
    const itiTop = window.intlTelInput(phoneInputTop, {
        initialCountry: "ar", // Establece el país inicial (ej. "ar" para Argentina)
        preferredCountries: ["ar", "us", "es", "mx", "cl", "co", "pe"], // Países preferidos en la parte superior del desplegable
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js" // Necesario para la validación y formateo
    });

    // Inicializar intl-tel-input para el formulario inferior
    const itiBottom = window.intlTelInput(phoneInputBottom, {
        initialCountry: "ar", // Establece el país inicial
        preferredCountries: ["ar", "us", "es", "mx", "cl", "co", "pe"], // Países preferidos
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"
    });

    // **************************************************************
    // FIN: INTEGRACIÓN DE intl-tel-input (NUEVO)
    // **************************************************************


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

    // Función para iniciar el contador y manejar el botón de reenvío
    function startCountdown(formType, timerElement, resendBtnElement, sendBtnElement) {
        let timeLeft = RESEND_TIMER_SECONDS;

        // Limpiar cualquier intervalo previo para evitar múltiples contadores
        if (formType === 'top' && countdownIntervalTop) {
            clearInterval(countdownIntervalTop);
        } else if (formType === 'bottom' && countdownIntervalBottom) {
            clearInterval(countdownIntervalBottom);
        }

        resendBtnElement.style.display = 'none'; // Asegurarse de que el botón de reenvío esté oculto al inicio
        resendBtnElement.disabled = true;

        // Mostrar el elemento del temporizador
        timerElement.style.display = 'inline'; // O 'block' si prefieres que ocupe toda la línea

        const intervalId = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `Puedes reenviar el código en ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(intervalId);
                timerElement.textContent = ''; // Limpiar el texto del temporizador
                timerElement.style.display = 'none'; // Ocultar el temporizador
                resendBtnElement.style.display = 'block'; // Mostrar el botón de reenvío
                resendBtnElement.disabled = false; // Habilitar el botón de reenvío
                sendBtnElement.style.display = 'none'; // Asegurarse de que el botón original de "Enviar Código" esté oculto
            }
            timeLeft--;
        }, 1000);

        if (formType === 'top') {
            countdownIntervalTop = intervalId;
        } else {
            countdownIntervalBottom = intervalId;
        }
    }


    // Función genérica para manejar el envío del código
    async function handleSendCode(formType, nameInput, emailInput, phoneInput, messageElement, verificationGroupElement, sendBtnElement, downloadBtnElement) {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        // **************************************************************
        // CAMBIO CLAVE: Obtener el número de teléfono formateado por intl-tel-input
        // **************************************************************
        let phoneNumber;
        let itiInstance;

        if (formType === 'top') {
            itiInstance = itiTop;
        } else {
            itiInstance = itiBottom;
        }

        // Obtener el número en formato E.164 (ej: +541112345678)
        phoneNumber = itiInstance.getNumber(intlTelInputUtils.numberFormat.E164);

        // Validar si el número es válido según intl-tel-input
        if (!itiInstance.isValidNumber()) {
            // Puedes obtener el tipo de error para dar un mensaje más específico si quieres
            // const errorCode = itiInstance.getValidationError();
            showStatus(messageElement, 'Número de teléfono no válido o incompleto para el país seleccionado.', true);
            hideStatus(messageElement);
            return;
        }
        // **************************************************************
        // FIN CAMBIO CLAVE
        // **************************************************************


        if (!name || !email || !phoneNumber) { // phoneNumber ahora ya incluye validación de intl-tel-input
            showStatus(messageElement, 'Por favor, completa todos los campos.', true);
            hideStatus(messageElement);
            return;
        }

        if (!isValidEmail(email)) {
            showStatus(messageElement, 'Por favor, ingresa una dirección de correo electrónico válida (ej. usuario@dominio.com).', true);
            hideStatus(messageElement);
            return;
        }

        // La validación manual de phoneNumber.startsWith('+') y length < 10
        // se vuelve redundante y puede eliminarse o modificarse si confías en intl-tel-input.
        // La comentaré, pero puedes borrarla si lo deseas.
        // if (!phoneNumber.startsWith('+') || phoneNumber.replace(/\D/g, '').length < 10) {
        //     showStatus(messageElement, 'Formato de número de teléfono inválido. Debe incluir código de país (ej. +54911...).', true);
        //     hideStatus(messageElement);
        //     return;
        // }


        // Almacenar los datos del usuario en las variables globales específicas del formulario
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
                    phoneNumber: currentPhoneNumber[formType], // Usar el valor almacenado
                    name: currentName[formType],              // Usar el valor almacenado
                    email: currentEmail[formType]             // Usar el valor almacenado
                })
            });

            const data = await response.json();

            if (response.ok) {
                showStatus(messageElement, data.message || 'Código enviado con éxito. Por favor, verifica tu teléfono.');
                verificationGroupElement.style.display = 'block'; // Mostrar campo de código
                sendBtnElement.style.display = 'none'; // Ocultar botón de enviar código

                // INICIAR EL CONTADOR
                if (formType === 'top') {
                    startCountdown('top', countdownTimerElementTop, resendCodeBtnTop, sendCodeBtnTop);
                } else {
                    startCountdown('bottom', countdownTimerElementBottom, resendCodeBtnBottom, sendCodeBtnBottom);
                }

            } else {
                showStatus(messageElement, data.message || 'Error al enviar el código.', true);
                sendBtnElement.style.display = 'block'; // Mostrar de nuevo si hubo error
                // También ocultar el contador si hay un error y no se envía el código
                if (formType === 'top') {
                    if (countdownIntervalTop) clearInterval(countdownIntervalTop);
                    countdownTimerElementTop.textContent = '';
                    countdownTimerElementTop.style.display = 'none';
                    resendCodeBtnTop.style.display = 'none';
                    resendCodeBtnTop.disabled = true;
                } else {
                    if (countdownIntervalBottom) clearInterval(countdownIntervalBottom);
                    countdownTimerElementBottom.textContent = '';
                    countdownTimerElementBottom.style.display = 'none';
                    resendCodeBtnBottom.style.display = 'none';
                    resendCodeBtnBottom.disabled = true;
                }
            }
        } catch (error) {
            console.error('Error al solicitar código:', error);
            showStatus(messageElement, 'Ocurrió un error de red. Intenta de nuevo más tarde.', true);
            sendBtnElement.style.display = 'block'; // Mostrar de nuevo si hubo error
            // También ocultar el contador si hay un error
            if (formType === 'top') {
                if (countdownIntervalTop) clearInterval(countdownIntervalTop);
                countdownTimerElementTop.textContent = '';
                countdownTimerElementTop.style.display = 'none';
                resendCodeBtnTop.style.display = 'none';
                resendCodeBtnTop.disabled = true;
            } else {
                if (countdownIntervalBottom) clearInterval(countdownIntervalBottom);
                countdownTimerElementBottom.textContent = '';
                countdownTimerElementBottom.style.display = 'none';
                resendCodeBtnBottom.style.display = 'none';
                resendCodeBtnBottom.disabled = true;
            }
        } finally {
            hideStatus(messageElement);
            sendBtnElement.disabled = false; // Re-habilitar después del intento, si no se ocultó previamente
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
                    phoneNumber: currentPhoneNumber[formType], // Usar el valor almacenado
                    userInputCode: userInputCode,
                    name: currentName[formType],              // Usar el valor almacenado
                    email: currentEmail[formType]             // Usar el valor almacenado
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

                // DETENER Y OCULTAR EL CONTADOR
                if (formType === 'top') {
                    if (countdownIntervalTop) clearInterval(countdownIntervalTop);
                    countdownTimerElementTop.textContent = '';
                    countdownTimerElementTop.style.display = 'none';
                    resendCodeBtnTop.style.display = 'none';
                    resendCodeBtnTop.disabled = true;
                } else {
                    if (countdownIntervalBottom) clearInterval(countdownIntervalBottom);
                    countdownTimerElementBottom.textContent = '';
                    countdownTimerElementBottom.style.display = 'none';
                    resendCodeBtnBottom.style.display = 'none';
                    resendCodeBtnBottom.disabled = true;
                }

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
        // Redirige al PDF con la ruta y el nombre de archivo correctos
        window.location.href = '/static/tu-guia-de-ventas.pdf';
        showStatus(messageElement, '¡Descarga iniciada! Revisa tus descargas.', false);

        // Resetear el formulario y UI
        formElement.reset();
        sendBtnElement.style.display = 'block'; // Mostrar botón de enviar código
        verificationGroupElement.style.display = 'none'; // Ocultar campo de código
        downloadBtnElement.disabled = true; // Deshabilitar botón de descarga
        downloadBtnElement.style.cursor = 'not-allowed';
        verificationCodeInput.value = ''; // Limpiar el campo del código

        // Re-habilitar todos los campos de entrada del formulario, excepto el campo de teléfono
        formInputs.forEach(input => input.disabled = false);

        // Limpiar estado temporal
        if (formElement.id === 'downloadForm') {
            currentPhoneNumber.top = '';
            currentName.top = '';
            currentEmail.top = '';
            // Limpiar contador y ocultar elementos
            if (countdownIntervalTop) clearInterval(countdownIntervalTop);
            countdownTimerElementTop.textContent = '';
            countdownTimerElementTop.style.display = 'none';
            resendCodeBtnTop.style.display = 'none';
            resendCodeBtnTop.disabled = true;
            // IMPORTANTE: Asegúrate de que intl-tel-input se resetee si es necesario
            itiTop.setNumber(""); // Limpia el valor en la instancia de intl-tel-input
        } else if (formElement.id === 'downloadFormBottom') {
            currentPhoneNumber.bottom = '';
            currentName.bottom = '';
            currentEmail.bottom = '';
            // Limpiar contador y ocultar elementos
            if (countdownIntervalBottom) clearInterval(countdownIntervalBottom);
            countdownTimerElementBottom.textContent = '';
            countdownTimerElementBottom.style.display = 'none';
            resendCodeBtnBottom.style.display = 'none';
            resendCodeBtnBottom.disabled = true;
            // IMPORTANTE: Asegúrate de que intl-tel-input se resetee si es necesario
            itiBottom.setNumber(""); // Limpia el valor en la instancia de intl-tel-input
        }
    }

    // Configurar Event Listeners para el FORMULARIO SUPERIOR
    if (registrationFormTop) {
        const formInputsTop = [nameInputTop, emailInputTop, phoneInputTop, verificationCodeInputTop];

        sendCodeBtnTop.addEventListener('click', () => {
            handleSendCode('top', nameInputTop, emailInputTop, phoneInputTop, statusMessageTop, verificationCodeGroupTop, sendCodeBtnTop, downloadBtnTop);
        });

        verifyCodeBtnTop.addEventListener('click', () => {
            handleVerifyCode('top', verificationCodeInputTop, statusMessageTop, downloadBtnTop, verificationCodeGroupTop, sendCodeBtnTop, formInputsTop);
        });

        downloadBtnTop.addEventListener('click', (e) => {
            e.preventDefault();
            handleDownloadAndReset(statusMessageTop, downloadBtnTop, sendCodeBtnTop, verificationCodeGroupTop, registrationFormTop, verificationCodeInputTop, formInputsTop);
        });

        // Event listener para el botón de reenvío (superior)
        if (resendCodeBtnTop) {
            resendCodeBtnTop.addEventListener('click', () => {
                // CORRECCIÓN: Asegúrate de pasar 'downloadBtnTop' y no 'downloadBtnBtnTop'
                handleSendCode('top', nameInputTop, emailInputTop, phoneInputTop, statusMessageTop, verificationCodeGroupTop, sendCodeBtnTop, downloadBtnTop);
            });
        }
    }

    // Configurar Event Listeners para el FORMULARIO INFERIOR
    if (registrationFormBottom) {
        const formInputsBottom = [nameInputBottom, emailInputBottom, phoneInputBottom, verificationCodeInputBottom];

        sendCodeBtnBottom.addEventListener('click', () => {
            handleSendCode('bottom', nameInputBottom, emailInputBottom, phoneInputBottom, statusMessageBottom, verificationCodeGroupBottom, sendCodeBtnBottom, downloadBtnBottom);
        });

        verifyCodeBtnBottom.addEventListener('click', () => {
            handleVerifyCode('bottom', verificationCodeInputBottom, statusMessageBottom, downloadBtnBottom, verificationCodeGroupBottom, sendCodeBtnBottom, formInputsBottom);
        });

        downloadBtnBottom.addEventListener('click', (e) => {
            e.preventDefault();
            handleDownloadAndReset(statusMessageBottom, downloadBtnBottom, sendCodeBtnBottom, verificationCodeGroupBottom, registrationFormBottom, verificationCodeInputBottom, formInputsBottom);
        });

        // Event listener para el botón de reenvío (inferior)
        if (resendCodeBtnBottom) {
            resendCodeBtnBottom.addEventListener('click', () => {
                handleSendCode('bottom', nameInputBottom, emailInputBottom, phoneInputBottom, statusMessageBottom, verificationCodeGroupBottom, sendCodeBtnBottom, downloadBtnBottom);
            });
        }
    }
});