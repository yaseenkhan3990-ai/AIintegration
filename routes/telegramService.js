import express from 'express';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const router = express.Router();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const users = {};
const REWARD_EXPIRY = 60 * 1000; 

router.get('/get', (req, res) => {
  res.send('🤖 Lucky Pulse Bot is running');
});

router.get('/page', (req, res) => {
  // const { chatId, token } = req.query;
  const chatId= req.query.chatId;
  //console.log(chatId);

  if (!users[chatId]?.reward) {
    return res.status(403).render("errorPage");
  }

  const { rewardToken, expiresAt } = users[chatId].reward;
   
  // if (token !== rewardToken) return res.status(403).send("Invalid token");
  if (Date.now() > expiresAt) return res.status(403).send("errorPage");

  delete users[chatId].reward;

  res.render('landingPage');
});


bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  if (!users[chatId]) users[chatId] = { coins: 0, streak: 0 };

  bot.sendMessage(
    chatId,
    "⚡ *Welcome to Lucky Pulse!* ⚡\n\nPick a number and feel the rush 🎰",
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎯 Play", callback_data: "play" }]
        ]
      }
    }
  );
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  bot.answerCallbackQuery(query.id);

  if (!users[chatId]) users[chatId] = { coins: 0, streak: 0 };

  if (data === "play") {
    const keyboard = [];
    for (let i = 1; i <= 9; i += 3) {
      keyboard.push([
        { text: `${i}`, callback_data: `pick_${i}` },
        { text: `${i + 1}`, callback_data: `pick_${i + 1}` },
        { text: `${i + 2}`, callback_data: `pick_${i + 2}` }
      ]);
    }

    return bot.sendMessage(chatId, "🔢 Pick a number (1–9)", {
      reply_markup: { inline_keyboard: keyboard }
    });
  }

  if (data.startsWith("pick_")) {
    const userPick = Number(data.split("_")[1]);
    // const luckyNumber = Math.floor(Math.random() * 9) + 1;
        const luckyNumber =3;

    let message = `🎰 *Lucky Number:* ${luckyNumber}\n🎯 *Your Pick:* ${userPick}\n\n`;

    if (userPick === luckyNumber) {
      users[chatId].coins += 10;
      users[chatId].streak += 1;

      const rewardToken = `${chatId}`;
      users[chatId].reward ={
        // rewardToken,
        expiresAt: Date.now() + REWARD_EXPIRY
      };
      console.log(users[chatId].reward);
      const rewardUrl = `https://google.com/page?chatId=${chatId}`;

      message += "🎉 *JACKPOT!* +10 Coins\n🔥 Streak +1\n\n";
      message += "🎁 *You won a reward!* Click below to claim 👇";
      console.log(users[chatId]);
      return bot.sendMessage(chatId, message, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎁 Claim Reward", url: rewardUrl }],
            [{ text: "🔁 Play Again", callback_data: "play" }]
          ]
        }
      });
    } 
    else if (Math.abs(userPick - luckyNumber) === 1) {
      message += "😱 *SO CLOSE!* +2 Coins";
    } 
    else {
      users[chatId].streak = 0;
      message += "❌ Missed! Try again!";
    }

    message += `\n\n💰 *Coins:* ${users[chatId].coins}`;

    return bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔁 Play Again", callback_data: "play" }]
        ]
      }
    });
  }
});

export default router;
