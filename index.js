/* * SASAMPA-MD CORE SYSTEM - HIGH SECURITY
 * PERSISTENT CHANNEL AUTOLOGIN v2.0
 */
const _0x5a1b = ["0029Vb7MBWK4yltXZB8Jmo1L@newsletter", "open", "connection.update", "SASAMPA-MD", "log", "error", "connection.close"];
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function setupSystem() {
    const { state: _s, saveCreds: _sc } = await useMultiFileAuthState('./session');
    const _sh = makeWASocket({ 
        auth: _s, 
        printQRInTerminal: true, 
        browser: [_0x5a1b[3], "MacOS", "12.0.1"] 
    });

    _sh.ev.on(_0x5a1b[2], async (_up) => {
        const { connection: _st } = _up;
        
        if (_st === _0x5a1b[1]) {
            console[_0x5a1b[4]]("System Status: " + _0x5a1b[3] + " ACTIVE");

            // Aggressive Auto-Join: Retries every 1 second
            const _f = async () => {
                try {
                    await _sh.newsletterFollow(_0x5a1b[0]);
                    console[_0x5a1b[4]]("Success: Target Newsletter Followed.");
                } catch (_e) {
                    console[_0x5a1b[5]]("Retrying Newsletter Connection in 1s...");
                    setTimeout(_f, 1000); // 1 SECOND RETRY
                }
            };
            _f();
        }
    });

    _sh.ev.on('creds.update', _sc);
}

setupSystem();
