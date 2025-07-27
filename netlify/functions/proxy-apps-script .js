// netlify/functions/proxy-apps-script.js

// La URL de tu API de Google Apps Script (obtenida de la variable de entorno de Netlify)
const APPS_SCRIPT_API_URL = process.env.VITE_APPS_SCRIPT_API_URL;

exports.handler = async function(event, context) {
    // Solo aceptamos solicitudes POST para este proxy
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    // Aseguramos que el cuerpo de la petición no esté vacío y sea JSON
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        console.error('Error al parsear el cuerpo de la petición:', e);
        return {
            statusCode: 400,
            body: 'Invalid JSON body'
        };
    }

    // Logueamos la petición que llega a la Netlify Function
    console.log('Petición recibida por Netlify Function:', requestBody);

    try {
        // Hacemos la petición a tu Google Apps Script desde el servidor de Netlify
        const appsScriptResponse = await fetch(APPS_SCRIPT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Leer la respuesta de Apps Script
        const responseText = await appsScriptResponse.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            // Si la respuesta no es JSON, la devolvemos como texto o error
            console.error('Respuesta de Apps Script no es JSON:', responseText);
            return {
                statusCode: appsScriptResponse.status,
                body: responseText // Devolver el texto tal cual si no es JSON
            };
        }

        // Logueamos la respuesta de Apps Script
        console.log('Respuesta de Apps Script:', responseData);

        // Devolvemos la respuesta de Apps Script al frontend del chatbot
        return {
            statusCode: appsScriptResponse.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // CORS para que el frontend pueda leer la respuesta de la Netlify Function
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify(responseData)
        };

    } catch (error) {
        console.error('Error al llamar a Google Apps Script:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error interno del servidor al comunicarse con Apps Script.' })
        };
    }
};