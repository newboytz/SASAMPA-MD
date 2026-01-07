const express = require('express');
const app = express();
const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="sw">
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
        .btn-copy:hover { background: #00ffff; color: #000; }
    </style>
</head>
<body>
    <div class="main-card">
        <div style="font-size: 50px;">🤖</div>
        <h1>SASAMPA-MD</h1>
        <p>connect toWhatsApp (Enter the country code 255)</p>
        <input type="number" id="phoneNumber" placeholder="example: 25562xxxxxx">
        <button class="btn-generate" id="genBtn" onclick="getPairCode()">🔑 GENERATE PAIR CODE</button>
        
        <div id="result-container">
            <div id="result"></div>
            <button class="btn-copy" onclick="copyToClipboard()">📋 Copy Code</button>
        </div>
        <div id="status" style="margin-top:10px; font-size:12px; color:yellow;"></div>
    </div>

    <script>
        let currentCode = "";

        async function getPairCode() {
            const num = document.getElementById('phoneNumber').value;
            const status = document.getElementById('status');
            const resultContainer = document.getElementById('result-container');
            const resultBox = document.getElementById('result');

            if (!num) { alert("Enter your number!"); return; }

            status.innerHTML = 'waiting Code, subiri...';
            resultContainer.style.display = 'none';

            try {
                const response = await fetch('/code?number=' + num);
                const data = await response.json();

                if (data.code) {
                    currentCode = data.code;
                    resultBox.innerHTML = 'CODE: ' + data.code;
                    resultContainer.style.display = 'block';
                    status.innerHTML = '';
                    alert("Tayari! Angalia notification ya WhatsApp juu ya kioo chako.");
                } else {
                    status.innerHTML = "Hitilafu imetokea. Jaribu tena.";
                }
            } catch (e) {
                status.innerHTML = "Seva imelala! Refresh na ujaribu tena.";
            }
        }

        function copyToClipboard() {
            if (!currentCode) return;
            navigator.clipboard.writeText(currentCode);
            alert("Kodi imekopiwa: " + currentCode);
        }
    </script>
</body>
</html>
    `);
});

app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.json({ error: "Namba inahitajika" });
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });
    try {
        if (!sock.authState.creds.registered) {
            await delay(1500);
            num = num.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(num);
            res.json({ code: code });
        } else {
            res.json({ error: "Tayari bot imeunganishwa!" });
        }
    } catch (err) {
        res.json({ error: "Imeshindwa kuunganisha." });
    }
});

app.listen(PORT, () => {
    console.log(`Bot imewaka kwenye port ${PORT}`);
});
             
