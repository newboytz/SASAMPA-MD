const express = require('express');
const app = express();
const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

const PORT = process.env.PORT || 3000;

// HAPA NDIPO TUNAPOWEKA HTML YAKO ILI ISOMEKE KWENYE BROWSER
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
        h1 { color: #ff00ff; text-shadow: 0 0 10px #ff00ff; }
        input { width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #ff00ff; color: #00ffff; border-radius: 8px; margin-top: 15px; box-sizing: border-box; }
        .btn-generate { background: #ff00ff; color: white; border: none; padding: 15px; width: 100%; border-radius: 10px; margin-top: 20px; font-weight: bold; cursor: pointer; }
        #result { margin-top: 20px; padding: 15px; border: 1px dashed #00ffff; color: #00ffff; min-height: 30px; }
    </style>
</head>
<body>
    <div class="main-card">
        <div style="font-size: 50px;">🤖</div>
        <h1>SASAMPA-MD</h1>
        <p>Weka namba kuanza na 255</p>
        <input type="number" id="phoneNumber" placeholder="Mfano: 255712345678">
        <button class="btn-generate" onclick="getPairCode()">🔑 GENERATE PAIR CODE</button>
        <div id="result">Tayari kwa unganisho...</div>
    </div>

    <script>
        async function getPairCode() {
            const num = document.getElementById('phoneNumber').value;
            const resultBox = document.getElementById('result');
            if (!num) { alert("Weka namba!"); return; }
            resultBox.innerHTML = 'Inatafuta code...';
            try {
                const response = await fetch('/code?number=' + num);
                const data = await response.json();
                if (data.code) {
                    resultBox.innerHTML = '<b style="font-size: 30px; color: white;">' + data.code + '</b>';
                } else {
                    resultBox.innerHTML = "Imeshindwa kupata kodi.";
                }
            } catch (e) {
                resultBox.innerHTML = "Hitilafu imetokea!";
            }
        }
    </script>
</body>
</html>
    `);
});

// HAPA NDIPO BOT INAPOTENGENEZA HIYO PAIR CODE
app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.json({ error: "Namba inahitajika" });

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    try {
        if (!sock.authState.creds.registered) {
            await delay(1500);
            num = num.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(num);
            res.json({ code: code });
        }
    } catch (err) {
        res.json({ error: "Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Bot imewaka kwenye port ${PORT}`);
});
    
