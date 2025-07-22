// netlify/functions/send-lead.js
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    // Solo permitir solicitudes POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Método no permitido. Solo POST.' }),
        };
    }

    try {
        // Parsear los datos del formulario enviados como JSON
        const data = JSON.parse(event.body);

        // Extraer los datos del formulario
        const { contactName, contactEmail, contactTel, companyName, industry, goals, planOfInterest } = data;

        // ** Validación básica de los datos recibidos (puedes expandirla) **
        if (!contactName || !contactEmail || !contactTel || !companyName || !goals) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Faltan campos obligatorios en el formulario.' }),
            };
        }

        // --- Configuración del transportador de Nodemailer con Gmail ---
        // IMPORTANTE: NO USES TU CONTRASEÑA NORMAL. USA UNA CONTRASEÑA DE APLICACIÓN.
        // Ver paso 4 para configurar las variables de entorno.
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, // Tu dirección de Gmail
                pass: process.env.GMAIL_APP_PASSWORD, // La contraseña de aplicación que generarás
            },
        });

        // --- Contenido del correo electrónico ---
        const mailOptions = {
            from: process.env.GMAIL_USER, // Remitente (puede ser el mismo o uno de "no-reply")
            to: process.env.RECIPIENT_EMAIL, // ¡La dirección de correo donde quieres recibir los leads!
            subject: `Nuevo Lead de Sitio Web: ${contactName} - ${planOfInterest || 'Sin Plan Específico'}`,
            html: `
                <p><strong>Nombre y Apellido:</strong> ${contactName}</p>
                <p><strong>Email:</strong> ${contactEmail}</p>
                <p><strong>Teléfono:</strong> ${contactTel}</p>
                <p><strong>Empresa/Emprendimiento:</strong> ${companyName}</p>
                <p><strong>Industria:</strong> ${industry || 'No especificada'}</p>
                <p><strong>Objetivos:</strong> ${goals}</p>
                <p><strong>Plan de Interés:</strong> ${planOfInterest || 'No especificado'}</p>
                <br>
                <p>Este es un lead generado automáticamente desde tu sitio web.</p>
            `,
        };

        // Enviar el correo electrónico
        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Solicitud enviada con éxito.' }),
        };

    } catch (error) {
        console.error('Error al procesar el envío del lead:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error interno del servidor al enviar la solicitud.', error: error.message }),
        };
    }
};