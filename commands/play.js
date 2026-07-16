const yts = require('yt-search');
const axios = require('axios');
const { createFakeContact } = require('../lib/fakeContact');

async function playCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        const fakekontak = createFakeContact(message);
        
        if (!searchQuery) {
            return await sock.sendMessage(chatId, { 
                text: "What song do you want to download?"
            }, { quoted: fakekontak });
        }

        await sock.sendMessage(chatId, {
            react: { text: "🎼", key: message.key }
        });

        // Search for the song
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "No songs found!"
            }, { quoted: fakekontak });
        }

        const video = videos[0];
        const urlYt = video.url;
        const title = video.title;

        await sock.sendMessage(chatId, { 
            text: `_Downloading 🎵_\n_${title} 🎶_`
        }, { quoted: fakekontak });

        // 🔥 NEW IP FROM SECOND FILE
        const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(urlYt)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.status || !data.audio) {
            return await sock.sendMessage(chatId, { 
                text: "Failed to fetch audio from the API. Please try again later."
            }, { quoted: fakekontak });
        }

        const audioUrl = data.audio;

        await sock.sendMessage(chatId, {
            document: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption: `🎵 *${title}*`
        }, { quoted: fakekontak });

    } catch (error) {
        console.error('Error in playCommand:', error);
        await sock.sendMessage(chatId, { 
            text: "Download failed. Please try again later."
        }, { quoted: fakekontak });
    }
}

module.exports = playCommand;
