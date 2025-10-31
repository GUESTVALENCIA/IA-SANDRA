const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY no está configurada en el archivo .env');
}

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

module.exports = anthropic;