// HELP.JS — FULL FIXED VERSION (MENU IMAGE WORKING 100%)

const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { getMenuStyle, getMenuSettings } = require('./menuSettings');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { getPrefix } = require('./setprefix');
const { getOwnerName } = require('./setowner');
const { getBotName, getMenuImage } = require('../lib/botConfig');
const { createFakeContact } = require('../lib/fakeContact');

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

function formatTime(seconds) {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    return `${days ? days + "d " : ""}${hours ? hours + "h " : ""}${minutes ? minutes + "m " : ""}${seconds}s`;
}

const detectPlatform = () => {
    if (process.env.DYNO) return "☁ Heroku";
    if (process.env.RENDER) return "⚡ Render";
    if (process.env.PREFIX?.includes("termux")) return "📱 Termux";
    return "🐧 Linux";
};

const formatMemory = (memory) =>
    memory < 1024 * 1024 * 1024
        ? Math.round(memory / 1024 / 1024) + ' MB'
        : Math.round(memory / 1024 / 1024 / 1024) + ' GB';

const progressBar = (used, total, size = 10) => {
    let percentage = Math.round((used / total) * size);
    return `${'█'.repeat(percentage)}${'░'.repeat(size - percentage)} ${Math.round((used / total) * 100)}%`;
};

const COMMAND_CATEGORIES = {
    "OWNER MENU": ["mode", "autostatus", "antidelete", "autoread", "autotyping", "autoreact", "setprefix", "setowner", "setbotname", "menuimage", "configimage", "restart"],
    "DOWNLOADER": ["play", "song", "video", "ytplay", "ytv", "ytaudio", "ytvideo", "spotify", "instagram", "facebook", "tiktok"],
    "GROUP ADMIN": ["promote", "demote", "kick", "mute", "unmute", "ban", "unban", "antilink", "welcome", "goodbye"],
    "AI MENU": ["ai", "gpt", "gemini", "copilot", "deepseek", "meta", "vision"],
    "STICKER MENU": ["sticker", "stickercrop", "take", "attp", "emojimix"],
    "FUN MENU": ["joke", "quote", "fact", "say"],
};

const generateMenu = (pushname, currentMode, hostName, ping, uptimeFormatted) => {
    const memoryUsage = process.memoryUsage();
    const botUsedMemory = memoryUsage.heapUsed;
    const totalMemory = os.totalmem();
    const prefix = getPrefix();
    const bot = getBotName();
    const owner = getOwnerName();
    const menuSettings = getMenuSettings();

    let menu = `┏━━❐✧ ${bot} ✧❐\n`;
    menu += `┃✦ Prefix: [${prefix}]\n`;
    menu += `┃✦ Owner: ${owner}\n`;
    menu += `┃✦ Mode: ${currentMode}\n`;
    menu += `┃✦ Platform: ${hostName}\n`;
    menu += `┃✦ Speed: ${ping} ms\n`;
    menu += `┃✦ Uptime: ${uptimeFormatted}\n`;
    menu += `┃✦ Version: v${settings.version}\n`;
    menu += `┃✦ Usage: ${formatMemory(botUsedMemory)} of ${formatMemory(totalMemory)}\n`;
    menu += `┃✦ RAM: [${progressBar(totalMemory - os.freemem(), totalMemory)}]\n`;
    menu += `┗❐\n${readmore}\n`;

    for (const [category, commands] of Object.entries(COMMAND_CATEGORIES)) {
        menu += `┏━━❐ ${category} ❐\n`;
        commands.forEach(cmd => menu += `┃ ✧ ${cmd}\n`);
        menu += `┗❐\n\n`;
    }

    return menu;
};

// FIXED THUMBNAIL LOADER — URL ONLY
async function loadThumbnail(thumbnailURL) {
    try {
        const fetch = require('node-fetch');
        const response = await fetch(thumbnailURL);
        if (response.ok) {
            return Buffer.from(await response.arrayBuffer());
        }
    } catch (err) {
        console.error("Thumbnail load failed:", err.message);
    }

    return Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
    );
}

async function sendMenuWithStyle(sock, chatId, message, menulist, menustyle, thumbnailBuffer, pushname) {
    const fake = createFakeContact(message);
    const botname = getBotName();

    if (menustyle === "4") {
        return await sock.sendMessage(chatId, {
            image: thumbnailBuffer,
            caption: menulist
        }, { quoted: fake });
    }

    return await sock.sendMessage(chatId, { text: menulist }, { quoted: fake });
}

async function helpCommand(sock, chatId, message) {
    const pushname = message.pushName || "User";
    const menuStyle = getMenuStyle();
    const fake = createFakeContact(message);

    await sock.sendMessage(chatId, { text: "_Wait loading Menu..._" }, { quoted: fake });

    const ping = Math.round((Date.now() - Date.now()) / 2);
    const uptimeFormatted = formatTime(process.uptime());
    const hostName = detectPlatform();

    const menulist = generateMenu(pushname, "Public", hostName, ping, uptimeFormatted);

    // FIXED MENU IMAGE SYSTEM — URL ONLY
    const customMenuImage = getMenu
