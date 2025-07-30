// solutions/js/script.js

document.addEventListener('DOMContentLoaded', () => {

    // ** TU URL DE DESPLIEGUE DE GOOGLE APPS SCRIPT AQUÍ **
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbze3hgEA55a4yyeIoXPEr9Fuhpd_xvMJiFVr9pTTgVyYT7x7lZ4jBNUEZCVbsXIrls3/exec'; 

    // --- Lógica para el Carousel de Servicios (en landing/index.html) ---
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper) {
        const carousel = carouselWrapper.querySelector('.service-cards-carousel');
        const serviceCards = Array.from(carousel.querySelectorAll('.service-card'));
        const prevBtn = carouselWrapper.querySelector('.prev-btn');
        const nextBtn = carouselWrapper.querySelector('.next-btn');
        const paginationDotsContainer = carouselWrapper.querySelector('.carousel-pagination');

        let currentIndex = 0;

        function createPaginationDots() {
            paginationDotsContainer.innerHTML = '';
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

        function scrollToCard(index) {
            currentIndex = index;
            const scrollLeft = serviceCards[currentIndex].offsetLeft - (carousel.offsetWidth - serviceCards[currentIndex].offsetWidth) / 2;
            carousel.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
            updatePaginationDots();
        }

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                scrollToCard(currentIndex - 1);
            } else {
                scrollToCard(serviceCards.length - 1);
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentIndex < serviceCards.length - 1) {
                scrollToCard(currentIndex + 1);
            } else {
                scrollToCard(0);
            }
        });

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

        createPaginationDots();
        scrollToCard(0);
    }

    // --- Lógica del Modal de Contacto (usado en formularios-contacto.html y planes.html) ---
    const modal = document.getElementById('contactModal');
    const closeBtn = document.querySelector('.modal-close-btn');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const planOfInterestInput = document.getElementById('planOfInterest');

    if (modal) {
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const plan = btn.dataset.plan;
                if (planOfInterestInput) {
                    planOfInterestInput.value = plan ? `Interesado en Plan: ${plan}` : 'Consulta General';
                }
                modal.style.display = 'block';
                document.body.classList.add('no-scroll');
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
    function displayError(element, message) {
        if (element) {
            const errorDiv = document.getElementById(element.id + 'Error');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = message ? 'block' : 'none';
            }
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }


    // --- Lógica para el Formulario de Descarga de PDF (en landing/pdf-ventas.html) ---
    // Función reutilizable para configurar un formulario de descarga de PDF
    function setupPdfForm(formId, sendBtnId, verificationInputId, verificationGroupSelector, verifyBtnId, statusMsgId, downloadBtnId, nameInputId, emailInputId, phoneInputId, countdownTimerId, resendBtnId) {
        const registrationForm = document.getElementById(formId);

        if (!registrationForm) return;

        const sendCodeBtn = document.getElementById(sendBtnId);
        const verificationCodeInput = document.getElementById(verificationInputId);
        const verificationCodeGroup = registrationForm.querySelector(verificationGroupSelector);
        const verifyCodeBtn = document.getElementById(verifyBtnId);
        const statusMessage = document.getElementById(statusMsgId);
        const downloadBtn = document.getElementById(downloadBtnId);
        const nameInput = document.getElementById(nameInputId);
        const emailInput = document.getElementById(emailInputId);
        const phoneInput = document.getElementById(phoneInputId);
        const countdownTimerElement = document.getElementById(countdownTimerId);
        const resendCodeBtn = document.getElementById(resendBtnId);

        let iti;
        let countdownInterval;
        let timeLeft = 60;
        let canResend = false;
        let isCodeSent = false;

        iti = window.intlTelInput(phoneInput, {
            initialCountry: "ar",
            separateDialCode: true,
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"
        });

        const startCountdown = () => {
            timeLeft = 60;
            canResend = false;
            resendCodeBtn.disabled = true;
            countdownTimerElement.style.display = 'inline';
            countdownTimerElement.textContent = `Reenviar en ${timeLeft}s`;
            clearInterval(countdownInterval);
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
            if (!iti.isValidNumber()) {
                let errorCode = iti.getValidationError();
                let errorMessage = 'Número de teléfono no válido.';
                switch (errorCode) {
                    case intlTelInputUtils.validationError.IS_POSSIBLE: errorMessage = 'Número posiblemente incompleto.'; break;
                    case intlTelInputUtils.validationError.INVALID_NUMBER: errorMessage = 'Número no válido.'; break;
                    case intlTelInputUtils.validationError.TOO_SHORT: errorMessage = 'Número demasiado corto.'; break;
                    case intlTelInputUtils.validationError.TOO_LONG: errorMessage = 'Número demasiado largo.'; break;
                    case intlTelInputUtils.validationError.NOT_A_NUMBER: errorMessage = 'No es un número.'; break;
                    default: errorMessage = 'Número de teléfono no válido.'; break;
                }
                displayError(phoneInput, errorMessage);
                isValid = false;
            }
            return isValid;
        };

        sendCodeBtn.addEventListener('click', async () => {
            if (!validateFormFields()) {
                return;
            }

            statusMessage.textContent = 'Enviando código...';
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
                        action: 'saveCode',
                        phoneNumber: fullPhoneNumber,
                        code: Math.floor(100000 + Math.random() * 900000).toString(),
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
                    sendCodeBtn.style.display = 'none';
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
                        code: Math.floor(100000 + Math.random() * 900000).toString(),
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
                    clearInterval(countdownInterval);
                    statusMessage.textContent = data.message;
                    statusMessage.className = 'form-message success';
                    downloadBtn.disabled = false;
                    verificationCodeInput.disabled = true;
                    verifyCodeBtn.disabled = true;
                    countdownTimerElement.style.display = 'none';
                    resendCodeBtn.style.display = 'none';
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

    // --- Iniciar la configuración para ambos formularios de PDF ---
    // Configuración para el formulario superior (sin sufijos 'Bottom')
    setupPdfForm(
        'downloadForm', 'sendCodeBtn', 'verificationCode', '.verification-code-group',
        'verifyCodeBtn', 'formMessageTop', 'downloadBtn',
        'name', 'email', 'phone', 'countdownTimerTop', 'resendCodeBtnTop'
    );

    // Configuración para el formulario inferior (con sufijos 'Bottom')
    setupPdfForm(
        'downloadFormBottom', 'sendCodeBtnBottom', 'verificationCodeBottom', '.verification-code-group-bottom',
        'verifyCodeBtnBottom', 'formMessageBottom', 'downloadBtnBottom',
        'nameBottom', 'emailBottom', 'phoneBottom', 'countdownTimerBottom', 'resendCodeBtnBottom'
    );


    // --- Lógica para el Formulario del Modal (formularios-contacto.html y planes.html) ---
    const modalContactForm = document.getElementById('modalContactForm');
    let itiModal;

    if (modalContactForm) {
        const modalNameInput = document.getElementById('modalName');
        const modalEmailInput = document.getElementById('modalEmail');
        const modalTelInput = document.getElementById('modalTel');
        const companyNameInput = document.getElementById('companyName');
        const industryInput = document.getElementById('industry');
        const goalsInput = document.getElementById('goals');
        const modalFormMessage = document.getElementById('modalFormMessage');
        const planOfInterestInput = document.getElementById('planOfInterest');


        itiModal = window.intlTelInput(modalTelInput, {
            initialCountry: "ar",
            separateDialCode: true,
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"
        });

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
            event.preventDefault();

            if (validateModalForm()) {
                modalFormMessage.textContent = 'Enviando su solicitud...';
                modalFormMessage.className = 'form-message loading';

                const fullPhoneNumber = itiModal.getNumber();

                try {
                    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'text/plain;charset=utf-8',
                        },
                        body: JSON.stringify({
                            action: 'saveLead',
                            name: modalNameInput.value.trim(),
                            email: modalEmailInput.value.trim(),
                            phoneNumber: fullPhoneNumber,
                            companyName: companyNameInput.value.trim(),
                            industry: industryInput ? industryInput.value.trim() : '',
                            goals: goalsInput.value.trim(),
                            planOfInterest: planOfInterestInput ? planOfInterestInput.value.trim() : ''
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        modalFormMessage.textContent = data.message || '¡Su solicitud ha sido enviada con éxito!';
                        modalFormMessage.className = 'form-message success';
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

        modalNameInput.addEventListener('input', () => displayError(modalNameInput, ''));
        modalEmailInput.addEventListener('input', () => displayError(modalEmailInput, ''));
        modalTelInput.addEventListener('input', () => displayError(modalTelInput, ''));
        companyNameInput.addEventListener('input', () => displayError(companyNameInput, ''));
        goalsInput.addEventListener('input', () => displayError(goalsInput, ''));
    }

    // --- Lógica para el Formulario de Contacto (en html/contacto.html) ---
    const mainContactForm = document.querySelector('.contact-form-section .contact-form');

    if (mainContactForm) {
        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const telefonoInput = document.getElementById('telefono'); 
        const mensajeInput = document.getElementById('mensaje');
        const privacidadCheckbox = document.getElementById('privacidad');

        let itiMainContact;
        if (telefonoInput) {
            itiMainContact = window.intlTelInput(telefonoInput, {
                initialCountry: "ar",
                separateDialCode: true,
                utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"
            });
        }

        const validateMainContactForm = () => {
            let isValid = true;
            displayError(nombreInput, '');
            displayError(emailInput, '');
            displayError(mensajeInput, '');

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
                alert('Debes aceptar la política de privacidad.');
                isValid = false;
            }
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
            event.preventDefault();

            if (validateMainContactForm()) {
                const fullPhoneNumber = telefonoInput && telefonoInput.value.trim() !== '' && itiMainContact ? itiMainContact.getNumber() : '';

                try {
                    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'text/plain;charset=utf-8',
                        },
                        body: JSON.stringify({
                            action: 'saveContactFormLead',
                            name: nombreInput.value.trim(),
                            email: emailInput.value.trim(),
                            phoneNumber: fullPhoneNumber,
                            message: mensajeInput.value.trim()
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        window.location.href = 'gracias.html';
                    } else {
                        alert(data.message || 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
                    }
                } catch (error) {
                    console.error('Error al enviar formulario de contacto:', error);
                    alert('Error de conexión. Por favor, inténtalo más tarde.');
                }
            }
        });

        nombreInput.addEventListener('input', () => displayError(nombreInput, ''));
        emailInput.addEventListener('input', () => displayError(emailInput, ''));
        mensajeInput.addEventListener('input', () => displayError(mensajeInput, ''));
        if (telefonoInput) {
            telefonoInput.addEventListener('input', () => displayError(telefonoInput, ''));
        }
    }
});
