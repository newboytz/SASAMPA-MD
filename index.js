const express = require('express');
const app = express();
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");

const PORT = process.env.PORT || 10000;

// Vigezo vya kudhibiti bot (Switches)
let autoViewStatus = true;
let autoLikeStatus = true;

// --- SEHEMU YA WEB (HTML) ---
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SASAMPA-MD Pair Code</title>
    <style>
        body { background-color: #000; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .main-card { background: #0d0d0d; border: 2px solid #ff00ff; box-shadow: 0 0 25px #ff00ff; padding: 30px; border-radius: 20px; text-align: center; width: 90%; max-width: 400px; }
        h1 { color: #ff00ff; text-shadow: 0 0 10px #ff00ff; font-style: italic; }
        input { width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #ff00ff; color: #00ffff; border-radius: 8px; margin-top: 15px; box-sizing: border-box; outline: none; }
        .btn-generate { background: #ff00ff; color: white; border: none; padding: 15px; width: 100%; border-radius: 10px; margin-top: 20px; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px #ff00ff; }
        #result-container { display: none; margin-top: 20px; }
        #result { padding: 15px; border: 1px dashed #00ffff; color: #00ffff; font-weight: bold; border-radius: 8px; margin-bottom: 10px; font-size: 24px; }
        .btn-copy { background: #333; color: #00ffff; border: 1px solid #00ffff; padding: 10px; width: 100%; border-radius: 10px; cursor: pointer; font-weight: bold; }
    </style>
</head>
<body>
    <div class="main-card">
        <h1>SASAMPA-MD</h1>
        <p>Ingiza namba (Anza na 255)</p>
        <input type="number" id="phoneNumber" placeholder="Mfano: 255626921790">
        <button class="btn-generate" onclick="getPairCode()">🔑 GENERATE CODE</button>
        <div id="result-container">
            <div id="result"></div>
            <button class="btn-copy" onclick="copyToClipboard()">📋 Nakili Kodi</button>
        </div>
        <div id="status" style="margin-top:10px; font-size:12px; color:yellow;"></div>
    </div>
    <script>
        let currentCode = "";
        async function getPairCode() {
            const num = document.getElementById('phoneNumber').value;
            const status = document.getElementById('status');
            const resultContainer = document.getElementById('result-container');
            if (!num) { alert("Weka namba!"); return; }
            status.innerHTML = 'Inatengeneza kodi...';
            try {
                const response = await fetch('/code?number=' + num);
                const data = await response.json();
                if (data.code) {
                    currentCode = data.code;
                    document.getElementById('result').innerHTML = data.code;
                    resultContainer.style.display = 'block';
                    status.innerHTML = 'Tayari! Angalia notification ya WhatsApp.';
                }
            } catch (e) { status.innerHTML = "Server imelala! Refresh."; }
        }
        function copyToClipboard() {
            navigator.clipboard.writeText(currentCode);
            alert("Kodi imekopiwa!");
        }
    </script>
</body>
</html>`);
});

// --- SEHEMU YA LOGIC YA BOT ---
app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.json({ error: "Number is required" });

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS("Desktop") // Inasaidia notification kuja haraka
    });

    sock.ev.on('creds.update', saveCreds);

    // KUDHIBITI STATUS NA AMRI
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const fromMe = msg.key.fromMe;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        // Amri zako
        if (fromMe) {
            if (body === '.view on') autoViewStatus = true;
            if (body === '.view off') autoViewStatus = false;
            if (body === '.like on') autoLikeStatus = true;
            if (body === '.like off') autoLikeStatus = false;
        }

        // Auto View/Like Status
        if (msg.key.remoteJid === 'status@broadcast' && autoViewStatus) {
            await sock.readMessages([msg.key]);
            if (autoLikeStatus) {
                await sock.sendMessage('status@broadcast', {
                    react: { key: msg.key, text: '🇹🇿' }
                }, { statusJidList: [msg.participant || msg.key.participant] });
            }
        }
    });

    try {
        await delay(2000); 
        num = num.replace(/[^0-9]/g, '');
        const code = await sock.requestPairingCode(num);
        if (!res.headersSent) res.json({ code: code });
    } catch (err) {
        if (!res.headersSent) res.json({ error: "Failed." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
    
