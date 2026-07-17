async function tostatusGroupCommand(sock, chatId, message) {
    const fake = createFakeContact(message);

    try {
        await sock.sendMessage(chatId, { react: { text: '📤', key: message.key } });

        const rawText =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption || '';

        const caption = rawText.trim().split(/\s+/).slice(1).join(' ').trim();

        const contextInfo = message.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;

        if (!caption && !quoted) {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return await sock.sendMessage(chatId, {
                text: `*Usage:*\n` +
                      `◈ Reply to an image/video/audio with *.tostatus*\n` +
                      `◈ *.tostatus <text>* — post a text message\n` +
                      `◈ Reply + *.tostatus <caption>* — media with caption`
            }, { quoted: fake });
        }

        if (quoted) {
            const quotedMsg = {
                key: {
                    remoteJid: chatId,
                    id: contextInfo.stanzaId,
                    fromMe: false,
                    participant: contextInfo.participant || undefined
                },
                message: quoted
            };

            const getBuffer = async () => downloadMediaMessage(
                quotedMsg,
                'buffer',
                {},
                { reuploadRequest: sock.updateMediaMessage }
            );

            if (quoted.imageMessage) {
                const buffer = await getBuffer();
                await sock.sendMessage(chatId, {
                    image: buffer,
                    caption: caption || quoted.imageMessage?.caption || ''
                }, { quoted: fake });
                return await sock.sendMessage(chatId, { text: '✅ Image posted to group.' }, { quoted: fake });
            }

            if (quoted.videoMessage) {
                const buffer = await getBuffer();
                await sock.sendMessage(chatId, {
                    video: buffer,
                    caption: caption || quoted.videoMessage?.caption || ''
                }, { quoted: fake });
                return await sock.sendMessage(chatId, { text: '✅ Video posted to group.' }, { quoted: fake });
            }

            if (quoted.audioMessage) {
                const buffer = await getBuffer();
                await sock.sendMessage(chatId, {
                    audio: buffer,
                    mimetype: quoted.audioMessage?.mimetype || 'audio/mp4',
                    ptt: false
                }, { quoted: fake });
                return await sock.sendMessage(chatId, { text: '✅ Audio posted to group.' }, { quoted: fake });
            }

            const quotedText =
                quoted.conversation ||
                quoted.extendedTextMessage?.text || '';

            const textToPost = caption || quotedText;
            if (textToPost) {
                await sock.sendMessage(chatId, { text: textToPost }, { quoted: fake });
                return await sock.sendMessage(chatId, { text: '✅ Text posted to group.' }, { quoted: fake });
            }

            return await sock.sendMessage(chatId, {
                text: '⚠️ Unsupported media type. Reply to an image, video, audio, or text message.'
            }, { quoted: fake });
        }

        // No quoted message — post caption as text
        await sock.sendMessage(chatId, { text: caption }, { quoted: fake });
        return await sock.sendMessage(chatId, { text: '✅ Text posted to group.' }, { quoted: fake });

    } catch (err) {
        console.error('tostatusGroupCommand error:', err);
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        return await sock.sendMessage(chatId, {
            text: `❌ Failed to post in group: ${err.message || 'Unknown error'}`
        }, { quoted: fake });
    }
}

module.exports = tostatusGroupCommand;
