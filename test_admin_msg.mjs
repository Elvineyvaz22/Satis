const redisUrl = "https://expert-insect-116500.upstash.io";
const redisToken = "gQAAAAAAAccUAAIgcDExOGViN2FiOWJkNzI0YmU5ODQ5ODliNWJmNTE4NzU4MA";
const botToken = "8646887442:AAHQBO51dCOqEAZpAE4sTBKADhRn2KigwUs";
const chatId = "1198667208";

async function testConnection() {
  console.log("--- Testing Redis ---");
  try {
    const res = await fetch(`${redisUrl}/get/products`, {
      headers: { Authorization: `Bearer ${redisToken}` }
    });
    const data = await res.json();
    console.log("Redis Response:", data.result ? "✅ Success" : "✅ Success (Empty)");
  } catch (e) {
    console.error("❌ Redis Error:", e.message);
  }

  console.log("\n--- Testing Telegram Message to Admin ---");
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🚀 **Test Mesajı**: Sistem inteqrasiyası yoxlanılır. Əgər bu mesajı görürsünüzsə, bot və Chat ID düzgün işləyir!",
        parse_mode: 'Markdown'
      })
    });
    const data = await res.json();
    if (data.ok) {
      console.log("✅ Mesaj göndərildi! Telegram-ı yoxlayın.");
    } else {
      console.log("❌ Xəta:", data.description);
      if (data.description.includes("bot was blocked") || data.description.includes("chat not found")) {
        console.log("💡 İpucu: Botu Telegram-da tapın (@lacinsatis_bot) və /start düyməsini sıxın.");
      }
    }
  } catch (e) {
    console.error("❌ Fetch Error:", e.message);
  }
}

testConnection();
