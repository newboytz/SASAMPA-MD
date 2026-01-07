<!DOCTYPE html>
<html lang="sw">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SASAMPA-MD Pair Code</title>
    <style>
        /* CSS kwa ajili ya urembo wa Neon kama picha yako */
        body {
            background-color: #000;
            color: #fff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .main-card {
            background: #0d0d0d;
            border: 2px solid #ff00ff;
            box-shadow: 0 0 25px #ff00ff;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            width: 90%;
            max-width: 400px;
        }
        h1 {
            color: #ff00ff;
            text-shadow: 0 0 10px #ff00ff;
            letter-spacing: 2px;
        }
        input {
            width: 100%;
            padding: 12px;
            background: #1a1a1a;
            border: 1px solid #ff00ff;
            color: #00ffff;
            border-radius: 8px;
            margin-top: 15px;
            box-sizing: border-box;
            outline: none;
        }
        .btn-generate {
            background: #ff00ff;
            color: white;
            border: none;
            padding: 15px;
            width: 100%;
            border-radius: 10px;
            margin-top: 20px;
            font-weight: bold;
            box-shadow: 0 0 15px #ff00ff;
            cursor: pointer;
            transition: 0.3s;
        }
        .btn-generate:active { transform: scale(0.95); }
        #result {
            margin-top: 20px;
            padding: 15px;
            border: 1px dashed #00ffff;
            color: #00ffff;
            border-radius: 8px;
            font-family: monospace;
            font-size: 1.2em;
            min-height: 30px;
        }
        .loading { color: yellow; font-style: italic; }
    </style>
</head>
<body>

    <div class="main-card">
        <div style="font-size: 50px;">🤖</div>
        <h1>SASAMPA-MD</h1>
        <p>Unganisha Bot yako ya WhatsApp</p>

        <div style="text-align: left;">
            <label style="font-size: 13px; color: #ccc;">Enter your WhatsApp (county code):</label>
            <input type="number" id="phoneNumber" placeholder="Mfano: 25571xxxxx8">
        </div>

        <button class="btn-generate" onclick="getPairCode()">🔑 GENERATE PAIR CODE</button>

        <div id="result">Connected...</div>
    </div>

    <script>
        async function getPairCode() {
            const num = document.getElementById('phoneNumber').value;
            const resultBox = document.getElementById('result');

            if (!num) {
                alert("Tafadhali ingiza namba ya simu!");
                return;
            }

            resultBox.innerHTML = '<span class="loading">Inatafuta code, subiri...</span>';

            try {
                // Hapa tunaunganisha na link yako ya render
                // Tunatumia /code?number= kulingana na muundo wa bot nyingi za WhatsApp
                const response = await fetch(`https://sasampa-md.onrender.com/code?number=${num}`);
                const data = await response.json();

                if (data.code) {
                    resultBox.innerHTML = `<b style="font-size: 25px; color: #fff;">${data.code}</b>`;
                    alert("Ingiza code hii kwenye WhatsApp yako (Linked Devices)");
                } else {
                    resultBox.innerHTML = "Imefeli! Jaribu tena baadaye.";
                }
            } catch (error) {
                resultBox.innerHTML = "Hitilafu! Hakikisha seva yako ya Render iko hewani.";
                console.error(error);
            }
        }
    </script>
</body>
</html>
    
