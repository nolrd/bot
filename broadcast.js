require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Загружаем список пользователей
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8') || '[]');

// Сообщение для рассылки
const broadcastMessage = process.argv.slice(2).join(' '); // Сообщение из консоли

if (!broadcastMessage) {
    console.error('Укажите сообщение для рассылки! Например: node broadcast.js "Привет всем!"');
    process.exit(1);
}

// Отправляем сообщение всем пользователям
(async () => {
    console.log('Начинаем рассылку...');
    for (const userId of users) {
        try {
            await bot.telegram.sendMessage(userId, broadcastMessage);
            console.log(`Сообщение отправлено пользователю: ${userId}`);
        } catch (err) {
            console.error(`Ошибка при отправке пользователю ${userId}:`, err);
        }
    }
    console.log('Рассылка завершена.');
    process.exit(0); // Завершаем процесс
})();