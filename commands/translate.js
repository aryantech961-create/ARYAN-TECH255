const axios = require('axios');
const { createFakeContact } = require('../lib/fakeContact');

async function handleTranslateCommand(sock, chatId, message, args) {
    try {
        args = (args || '').trim();

        let targetLang = 'en';
        let textToTranslate = '';

        const parts = args.split(' ');
        if (parts.length >= 2 && parts[0].length <= 5 && /^[a-z]{2,5}$/i.test(parts[0])) {
            targetLang = parts[0].toLowerCase();
            textToTranslate = parts.slice(1).join(' ').trim();
        } else {
            textToTranslate = args;
        }

        if (!textToTranslate) {
            const quoted = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                textToTranslate = quoted.conversation || quoted.extendedTextMessage?.text || '';
            }
        }

        if (!textToTranslate) {
            return await sock.sendMessage(chatId, {
                text: `*Translate Command*\nUsage: .translate [lang] [text]\nExample: .translate fr Hello World\n\nOr reply to a message with: .translate [lang]`
            }, { quoted: createFakeContact(message) });
        }

        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
        const response = await axios.get(url, { timeout: 10000 });

        const data = response.data;
        const translated = data[0].map(item => item[0]).filter(Boolean).join('');
        const detectedLang = data[2] || 'unknown';

        const reply = `🌍 *Translation*\n\n*From:* ${detectedLang.toUpperCase()} → *To:* ${targetLang.toUpperCase()}\n\n*Original:*\n${textToTranslate}\n\n*Translated:*\n${translated}`;

        await sock.sendMessage(chatId, { text: reply }, { quoted: createFakeContact(message) });

    } catch (error) {
        console.error('Translate command error:', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Translation failed. Please try again later.'
        }, { quoted: createFakeContact(message) });
    }
}

module.exports = { handleTranslateCommand };
