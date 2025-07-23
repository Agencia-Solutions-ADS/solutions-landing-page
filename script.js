// solutions/script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Variables y Lógica para Formularios de PDF (presentes en pdf-ventas.html) ---
    // Referencias a los elementos para el FORMULARIO SUPERIOR
    const registrationFormTop = document.getElementById('downloadForm');
    let itiTop; // Declarar aquí para que sea accesible en todo el scope de DOMContentLoaded

    if (registrationFormTop) { // Solo si estamos en pdf-ventas.html
        const sendCodeBtnTop = document.getElementById('sendCodeBtn');
        const verificationCodeInputTop = document.getElementById('verificationCode');
        const verificationCodeGroupTop = registrationFormTop.querySelector('.verification-code-group');
        const verifyCodeBtnTop = document.getElementById('verifyCodeBtn');
        const statusMessageTop = registrationFormTop.querySelector('.form-message');
        const downloadBtnTop = document.getElementById('downloadBtn');
        const nameInputTop = document.getElementById('name');
        const emailInputTop = document.getElementById('email');
        const phoneInputTop = document.getElementById('phone');
        const countdownTimerElementTop = document.getElementById('countdownTimerTop');
        const resendCodeBtnTop = document.getElementById('resendCodeBtnTop');

        // Inicializar intl-tel-input para el formulario superior
        itiTop = window.intlTelInput(phoneInputTop, {
            initialCountry: "ar",
            preferredCountries: ["ar", "us", "es", "mx", "cl", "co", "pe"],
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"
        });

        const formInputsTop = [nameInputTop, emailInputTop, phoneInputTop, verificationCodeInputTop];

        if (sendCodeBtnTop) {
            sendCodeBtnTop.addEventListener('click', () => {
                handleSendCode('top', nameInputTop, emailInputTop, phoneInputTop, statusMessageTop, verificationCodeGroupTop, sendCodeBtnTop, downloadBtnTop, itiTop, countdownTimerElementTop, resendCodeBtnTop);
            });
        }
        if (verifyCodeBtnTop) {
            verifyCodeBtnTop.addEventListener('click', () => {
                handleVerifyCode('top', verificationCodeInputTop, statusMessageTop, downloadBtnTop, verificationCodeGroupTop, sendCodeBtnTop, formInputsTop, countdownTimerElementTop, resendCodeBtnTop);
            });
        }
        if (downloadBtnTop) {
            downloadBtnTop.addEventListener('click', (e) => {
                e.preventDefault();
                handleDownloadAndReset(statusMessageTop, downloadBtnTop, sendCodeBtnTop, verificationCodeGroupTop, registrationFormTop, verificationCodeInputTop, formInputsTop, itiTop, countdownIntervalTop, countdownTimerElementTop, resendCodeBtnTop);
            });
        }
        if (resendCodeBtnTop) {
            resendCodeBtnTop.addEventListener('click', () => {
                handleSendCode('top', nameInputTop, emailInputTop, phoneInputTop, statusMessageTop, verificationCodeGroupTop, sendCodeBtnTop, downloadBtnTop, itiTop, countdownTimerElementTop, resendCodeBtnTop);
            });
        }
    }

    // Referencias a los elementos para el FORMULARIO INFERIOR
    const registrationFormBottom = document.getElementById('downloadFormBottom');
    let itiBottom; // Declarar aquí para que sea accesible en todo el scope de DOMContentLoaded

    if (registrationFormBottom) { // Solo si estamos en pdf-ventas.html
        const sendCodeBtnBottom = document.getElementById('sendCodeBtnBottom');
        const verificationCodeInputBottom = document.getElementById('verificationCodeBottom');
        const verificationCodeGroupBottom = registrationFormBottom.querySelector('.verification-code-group-bottom');
        const verifyCodeBtnBottom = document.getElementById('verifyCodeBtnBottom');
        const statusMessageBottom = registrationFormBottom.querySelector('.form-message');
        const downloadBtnBottom = document.getElementById('downloadBtnBottom');
        const nameInputBottom = document.getElementById('nameBottom');
        const emailInputBottom = document.getElementById('emailBottom');
        const phoneInputBottom = document.getElementById('phoneBottom');
        const countdownTimerElementBottom = document.getElementById('countdownTimerBottom');
        const resendCodeBtnBottom = document.getElementById('resendCodeBtnBottom');

        // Inicializar intl-tel-input para el formulario inferior
        itiBottom = window.intlTelInput(phoneInputBottom, {
            initialCountry: "ar",
            preferredCountries: ["ar", "us", "es", "mx", "cl", "co", "pe"],
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"
        });

        const formInputsBottom = [nameInputBottom, emailInputBottom, phoneInputBottom, verificationCodeInputBottom];

        if (sendCodeBtnBottom) {
            sendCodeBtnBottom.addEventListener('click', () => {
                handleSendCode('bottom', nameInputBottom, emailInputBottom, phoneInputBottom, statusMessageBottom, verificationCodeGroupBottom, sendCodeBtnBottom, downloadBtnBottom, itiBottom, countdownTimerElementBottom, resendCodeBtnBottom);
            });
        }
        if (verifyCodeBtnBottom) {
            verifyCodeBtnBottom.addEventListener('click', () => {
                handleVerifyCode('bottom', verificationCodeInputBottom, statusMessageBottom, downloadBtnBottom, verificationCodeGroupBottom, sendCodeBtnBottom, formInputsBottom, countdownTimerElementBottom, resendCodeBtnBottom);
            });
        }
        if (downloadBtnBottom) {
            downloadBtnBottom.addEventListener('click', (e) => {
                e.preventDefault();
                handleDownloadAndReset(statusMessageBottom, downloadBtnBottom, sendCodeBtnBottom, verificationCodeGroupBottom, registrationFormBottom, verificationCodeInputBottom, formInputsBottom, itiBottom, countdownIntervalBottom, countdownTimerElementBottom, resendCodeBtnBottom);
            });
        }
        if (resendCodeBtnBottom) {
            resendCodeBtnBottom.addEventListener('click', () => {
                handleSendCode('bottom', nameInputBottom, emailInputBottom, phoneInputBottom, statusMessageBottom, verificationCodeGroupBottom, sendCodeBtnBottom, downloadBtnBottom, itiBottom, countdownTimerElementBottom, resendCodeBtnBottom);
            });
        }
    }

    // Estado global para cada formulario de PDF
    let currentPhoneNumber = { top: '', bottom: '' };
    let currentName = { top: '', bottom: '' };
    let currentEmail = { top: '', bottom: '' };

    // Variables para el contador de PDF forms
    let countdownIntervalTop;
    let countdownIntervalBottom;
    const RESEND_TIMER_SECONDS = 300; // 5 minutos * 60 segundos


    // Función para mostrar mensajes de estado para un formulario específico
    function showStatus(messageElement, message, isError = false) {
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.style.color = isError ? 'red' : 'green';
            messageElement.style.display = 'block';
        }
    }

    // Ocultar mensaje de estado después de un tiempo
    function hideStatus(messageElement) {
        if (messageElement) {
            setTimeout(() => {
                messageElement.style.display = 'none';
                messageElement.textContent = '';
            }, 5000);
        }
    }

    // Función de validación de email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Función para iniciar el contador y manejar el botón de reenvío
    function startCountdown(formType, timerElement, resendBtnElement, sendBtnElement) {
        let timeLeft = RESEND_TIMER_SECONDS;

        if (formType === 'top' && countdownIntervalTop) {
            clearInterval(countdownIntervalTop);
        } else if (formType === 'bottom' && countdownIntervalBottom) {
            clearInterval(countdownIntervalBottom);
        }

        if (resendBtnElement) {
            resendBtnElement.style.display = 'none';
            resendBtnElement.disabled = true;
        }

        if (timerElement) {
            timerElement.style.display = 'inline';
        }

        const intervalId = setInterval(() => {
            if (timerElement) {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerElement.textContent = `Puedes reenviar el código en ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            if (timeLeft <= 0) {
                clearInterval(intervalId);
                if (timerElement) {
                    timerElement.textContent = '';
                    timerElement.style.display = 'none';
                }
                if (resendBtnElement) {
                    resendBtnElement.style.display = 'block';
                    resendBtnElement.disabled = false;
                }
                if (sendBtnElement) {
                    sendBtnElement.style.display = 'none';
                }
            }
            timeLeft--;
        }, 1000);

        if (formType === 'top') {
            countdownIntervalTop = intervalId;
        } else {
            countdownIntervalBottom = intervalId;
        }
    }


    // Función genérica para manejar el envío del código (PARA PDF Forms)
    async function handleSendCode(formType, nameInput, emailInput, phoneInput, messageElement, verificationGroupElement, sendBtnElement, downloadBtnElement, itiInstance, timerElement, resendBtnElement) {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!itiInstance || !itiInstance.isValidNumber || !phoneInput) {
             showStatus(messageElement, 'Error de inicialización de teléfono. Recarga la página.', true);
             hideStatus(messageElement);
             return;
        }

        const phoneNumber = itiInstance.getNumber(intlTelInputUtils.numberFormat.E164);

        if (!itiInstance.isValidNumber()) {
            showStatus(messageElement, 'Número de teléfono no válido o incompleto para el país seleccionado.', true);
            hideStatus(messageElement);
            return;
        }

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

        currentPhoneNumber[formType] = phoneNumber;
        currentName[formType] = name;
        currentEmail[formType] = email;

        showStatus(messageElement, 'Enviando código de verificación...');
        messageElement.style.color = 'orange';

        if (sendBtnElement) sendBtnElement.disabled = true;
        if (downloadBtnElement) {
            downloadBtnElement.disabled = true;
            downloadBtnElement.style.cursor = 'not-allowed';
        }


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
                if (verificationGroupElement) verificationGroupElement.style.display = 'block';
                if (sendBtnElement) sendBtnElement.style.display = 'none';

                startCountdown(formType, timerElement, resendBtnElement, sendBtnElement);

            } else {
                showStatus(messageElement, data.message || 'Error al enviar el código.', true);
                if (sendBtnElement) sendBtnElement.style.display = 'block';
                // También ocultar el contador si hay un error y no se envía el código
                if (formType === 'top') {
                    if (countdownIntervalTop) clearInterval(countdownIntervalTop);
                    if (timerElement) { timerElement.textContent = ''; timerElement.style.display = 'none'; }
                    if (resendBtnElement) { resendBtnElement.style.display = 'none'; resendBtnElement.disabled = true; }
                } else {
                    if (countdownIntervalBottom) clearInterval(countdownIntervalBottom);
                    if (timerElement) { timerElement.textContent = ''; timerElement.style.display = 'none'; }
                    if (resendBtnElement) { resendBtnElement.style.display = 'none'; resendBtnElement.disabled = true; }
                }
            }
        } catch (error) {
            console.error('Error al solicitar código:', error);
            showStatus(messageElement, 'Ocurrió un error de red. Intenta de nuevo más tarde.', true);
            if (sendBtnElement) sendBtnElement.style.display = 'block';
            if (formType === 'top') {
                if (countdownIntervalTop) clearInterval(countdownIntervalTop);
                if (timerElement) { timerElement.textContent = ''; timerElement.style.display = 'none'; }
                if (resendBtnElement) { resendCodeBtnTop.style.display = 'none'; resendCodeBtnTop.disabled = true; }
            } else {
                if (countdownIntervalBottom) clearInterval(countdownIntervalBottom);
                if (timerElement) { timerElement.textContent = ''; timerElement.style.display = 'none'; }
                if (resendBtnElement) { resendCodeBtnBottom.style.display = 'none'; resendCodeBtnBottom.disabled = true; }
            }
        } finally {
            hideStatus(messageElement);
            if (sendBtnElement) sendBtnElement.disabled = false;
        }
    }

    // Función genérica para manejar la verificación del código (PARA PDF Forms)
    async function handleVerifyCode(formType, codeInput, messageElement, downloadBtnElement, verificationGroupElement, sendBtnElement, formInputs, timerElement, resendBtnElement) {
        const userInputCode = codeInput.value.trim();

        if (!userInputCode) {
            showStatus(messageElement, 'Por favor, ingresa el código de verificación.', true);
            hideStatus(messageElement);
            return;
        }

        showStatus(messageElement, 'Verificando código...');
        messageElement.style.color = 'orange';

        if (registrationFormTop && verifyCodeBtnTop) verifyCodeBtnTop.disabled = true;
        if (registrationFormBottom && verifyCodeBtnBottom) verifyCodeBtnBottom.disabled = true;

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
                if (downloadBtnElement) {
                    downloadBtnElement.disabled = false;
                    downloadBtnElement.style.cursor = 'pointer';
                }

                if (verificationGroupElement) verificationGroupElement.style.display = 'none';
                if (sendBtnElement) sendBtnElement.style.display = 'none';

                formInputs.forEach(input => { if (input) input.disabled = true; });
                if (downloadBtnElement) downloadBtnElement.disabled = false;

                if (formType === 'top') {
                    if (countdownIntervalTop) clearInterval(countdownIntervalTop);
                    if (timerElement) { timerElement.textContent = ''; timerElement.style.display = 'none'; }
                    if (resendBtnElement) { resendBtnElement.style.display = 'none'; resendBtnElement.disabled = true; }
                } else {
                    if (countdownIntervalBottom) clearInterval(countdownIntervalBottom);
                    if (timerElement) { timerElement.textContent = ''; timerElement.style.display = 'none'; }
                    if (resendBtnElement) { resendBtnElement.style.display = 'none'; resendBtnElement.disabled = true; }
                }

            } else {
                showStatus(messageElement, data.message || 'Código incorrecto o expirado.', true);
                if (downloadBtnElement) downloadBtnElement.disabled = true;
            }
        } catch (error) {
            console.error('Error al verificar código:', error);
            showStatus(messageElement, 'Ocurrió un error de red al verificar. Intenta de nuevo más tarde.', true);
            if (downloadBtnElement) downloadBtnElement.disabled = true;
        } finally {
            hideStatus(messageElement);
            if (registrationFormTop && verifyCodeBtnTop) verifyCodeBtnTop.disabled = false;
            if (registrationFormBottom && verifyCodeBtnBottom) verifyCodeBtnBottom.disabled = false;
        }
    }

    // Función genérica para manejar la descarga del PDF y resetear el formulario (PARA PDF Forms)
    function handleDownloadAndReset(messageElement, downloadBtnElement, sendBtnElement, verificationGroupElement, formElement, verificationCodeInput, formInputs, itiInstance, countdownInterval, countdownTimerElement, resendBtnElement) {
        window.location.href = '/static/tu-guia-de-ventas.pdf';
        showStatus(messageElement, '¡Descarga iniciada! Revisa tus descargas.', false);

        formElement.reset();
        if (sendBtnElement) sendBtnElement.style.display = 'block';
        if (verificationGroupElement) verificationGroupElement.style.display = 'none';
        if (downloadBtnElement) {
            downloadBtnElement.disabled = true;
            downloadBtnElement.style.cursor = 'not-allowed';
        }
        if (verificationCodeInput) verificationCodeInput.value = '';

        formInputs.forEach(input => { if (input) input.disabled = false; });

        if (formElement.id === 'downloadForm') {
            currentPhoneNumber.top = ''; currentName.top = ''; currentEmail.top = '';
            if (countdownIntervalTop) clearInterval(countdownIntervalTop);
        } else if (formElement.id === 'downloadFormBottom') {
            currentPhoneNumber.bottom = ''; currentName.bottom = ''; currentEmail.bottom = '';
            if (countdownIntervalBottom) clearInterval(countdownIntervalBottom);
        }

        if (countdownTimerElement) { countdownTimerElement.textContent = ''; countdownTimerElement.style.display = 'none'; }
        if (resendBtnElement) { resendBtnElement.style.display = 'none'; resendBtnElement.disabled = true; }
        if (itiInstance) itiInstance.setNumber("");
    }


    // --- Funcionalidad para botones de Planes y Modal de Contacto (presentes en index.html) ---

    // URL base de WhatsApp con tu número
    const whatsappBaseURL = "https://wa.me/+5492233553998?text="; // <--- ¡TU NÚMERO AQUÍ!

    // Selecciona todos los botones de WhatsApp de los planes
    const whatsappPlanButtons = document.querySelectorAll('.whatsapp-plan-btn');

    whatsappPlanButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const planName = this.dataset.plan;
            const message = `Hola, me interesa el ${planName} y quisiera más información.`;
            const encodedMessage = encodeURIComponent(message);
            const fullWhatsappURL = whatsappBaseURL + encodedMessage;
            window.open(fullWhatsappURL, '_blank');
        });
    });

    // --- FUNCIONALIDAD DEL MODAL Y FORMULARIO DE CONTACTO (en index.html) ---

    // Obtener elementos del DOM del modal
    const contactModal = document.getElementById('contactModal');
    const closeButton = document.querySelector('.close-button');
    const detailsForm = document.getElementById('detailsForm');
    const modalFormMessage = document.getElementById('modalFormMessage');
    const planOfInterestInput = document.getElementById('planOfInterest');

    let contactTelIti;
    const contactTelInput = document.getElementById("contactTel");

    // Inicializar intl-tel-input para el campo de teléfono del modal SOLO SI EL MODAL EXISTE (estamos en index.html)
    if (contactTelInput) {
        contactTelIti = window.intlTelInput(contactTelInput, {
            preferredCountries: ["ar"],
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js",
        });
    }

    // Selecciona todos los botones de formulario de los planes (solo una vez)
    const formPlanButtons = document.querySelectorAll('.form-plan-btn');

    // CONSOLIDACIÓN: Los botones de formulario ahora abren el modal directamente
    formPlanButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            if (contactModal) {
                const planName = this.dataset.plan;
                if (planOfInterestInput) planOfInterestInput.value = planName;
                contactModal.style.display = 'block';
                if (modalFormMessage) modalFormMessage.textContent = '';
                if (detailsForm) detailsForm.reset();
                if (contactTelIti) contactTelIti.setNumber("");
                const contactNameInput = document.getElementById('contactName');
                if (contactNameInput) contactNameInput.focus();
            }
        });
    });

    // Event listener para cerrar el modal al hacer clic en la "X"
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            if (contactModal) contactModal.style.display = 'none';
        });
    }

    // Event listener para cerrar el modal al hacer clic fuera del contenido
    if (contactModal) {
        window.addEventListener('click', function(event) {
            if (event.target == contactModal) {
                contactModal.style.display = 'none';
            }
        });
    }


    // --- Validación y Envío del Formulario del Modal ---
    if (detailsForm) {
        detailsForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const errorMessages = document.querySelectorAll('.error-message');
            errorMessages.forEach(msg => { if (msg) msg.style.display = 'none'; });
            if (modalFormMessage) {
                modalFormMessage.textContent = '';
                modalFormMessage.style.color = '';
            }

            let isValid = true;

            const contactName = document.getElementById('contactName');
            if (contactName && contactName.value.trim() === '') {
                const contactNameError = document.getElementById('contactNameError');
                if (contactNameError) { contactNameError.textContent = 'El nombre es obligatorio.'; contactNameError.style.display = 'block'; }
                isValid = false;
            }

            const contactEmail = document.getElementById('contactEmail');
            if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.value.trim())) {
                const contactEmailError = document.getElementById('contactEmailError');
                if (contactEmailError) { contactEmailError.textContent = 'Ingrese un correo electrónico válido.'; contactEmailError.style.display = 'block'; }
                isValid = false;
            }

            if (contactTelIti && contactTelInput && !contactTelIti.isValidNumber()) {
                const contactTelError = document.getElementById('contactTelError');
                if (contactTelError) { contactTelError.textContent = 'Ingrese un número de teléfono válido (incluyendo código de país).'; contactTelError.style.display = 'block'; }
                isValid = false;
            }

            const companyName = document.getElementById('companyName');
            if (companyName && companyName.value.trim() === '') {
                const companyNameError = document.getElementById('companyNameError');
                if (companyNameError) { companyNameError.textContent = 'El nombre de la empresa/emprendimiento es obligatorio.'; companyNameError.style.display = 'block'; }
                isValid = false;
            }

            const goals = document.getElementById('goals');
            if (goals && goals.value.trim() === '') {
                const goalsError = document.getElementById('goalsError');
                if (goalsError) { goalsError.textContent = 'Los objetivos son obligatorios.'; goalsError.style.display = 'block'; }
                isValid = false;
            }

            if (!isValid) {
                if (modalFormMessage) {
                    modalFormMessage.textContent = 'Por favor, corrige los errores en el formulario.';
                    modalFormMessage.style.color = '#d24600';
                }
                return;
            }

            const formData = {
                contactName: contactName ? contactName.value.trim() : '',
                contactEmail: contactEmail ? contactEmail.value.trim() : '',
                contactTel: contactTelIti ? contactTelIti.getNumber() : '',
                companyName: companyName ? companyName.value.trim() : '',
                industry: document.getElementById('industry') ? document.getElementById('industry').value.trim() : '',
                goals: goals ? goals.value.trim() : '',
                planOfInterest: planOfInterestInput ? planOfInterestInput.value : ''
            };

            const submitButton = detailsForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';
            }
            if (modalFormMessage) {
                modalFormMessage.textContent = 'Enviando tu solicitud...';
                modalFormMessage.style.color = '#e89f00';
            }

            try {
                const response = await fetch('/.netlify/functions/send-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (response.ok) {
                    // *** INICIO DE LA MODIFICACIÓN ***
                    // Opcional: mostrar un mensaje breve antes de redirigir
                    if (modalFormMessage) {
                        modalFormMessage.textContent = '¡Solicitud enviada con éxito!';
                        modalFormMessage.style.color = '#25D366'; // Color de éxito
                    }
                    // Redirigir a la página de agradecimiento inmediatamente
                    window.location.href = '/gracias.html'; 
                    // Ya no necesitamos resetear el formulario ni cerrar el modal aquí
                    // porque la página será reemplazada por gracias.html
                    // *** FIN DE LA MODIFICACIÓN ***
                } else {
                    if (modalFormMessage) {
                        modalFormMessage.textContent = data.message || 'Hubo un error al enviar tu solicitud. Intenta de nuevo.';
                        modalFormMessage.style.color = '#d24600';
                    }
                }
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                if (modalFormMessage) {
                    modalFormMessage.textContent = 'Error de conexión. Por favor, verifica tu internet e intenta de nuevo.';
                    modalFormMessage.style.color = '#d24600';
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Enviar Solicitud';
                }
            }
        });
    }
});
