const moment = require('moment-timezone');
const fetch = require('node-fetch');

async function githubCommand(sock, chatId, message) {

function createFakeContact(message) {
    return {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "ARYAN-X ULTRA"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:∆RY∆N-X ULTRA
END:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
}

try {
    const fkontak = createFakeContact(message);
    const pushname = message.pushName || "Unknown User";

    const res = await fetch("https://api.github.com/repos/aryankingkilalu/ARYAN-MD");

    if (!res.ok) throw new Error("GitHub API Error");

    const json = await res.json();

    let txt = `🚀 *∆RY∆N-X ULTRA REPO INFO*\n\n`;
    txt += `◦ *Name:* ${json.name}\n`;
    txt += `◦ *Stars:* ${json.stargazers_count}\n`;
    txt += `◦ *Forks:* ${json.forks_count}\n`;
    txt += `◦ *Watchers:* ${json.watchers_count}\n`;
    txt += `◦ *Size:* ${(json.size / 1024).toFixed(2)} MB\n`;
    txt += `◦ *Updated:* ${moment(json.updated_at).format("DD/MM/YYYY HH:mm")}\n`;
    txt += `◦ *Repo:* ${json.html_url}\n\n`;
    txt += `*Description:*\n${json.description || "No description"}\n\n`;
    txt += `Hey ${pushname}, thanks for using ∆RY∆N-X ULTRA ❤️`;

    await sock.sendMessage(chatId, {
        text: txt
    }, { quoted: fkontak });

    await sock.sendMessage(chatId, {
        react: {
            text: "✅",
            key: message.key
        }
    });

} catch (err) {
    console.log(err);

    await sock.sendMessage(chatId, {
        text: "❌ Repository not found or GitHub API failed."
    }, { quoted: message });
}
}

module.exports = githubCommand;
