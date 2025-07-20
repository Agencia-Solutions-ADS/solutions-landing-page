// solutions/script.js

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    const verificationSection = document.getElementById('verification-section');
    const verificationForm = document.getElementById('verification-form');
    const statusMessage = document.getElementById('status-message');

    let currentPhoneNumber = ''; // Para almacenar temporalmente el número entre pasos
    let currentName = '';
    let currentEmail = '';

    // Función para mostrar mensajes de estado
    function showStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.style.color = isError ? 'red' : 'green';
        statusMessage.style.display = 'block';
    }

    // Ocultar mensaje de estado después de un tiempo
    function hideStatus() {
        setTimeout(() => {
            statusMessage.style.display = 'none';
            statusMessage.textContent = '';
        }, 5000); // Ocultar después de 5 segundos
    }

    // Función de validación de email
    function isValidEmail(email) {
        // Expresión regular para una validación básica de email.
        // Permite la mayoría de formatos comunes, incluyendo subdominios, pero no es exhaustiva.
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Manejar el envío del formulario de registro
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        let phoneNumber = phoneInput.value.trim();

        if (!name || !email || !phoneNumber) {
            showStatus('Por favor, completa todos los campos.', true);
            hideStatus();
            return;
        }

        // Validación de formato de email
        if (!isValidEmail(email)) {
            showStatus('Por favor, ingresa una dirección de correo electrónico válida (ej. usuario@dominio.com).', true);
            hideStatus();
            return;
        }

        // Validación de formato de número de teléfono (ej. que empiece con + y tenga al menos 10 dígitos)
        if (!phoneNumber.startsWith('+') || phoneNumber.replace(/\D/g, '').length < 10) {
            showStatus('Formato de número de teléfono inválido. Debe incluir código de país (ej. +54911...).', true);
            hideStatus();
            return;
        }

        currentPhoneNumber = phoneNumber; // Guardar para el paso de verificación
        currentName = name;
        currentEmail = email;

        showStatus('Enviando código de verificación...');
        statusMessage.style.color = 'orange'; // Cambiar color para "cargando"

        try {
            const response = await fetch('/.netlify/functions/send-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: currentPhoneNumber,
                    name: currentName,
                    email: currentEmail
                })
            });

            const data = await response.json();

            if (response.ok) {
                showStatus(data.message || 'Código enviado con éxito. Por favor, verifica tu teléfono.');
                registrationForm.style.display = 'none'; // Ocultar formulario de registro
                verificationSection.style.display = 'block'; // Mostrar sección de verificación
            } else {
                showStatus(data.message || 'Error al enviar el código.', true);
            }
        } catch (error) {
            console.error('Error al solicitar código:', error);
            showStatus('Ocurrió un error de red. Intenta de nuevo más tarde.', true);
        } finally {
            hideStatus();
        }
    });

    // Manejar el envío del formulario de verificación
    verificationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const codeInput = document.getElementById('verification-code');
        const userInputCode = codeInput.value.trim();

        if (!userInputCode) {
            showStatus('Por favor, ingresa el código de verificación.', true);
            hideStatus();
            return;
        }

        showStatus('Verificando código...');
        statusMessage.style.color = 'orange'; // Cambiar color para "cargando"

        try {
            const response = await fetch('/.netlify/functions/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: currentPhoneNumber,
                    userInputCode: userInputCode,
                    name: currentName, // Reenviar datos originales del lead
                    email: currentEmail // Reenviar datos originales del lead
                })
            });

            const data = await response.json();

            if (response.ok) {
                showStatus(data.message || 'Código validado. ¡Guía lista para descargar!');
                // Opcional: Redirigir al usuario o mostrar un enlace de descarga
                // window.location.href = '/ruta-a-tu-guia.pdf';
                verificationForm.style.display = 'none'; // Ocultar formulario de verificación si todo OK
                // registrationForm.style.display = 'block'; // Opcional: Mostrar registro de nuevo para otro lead
                // registrationForm.reset(); // Limpiar formulario
            } else {
                showStatus(data.message || 'Código incorrecto o expirado.', true);
            }
        } catch (error) {
            console.error('Error al verificar código:', error);
            showStatus('Ocurrió un error de red al verificar. Intenta de nuevo más tarde.', true);
        } finally {
            hideStatus();
        }
    });
});