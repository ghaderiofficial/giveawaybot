export default {
  async fetch(request, env) {

    if (request.method !== "POST") {
      return new Response("Bot Running");
    }

    const update = await request.json();

    // ========================
    // TOKEN
    // ========================
    const TOKEN = "8017198952:AAFlw_KWRdQv2jPHCJ3iiK9kGPCurbh8hcA";

    // ========================
    // HELPERS
    // ========================
    async function tg(method, data) {
      return await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }

    // ========================
    // /START
    // ========================
    if (update.message && update.message.text === "/start") {
      await tg("sendMessage", {
        chat_id: update.message.chat.id,
        text: "🎉 ربات قرعه‌کشی فعال شد!"
      });
    }

    // ========================
    // CREATE GIVEAWAY
    // ========================
    if (update.message && update.message.text === "/giveaway") {

      const chatId = update.message.chat.id;
      const giveawayId = Date.now().toString();

      await env.GIVEAWAY.put(giveawayId, JSON.stringify({
        chatId,
        users: []
      }));

      await tg("sendMessage", {
        chat_id: chatId,
        text: "🏆 قرعه‌کشی شروع شد!\nروی دکمه زیر بزن برای شرکت 👇",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎉 شرکت در قرعه‌کشی",
                callback_data: giveawayId
              }
            ]
          ]
        }
      });
    }

    // ========================
    // JOIN GIVEAWAY
    // ========================
    if (update.callback_query) {

      const data = update.callback_query.data;
      const userId = update.callback_query.from.id;

      let giveaway = await env.GIVEAWAY.get(data);
      giveaway = JSON.parse(giveaway);

      if (!giveaway.users.includes(userId)) {
        giveaway.users.push(userId);
      }

      await env.GIVEAWAY.put(data, JSON.stringify(giveaway));

      await tg("answerCallbackQuery", {
        callback_query_id: update.callback_query.id,
        text: "✅ ثبت شد!"
      });
    }

    return new Response("ok");
  }
};
