const redisUrl = "https://expert-insect-116500.upstash.io";
const redisToken = "gQAAAAAAAccUAAIgcDExOGViN2FiOWJkNzI0YmU5ODQ5ODliNWJmNTE4NzU4MA";
const botToken = "8646887442:AAHQBO51dCOqEAZpAE4sTBKADhRn2KigwUs";

async function testConnection() {
  console.log("--- Testing Redis ---");
  try {
    const res = await fetch(`${redisUrl}/get/products`, {
      headers: { Authorization: `Bearer ${redisToken}` }
    });
    const data = await res.json();
    console.log("Redis Response:", data.result ? "✅ Success (Data found)" : "✅ Success (Connected, but 'products' key might be empty)");
  } catch (e) {
    console.error("❌ Redis Error:", e.message);
  }

  console.log("\n--- Testing Telegram Bot ---");
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();
    if (data.ok) {
      console.log(`✅ Telegram Success: @${data.result.username} (${data.result.first_name})`);
    } else {
      console.log("❌ Telegram Error:", data.description);
    }
  } catch (e) {
    console.error("❌ Telegram Fetch Error:", e.message);
  }
}

testConnection();
