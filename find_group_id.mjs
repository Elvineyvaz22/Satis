const botToken = "8646887442:AAHQBO51dCOqEAZpAE4sTBKADhRn2KigwUs";

async function getGroupId() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
    const data = await res.json();
    
    if (!data.ok) {
      console.log("Xəta:", data.description);
      return;
    }

    const updates = data.result;
    if (updates.length === 0) {
      console.log("Hələ heç bir mesaj yoxdur. Zəhmət olmasa qrupa bir mesaj yazın.");
      return;
    }

    // Son mesajlardan qrup ID-sini tap
    for (let i = updates.length - 1; i >= 0; i--) {
      const chat = updates[i].message?.chat || updates[i].my_chat_member?.chat;
      if (chat && (chat.type === 'group' || chat.type === 'supergroup')) {
        console.log(`✅ Qrup Tapıldı!`);
        console.log(`Ad: ${chat.title}`);
        console.log(`ID: ${chat.id}`);
        return;
      }
    }
    
    console.log("Qrup mesajı tapılmadı. Botun qrupda olduğuna və mesaj yazdığınıza əmin olun.");
  } catch (e) {
    console.error("Fetch Error:", e.message);
  }
}

getGroupId();
