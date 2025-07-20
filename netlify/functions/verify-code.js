// netlify/functions/verify-code.js
const axios = require('axios');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    const APPS_SCRIPT_WEB_APP_URL = process.env.APPS_SCRIPT_WEB_APP_URL; // Obtener de las variables de entorno de Netlify

    if (!APPS_SCRIPT_WEB_APP_URL) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Apps Script URL not configured.' })
        };
    }

    try {
        const data = JSON.parse(event.body);

        const payload = {
            action: 'verifyCode',
            phoneNumber: data.phoneNumber,
            userInputCode: data.userInputCode, // Código ingresado por el usuario
            name: data.name,
            email: data.email
        };

        const response = await axios.post(APPS_SCRIPT_WEB_APP_URL, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Reenviar la respuesta del Apps Script directamente al frontend
        return {
            statusCode: response.status,
            body: JSON.stringify(response.data)
        };

    } catch (error) {
        console.error('Error in verify-code function:', error.response ? error.response.data : error.message);
        return {
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({
                message: error.response ? error.response.data.message : 'Internal Server Error'
            })
        };
    }
};