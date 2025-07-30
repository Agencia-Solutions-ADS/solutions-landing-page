// solutions/js/script.js

document.addEventListener('DOMContentLoaded', () => {

    // ** TU URL DE DESPLIEGUE DE GOOGLE APPS SCRIPT AQUÍ **
    // ¡IMPORTANTE! Reemplaza 'URL_DE_TU_APPS_SCRIPT_AQUI' con la URL real de tu Google Apps Script desplegado como aplicación web.
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbze3hgEA55a4yyeIoXPEr9Fuhpd_xvMJiFVr9pTTgVyYT7x7lZ4jBNUEZCVbsXIrls3/exec'; 

    // --- Lógica para el Carousel de Servicios (en landing/index.html) ---
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper) { // Solo ejecutar si el carrusel existe en la página
        const carousel = carouselWrapper.querySelector('.service-cards-carousel');
        const serviceCards = Array.from(carousel.querySelectorAll('.service-card'));
        const prevBtn = carouselWrapper.querySelector('.prev-btn');
        const nextBtn = carouselWrapper.querySelector('.next-btn');
        const paginationDotsContainer = carouselWrapper.querySelector('.carousel-pagination');

        let currentIndex = 0;

        // Función para crear los puntos de paginación
        function createPaginationDots() {
            paginationDotsContainer.innerHTML = ''; // Limpiar puntos existentes
            serviceCards.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === currentIndex) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => {
                    scrollToCard(index);
                });
                paginationDotsContainer.appendChild(dot);
            });
        }

        // Función para actualizar el estado activo de los puntos de paginación
        function updatePaginationDots() {
            const dots = paginationDotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Función para desplazar el carrusel a una tarjeta específica
        function scrollToCard(index) {
            currentIndex = index;
            const scrollLeft = serviceCards[currentIndex].offsetLeft - (carousel.offsetWidth - serviceCards[currentIndex].offsetWidth) / 2;
            carousel.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
            updatePaginationDots();
        }

        // Navegación con botones
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                scrollToCard(currentIndex - 1);
            } else {
                scrollToCard(serviceCards.length - 1); // Vuelve a la última si está en la primera
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentIndex < serviceCards.length - 1) {
                scrollToCard(currentIndex + 1);
            } else {
                scrollToCard(0); // Vuelve a la primera si está en la última
            }
        });

        // Actualizar el índice y los puntos al hacer scroll manualmente
        carousel.addEventListener('scroll', () => {
            const carouselCenter = carousel.scrollLeft + carousel.offsetWidth / 2;
            let closestCardIndex = 0;
            let minDistance = Infinity;

            serviceCards.forEach((card, index) => {
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const distance = Math.abs(carouselCenter - cardCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCardIndex = index;
                }
            });

            if (closestCardIndex !== currentIndex) {
                currentIndex = closestCardIndex;
                updatePaginationDots();
            }
        });

        // Inicializar los puntos de paginación al cargar la página
        createPaginationDots();
        // Asegurarse de que la primera tarjeta esté visible y activa al cargar
        scrollToCard(0);
    }

    // --- Lógica del Modal de Contacto (usado en formularios-contacto.html y planes.html) ---
    const modal = document.getElementById('contactModal');
    const closeBtn = document.querySelector('.modal-close-btn');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const planOfInterestInput = document.getElementById('planOfInterest');

    if (modal) { // Solo si el modal existe en la página
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const plan = btn.dataset.plan;
                if (planOfInterestInput) {
                    planOfInterestInput.value = plan ? `Interesado en Plan: ${plan}` : 'Consulta General';
                }
                modal.style.display = 'block';
                document.body.classList.add('no-scroll'); // Evitar scroll del body
            });
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.classList.remove('no-scroll');
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // --- Funciones de Utilidad de Validación de Formularios ---
    // Función para mostrar mensajes de error
    function displayError(element, message) {
        if (element) {
            const errorDiv = document.getElementById(element.id + 'Error');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = message ? 'block' : 'none';
            }
        }
    }

    // Función de validación de email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // --- Lógica para el Formulario de Descarga de PDF (en landing/pdf-ventas.html) ---
    const registrationForm = document.getElementById('downloadForm');
    let iti; // Variable para la instancia de intlTelInput

    if (registrationForm) { // Solo si estamos en pdf-ventas.html
        const sendCodeBtn = document.getElementById('sendCodeBtn');
        const verificationCodeInput = document.getElementById('verificationCode');
        const verificationCodeGroup = registrationForm.querySelector('.verification-code-group');
        const verifyCodeBtn = document.getElementById('verifyCodeBtn');
        const statusMessage = registrationForm.querySelector('.form-message');
        const downloadBtn = document.getElementById('downloadBtn');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const countdownTimerElement = document.getElementById('countdownTimerTop');
        const resendCodeBtn = document.getElementById('resendCodeBtnTop');

        let countdownInterval;
        let timeLeft = 60; // 60 segundos para el código
        let canResend = false;
        let isCodeSent = false; // Bandera para controlar si se ha solicitado un código

        // Inicializar intl-tel-input para el formulario de PDF
        iti = window.intlTelInput(phoneInput, {
            initialCountry: "ar", // País inicial
            separateDialCode: true, // Mostrar código de país separado
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js" // Para formateo y validación
        });

        const startCountdown = () => {
            timeLeft = 60;
            canResend = false;
            resendCodeBtn.disabled = true;
            countdownTimerElement.style.display = 'inline'; // Mostrar timer
            countdownTimerElement.textContent = `Reenviar en ${timeLeft}s`; // Mensaje inicial
            clearInterval(countdownInterval); // Asegurar que no haya múltiples intervalos
            countdownInterval = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    countdownTimerElement.textContent = 'Código expirado. Puedes reenviar.';
                    canResend = true;
                    resendCodeBtn.style.display = 'inline';
                    resendCodeBtn.disabled = false;
                } else {
                    countdownTimerElement.textContent = `Reenviar en ${timeLeft}s`;
                    timeLeft--;
                }
            }, 1000);
        };

        const validateFormFields = () => {
            let isValid = true;
            displayError(nameInput, '');
            displayError(emailInput, '');
            displayError(phoneInput, '');

            if (!nameInput.value.trim()) {
                displayError(nameInput, 'El nombre es requerido.');
                isValid = false;
            }
            if (!validateEmail(emailInput.value)) {
                displayError(emailInput, 'Por favor, introduce un email válido.');
                isValid = false;
            }
            // Validar que el número sea válido según intl-tel-input
            if (!iti.isValidNumber()) {
                let errorCode = iti.getValidationError();
                let errorMessage = 'Número de teléfono no válido.';
                switch (errorCode) {
                    case intlTelInputUtils.validationError.IS_POSSIBLE: errorMessage = 'Número posiblemente incompleto.'; break;
                    case intlTelInputUtils.validationError.INVALID_NUMBER: errorMessage = 'Número no válido.'; break;
                    case intlTelInputUtils.validationError.TOO_SHORT: errorMessage = 'Número demasiado corto.'; break;
                    case intlTelInputUtils.validationError.TOO_LONG: errorMessage = 'Número demasiado largo.'; break;
                    case intlTelInputUtils.validationError.NOT_A_NUMBER: errorMessage = 'No es un número.'; break;
                    default: errorMessage = 'Número de teléfono no válido.'; break; // Manejo para errores no mapeados
                }
                displayError(phoneInput, errorMessage);
                isValid = false;
            }
            return isValid;
        };

        sendCodeBtn.addEventListener('click', async () => {
            if (!validateFormFields()) {
                return; // Detener si hay errores de validación
            }

            statusMessage.textContent = 'Enviando código...';
            statusMessage.className = 'form-message loading';
            
            // Obtener el número de teléfono en formato internacional completo
            const fullPhoneNumber = iti.getNumber();

            try {
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'cors', // Necesario para CORS en Apps Script
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8', // Apps Script espera text/plain para JSON.parse(e.postData.contents)
                    },
                    body: JSON.stringify({
                        action: 'saveCode',
                        phoneNumber: fullPhoneNumber,
                        code: Math.floor(100000 + Math.random() * 900000).toString(), // Genera el código aquí para enviarlo a Apps Script
                        name: nameInput.value.trim(),
                        email: emailInput.value.trim()
                    })
                });

                const data = await response.json();

                if (response.ok && data.message.includes('enviado')) {
                    isCodeSent = true;
                    statusMessage.textContent = data.message;
                    statusMessage.className = 'form-message success';
                    verificationCodeGroup.style.display = 'block';
                    sendCodeBtn.style.display = 'none'; // Ocultar botón de enviar código
                    startCountdown();
                } else {
                    statusMessage.textContent = data.message || 'Error al solicitar el código.';
                    statusMessage.className = 'form-message error';
                }
            } catch (error) {
                console.error('Error al enviar solicitud de código:', error);
                statusMessage.textContent = 'Error de conexión. Inténtalo más tarde.';
                statusMessage.className = 'form-message error';
            }
        });

        resendCodeBtn.addEventListener('click', async () => {
            if (!canResend) return;

            if (!validateFormFields()) {
                return;
            }

            statusMessage.textContent = 'Reenviando código...';
            statusMessage.className = 'form-message loading';
            clearInterval(countdownInterval);
            countdownTimerElement.style.display = 'none';
            resendCodeBtn.style.display = 'none';

            const fullPhoneNumber = iti.getNumber();

            try {
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify({
                        action: 'saveCode',
                        phoneNumber: fullPhoneNumber,
                        code: Math.floor(100000 + Math.random() * 900000).toString(), // Nuevo código
                        name: nameInput.value.trim(),
                        email: emailInput.value.trim()
                    })
                });

                const data = await response.json();

                if (response.ok && data.message.includes('enviado')) {
                    statusMessage.textContent = data.message;
                    statusMessage.className = 'form-message success';
                    startCountdown();
                } else {
                    statusMessage.textContent = data.message || 'Error al reenviar el código.';
                    statusMessage.className = 'form-message error';
                }
            } catch (error) {
                console.error('Error al reenviar solicitud de código:', error);
                statusMessage.textContent = 'Error de conexión al reenviar.';
                statusMessage.className = 'form-message error';
            }
        });

        verifyCodeBtn.addEventListener('click', async () => {
            if (!isCodeSent) {
                statusMessage.textContent = 'Primero solicita un código.';
                statusMessage.className = 'form-message error';
                return;
            }

            const enteredCode = verificationCodeInput.value.trim();
            if (!enteredCode) {
                statusMessage.textContent = 'Ingresa el código de validación.';
                statusMessage.className = 'form-message error';
                return;
            }

            statusMessage.textContent = 'Verificando código...';
            statusMessage.className = 'form-message loading';

            const fullPhoneNumber = iti.getNumber();

            try {
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify({
                        action: 'verifyCode',
                        phoneNumber: fullPhoneNumber,
                        userInputCode: enteredCode,
                        name: nameInput.value.trim(),
                        email: emailInput.value.trim()
                    })
                });

                const data = await response.json();

                if (response.ok && data.message.includes('validado')) {
                    clearInterval(countdownInterval); // Detener el contador al validar
                    statusMessage.textContent = data.message;
                    statusMessage.className = 'form-message success';
                    downloadBtn.disabled = false; // Habilitar el botón de descarga
                    verificationCodeInput.disabled = true; // Deshabilitar input de código
                    verifyCodeBtn.disabled = true; // Deshabilitar botón de verificar
                    countdownTimerElement.style.display = 'none'; // Ocultar el contador
                    resendCodeBtn.style.display = 'none'; // Ocultar reenviar
                    // Redirigir a la página de gracias después de un pequeño retraso
                    setTimeout(() => {
                        window.location.href = '../html/gracias.html';
                    }, 1500);
                } else {
                    statusMessage.textContent = data.message || 'Error al verificar el código.';
                    statusMessage.className = 'form-message error';
                    downloadBtn.disabled = true;
                }
            } catch (error) {
                console.error('Error al verificar código:', error);
                statusMessage.textContent = 'Error de conexión. Inténtalo más tarde.';
                statusMessage.className = 'form-message error';
            }
        });

        // Asegurarse de limpiar errores al cambiar inputs
        nameInput.addEventListener('input', () => displayError(nameInput, ''));
        emailInput.addEventListener('input', () => displayError(emailInput, ''));
        phoneInput.addEventListener('input', () => displayError(phoneInput, ''));
        verificationCodeInput.addEventListener('input', () => {
            if (statusMessage.textContent === 'Código incorrecto. Inténtalo de nuevo.') {
                statusMessage.textContent = '';
                statusMessage.className = 'form-message';
            }
        });
    }

    // --- Lógica para el Formulario del Modal (formularios-contacto.html y planes.html) ---
    const modalContactForm = document.getElementById('modalContactForm');
    let itiModal; // Variable para la instancia de intlTelInput del modal

    if (modalContactForm) { // Solo si el formulario del modal existe
        const modalNameInput = document.getElementById('modalName');
        const modalEmailInput = document.getElementById('modalEmail');
        const modalTelInput = document.getElementById('modalTel');
        const companyNameInput = document.getElementById('companyName');
        const industryInput = document.getElementById('industry'); // Asegúrate de que este input exista o lo maneje
        const goalsInput = document.getElementById('goals');
        const modalFormMessage = document.getElementById('modalFormMessage');
        const planOfInterestInput = document.getElementById('planOfInterest');


        // Inicializar intl-tel-input para el formulario del modal
        itiModal = window.intlTelInput(modalTelInput, {
            initialCountry: "ar",
            separateDialCode: true,
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"
        });

        // Función de validación para el formulario del modal
        const validateModalForm = () => {
            let isValid = true;
            displayError(modalNameInput, '');
            displayError(modalEmailInput, '');
            displayError(modalTelInput, '');
            displayError(companyNameInput, '');
            displayError(goalsInput, '');

            if (!modalNameInput.value.trim()) {
                displayError(modalNameInput, 'El nombre es requerido.');
                isValid = false;
            }
            if (!validateEmail(modalEmailInput.value)) {
                displayError(modalEmailInput, 'Por favor, introduce un email válido.');
                isValid = false;
            }
            if (!itiModal.isValidNumber()) {
                let errorCode = itiModal.getValidationError();
                let errorMessage = 'Número de teléfono no válido.';
                switch (errorCode) {
                    case intlTelInputUtils.validationError.IS_POSSIBLE: errorMessage = 'Número posiblemente incompleto.'; break;
                    case intlTelInputUtils.validationError.INVALID_NUMBER: errorMessage = 'Número no válido.'; break;
                    case intlTelInputUtils.validationError.TOO_SHORT: errorMessage = 'Número demasiado corto.'; break;
                    case intlTelInputUtils.validationError.TOO_LONG: errorMessage = 'Número demasiado largo.'; break;
                    case intlTelInputUtils.validationError.NOT_A_NUMBER: errorMessage = 'No es un número.'; break;
                    default: errorMessage = 'Número de teléfono no válido.'; break;
                }
                displayError(modalTelInput, errorMessage);
                isValid = false;
            }
            if (!companyNameInput.value.trim()) {
                displayError(companyNameInput, 'El nombre de la empresa es requerido.');
                isValid = false;
            }
            if (!goalsInput.value.trim()) {
                displayError(goalsInput, 'Tus objetivos son requeridos.');
                isValid = false;
            }
            return isValid;
        };

        modalContactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevenir el envío por defecto

            if (validateModalForm()) {
                modalFormMessage.textContent = 'Enviando su solicitud...';
                modalFormMessage.className = 'form-message loading';

                const fullPhoneNumber = itiModal.getNumber(); // Obtener número de teléfono completo

                try {
                    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'text/plain;charset=utf-8', // Apps Script espera text/plain para JSON.parse(e.postData.contents)
                        },
                        body: JSON.stringify({
                            action: 'saveLead', // Acción para guardar el lead del modal
                            name: modalNameInput.value.trim(),
                            email: modalEmailInput.value.trim(),
                            phoneNumber: fullPhoneNumber,
                            companyName: companyNameInput.value.trim(),
                            industry: industryInput ? industryInput.value.trim() : '', // Condicional por si no siempre está
                            goals: goalsInput.value.trim(),
                            planOfInterest: planOfInterestInput ? planOfInterestInput.value.trim() : '' // Si aplica
                        })
                    });

                    const data = await response.json();

                    if (response.ok) { // Apps Script devuelve 200 OK si todo fue bien
                        modalFormMessage.textContent = data.message || '¡Su solicitud ha sido enviada con éxito!';
                        modalFormMessage.className = 'form-message success';
                        // Redirigir a la página de gracias después de un pequeño retraso
                        setTimeout(() => {
                            window.location.href = '../html/gracias.html';
                        }, 1500);
                    } else {
                        modalFormMessage.textContent = data.message || 'Error al enviar la solicitud.';
                        modalFormMessage.className = 'form-message error';
                    }
                } catch (error) {
                    console.error('Error al enviar formulario del modal:', error);
                    modalFormMessage.textContent = 'Error de conexión. Inténtalo más tarde.';
                    modalFormMessage.className = 'form-message error';
                }
            } else {
                modalFormMessage.textContent = 'Por favor, corrige los errores en el formulario.';
                modalFormMessage.className = 'form-message error';
            }
        });

        // Limpiar mensajes de error al escribir
        modalNameInput.addEventListener('input', () => displayError(modalNameInput, ''));
        modalEmailInput.addEventListener('input', () => displayError(modalEmailInput, ''));
        modalTelInput.addEventListener('input', () => displayError(modalTelInput, ''));
        companyNameInput.addEventListener('input', () => displayError(companyNameInput, ''));
        goalsInput.addEventListener('input', () => displayError(goalsInput, ''));
    }

    // --- Lógica para el Formulario de Contacto (en html/contacto.html) ---
    const mainContactForm = document.querySelector('.contact-form-section .contact-form');

    if (mainContactForm) { // Solo si el formulario principal de contacto existe
        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const telefonoInput = document.getElementById('telefono'); 
        const mensajeInput = document.getElementById('mensaje');
        const privacidadCheckbox = document.getElementById('privacidad');

        // Para el formulario de contacto principal, puedes inicializar intl-tel-input si es que 
        // deseas usarlo para validación en el campo de teléfono opcional.
        let itiMainContact;
        if (telefonoInput) {
            itiMainContact = window.intlTelInput(telefonoInput, {
                initialCountry: "ar",
                separateDialCode: true,
                utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"
            });
        }

        // Función de validación para el formulario principal de contacto
        const validateMainContactForm = () => {
            let isValid = true;
            displayError(nombreInput, '');
            displayError(emailInput, '');
            displayError(mensajeInput, '');
            // displayError(telefonoInput, ''); // Si se requiere un div de error específico para teléfono

            if (!nombreInput.value.trim()) {
                displayError(nombreInput, 'El nombre es requerido.');
                isValid = false;
            }
            if (!validateEmail(emailInput.value)) {
                displayError(emailInput, 'Por favor, introduce un email válido.');
                isValid = false;
            }
            if (!mensajeInput.value.trim()) {
                displayError(mensajeInput, 'El mensaje es requerido.');
                isValid = false;
            }
            if (!privacidadCheckbox.checked) {
                alert('Debes aceptar la política de privacidad.'); // Alerta simple, puedes mejorarla
                isValid = false;
            }
            // Si el teléfono es opcional, solo validar si hay algo escrito
            if (telefonoInput && telefonoInput.value.trim() !== '' && itiMainContact && !itiMainContact.isValidNumber()) {
                 let errorCode = itiMainContact.getValidationError();
                let errorMessage = 'Número de teléfono no válido.';
                switch (errorCode) {
                    case intlTelInputUtils.validationError.IS_POSSIBLE: errorMessage = 'Número posiblemente incompleto.'; break;
                    case intlTelInputUtils.validationError.INVALID_NUMBER: errorMessage = 'Número no válido.'; break;
                    case intlTelInputUtils.validationError.TOO_SHORT: errorMessage = 'Número demasiado corto.'; break;
                    case intlTelInputUtils.validationError.TOO_LONG: errorMessage = 'Número demasiado largo.'; break;
                    case intlTelInputUtils.validationError.NOT_A_NUMBER: errorMessage = 'No es un número.'; break;
                    default: errorMessage = 'Número de teléfono no válido.'; break;
                }
                displayError(telefonoInput, errorMessage);
                isValid = false;
            }
            return isValid;
        };

        mainContactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevenir el envío por defecto

            if (validateMainContactForm()) {
                 // Puedes añadir un mensaje de "Enviando..." si lo deseas
                // const mainFormStatusMessage = document.getElementById('mainFormStatusMessage'); 
                // if (mainFormStatusMessage) { 
                //     mainFormStatusMessage.textContent = 'Enviando mensaje...';
                //     mainFormStatusMessage.className = 'form-message loading';
                // }

                const fullPhoneNumber = telefonoInput && telefonoInput.value.trim() !== '' && itiMainContact ? itiMainContact.getNumber() : '';

                try {
                    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'text/plain;charset=utf-8',
                        },
                        body: JSON.stringify({
                            action: 'saveContactFormLead', // Nueva acción para el formulario de contacto
                            name: nombreInput.value.trim(),
                            email: emailInput.value.trim(),
                            phoneNumber: fullPhoneNumber,
                            message: mensajeInput.value.trim()
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Si el backend responde OK, redirigimos a la página de gracias
                        window.location.href = 'gracias.html';
                    } else {
                        // if (mainFormStatusMessage) {
                        //     mainFormStatusMessage.textContent = data.message || 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.';
                        //     mainFormStatusMessage.className = 'form-message error';
                        // } else {
                            alert(data.message || 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
                        // }
                    }
                } catch (error) {
                    console.error('Error al enviar formulario de contacto:', error);
                    // if (mainFormStatusMessage) {
                    //     mainFormStatusMessage.textContent = 'Error de conexión. Por favor, inténtalo más tarde.';
                    //     mainFormStatusMessage.className = 'form-message error';
                    // } else {
                        alert('Error de conexión. Por favor, inténtalo más tarde.');
                    // }
                }
            }
        });

         // Limpiar errores al escribir
        nombreInput.addEventListener('input', () => displayError(nombreInput, ''));
        emailInput.addEventListener('input', () => displayError(emailInput, ''));
        mensajeInput.addEventListener('input', () => displayError(mensajeInput, ''));
        if (telefonoInput) {
            telefonoInput.addEventListener('input', () => displayError(telefonoInput, ''));
        }
    }
});