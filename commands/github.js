const moment = require('moment-timezone');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const { createFakeContact } = require('../lib/fakeContact');

async function githubCommand(sock, chatId, message) {
    const fkontak = createFakeContact(message);

    try {
        const senderJid = (message.key.participant || message.key.remoteJid || '').replace(/:\d+/, '');
        const senderPhone = senderJid.split('@')[0];

        // Weka repo yako hapa
        const { data: json } = await axios.get('https://api.github.com/repos/aryankingkilalu/ARYAN-MD');

        let txt = `🔸 \`∆RY∆N-X REPOSITORY INFO\` 🔸\n\n`;
        txt += `🔹 *Name* : ${json.name}\n`;
        txt += `🔹 *Watchers* : ${json.watchers_count}\n`;
        txt += `🔹 *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
        txt += `🔹 *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
        txt += `🔹 *Repository* : ${json.html_url}\n\n`;
        txt += `🔹 *Forks* : ${json.forks_count}\n`;
        txt += `🔹 *Stars* : ${json.stargazers_count}\n`;
        txt += `🔹 *Description* : ${json.description || 'None'}\n\n`;
        txt += `👋 Hello @${senderPhone}\n`;
        txt += `💜 Thank you for choosing *∆RY∆N-X BOT*.\n`;
        txt += `⭐ Please Fork & Star the Repository.\n`;
        txt += `🚀 Powered By ∆RY∆N-X TECH`;

        const imgPath = path.join(__dirname, '../assets/images.webp');
        const imgBuffer = fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null;

        const messagePayload = {
            caption: txt,
            mentions: [senderJid],
            contextInfo: {
                forwardingScore: 1,
                isForwarded: false,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363XXXXXXXXXX@newsletter', // replace with your real newsletter JID
                    newsletterName: '∆RY∆N-X OFFICIAL',
                    serverMessageId: -1
                }
            }
        };

        if (imgBuffer) {
            messagePayload.image = imgBuffer;
            await sock.sendMessage(chatId, messagePayload, { quoted: fkontak });
        } else {
            const { image, ...textOnlyPayload } = messagePayload;
            await sock.sendMessage(chatId, { text: txt, ...textOnlyPayload }, { quoted: fkontak });
        }

        await sock.sendMessage(chatId, {
            react: { text: '✔️', key: message.key }
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Error fetching repository information.'
        }, { quoted: fkontak });
    }
}

module.exports = githubCommand;
