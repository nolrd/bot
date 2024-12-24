require('dotenv').config();
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.on('text', (ctx) => {
    ctx.reply(
        'ВЕДУТЬСЯ ТЕХ.РАБОТЫ!\nMAINTANCE!',
    );
});

// Запуск бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
bot.launch();
