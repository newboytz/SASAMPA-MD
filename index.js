const express = require("express");
const app = express();
const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

const PORT = process.env.PORT || 3000;

// Muonekano wa Website (HTML/CSS)
app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SASAMPA-MD PAIRING</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); color: white; font-family: 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .card { background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); backdrop-filter: blur(10px); text-align: center; border: 1px solid rgba(255,255,255,0.1); width: 90%; max-width: 400px; }
                h1 { color: #25d366; margin-bottom: 10px; }
                input { width: 100%; padding: 12px; margin: 20px 0; border-radius: 8px; border: none; outline: none; font-size: 16px; box-sizing: border-box; }
                button { width: 100%; padding: 12px; background: #25d366; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; font-size: 16px; transition: 0.3s; }
                button:hover { background: #1ebe57; transform: scale(1.02); }
                .footer { margin-top: 20px; font-size: 12px; opacity: 0.7; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>SASAMPA-MD</h1>
                <p>Ingiza namba ya WhatsApp uanze (e.g. 255712345678)</p>
                <form action="/pair" method="get">
                    <input type="text" name="number" placeholder="255XXXXXXXXX" required>
                    <button type="submit">PATA PAIRING CODE</button>
                </form>
                <div class="footer">Powered by Sasampa Core System</div>
            </div>
        </body>
        </html>
    `);
});

// Sehemu ya kutoa Pairing Code
app.get("/pair", async (req, res) => {
    let num = req.query.number;
    if (!num) return res.send("Namba inahitajika!");

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    try {
        if (!sock.authState.creds.registered) {
            await delay(3000);
            num = num.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(num);
            
            res.send(`
                <body style="background: #0f2027; color: white; font-family: sans-serif; text-align: center; padding-top: 100px;">
                    <div style="display: inline-block; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; border: 1px solid #25d366;">
                        <h1 style="color: #25d366;">CODE YAKO NI:</h1>
                        <h2 style="background: white; color: black; padding: 15px; border-radius: 10px; letter-spacing: 8px; font-size: 35px;">${code}</h2>
                        <p>Fungua WhatsApp > Linked Devices > Link with Phone Number na uweke kodi hii.</p>
                        <a href="/" style="color: #25d366; text-decoration: none;">Rudia Upya</a>
                    </div>
                </body>
            `);
        }
    } catch (err) {
        res.send("Error imetokea: " + err.message);
    }

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            // Hii sehemu inamfanya mtu afollow channel yako akishaunganisha tu
            await sock.newsletterFollow("0029Vb7MBWK4yltXZB8Jmo1L@newsletter");
            console.log("Mtumiaji Ameunganishwa!");
        }
    });
});

app.listen(PORT, () => console.log("Server inafanya kazi kwenye port " + PORT));
                        
