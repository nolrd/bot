require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const thirdYear = require('./3kurs');
const fourthYear = require('./4kurs');

const bot = new Telegraf(process.env.BOT_TOKEN);
const userState = {}; // Хранилище для состояний пользователей

// Приветственное сообщение
bot.start((ctx) => {
    ctx.reply(
        'Привет! Я бот для помощи с заданиями. Нажми кнопку ниже, чтобы начать.',
        Markup.keyboard([['Начать', 'Что я умею?', 'Поддержка']])
            .oneTime()
            .resize()
    );
});

// Главное меню
bot.hears('Главное меню', (ctx) => {
    const userId = ctx.from.id;
    delete userState[userId]; // Сбрасываем состояние
    ctx.reply(
        'Ты вернулся в главное меню. Выбери нужную функцию.',
        Markup.keyboard([['Начать', 'Что я умею?', 'Поддержка']])
            .oneTime()
            .resize()
    );
});

// Обработка "Начать"
bot.hears('Начать', (ctx) => {
    ctx.reply(
        'Окей, выбери твой курс.\nЧтобы вернуться в главное меню, нажми "Главное меню".',
        Markup.keyboard([['3 курс', '4 курс(в разработке)', 'Главное меню']]).resize()
    );
});

// Обработка "Что я умею?"
bot.hears('Что я умею?', (ctx) => {
    ctx.reply(
        'Я могу помочь тебе с заданиями по разным курсам и дисциплинам.',
        Markup.keyboard([['Главное меню']])
            .oneTime()
            .resize()
    );
});

// Обработка "Поддержка"
bot.hears('Поддержка', (ctx) => {
    ctx.reply(
        'Агент поддержки: https://t.me/f34324',
        Markup.keyboard([['Главное меню']])
            .oneTime()
            .resize()
    );
});

// Логика 3 курса
thirdYear(bot);

// Логика 4 курса
// fourthYear(bot);

// Глобальный обработчик для нераспознанных команд
bot.on('text', (ctx) => {
    ctx.reply(
        'Извини, я тебя не понял. Перейди в главное меню и выбери функцию.',
        Markup.keyboard([['Главное меню']]).resize()
    );
});

bot.on('sticker', (ctx) => {
    ctx.reply(
        'Извини, я тебя не понял. Перейди в главное меню и выбери функцию.',
        Markup.keyboard([['Главное меню']]).resize()
    );
});
// Запуск бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
bot.launch();
