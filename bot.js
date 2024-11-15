require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const bot = new Telegraf(process.env.BOT_TOKEN);
const thirdYear = require('./3kurs');
const fourthYear = require('./4kurs');

// Приветственное сообщение с кнопками
bot.start((ctx) => {
    ctx.reply(
        'Привет!\nЯ бот который поможет тебе в выполнении всех заданий Марата Ильясовича и Льва Николаевича(Белозерцева)\nНажми кнопку ниже, чтобы начать.',
        Markup.keyboard([['Начать', 'Что я умею?', 'Поддержка']]) // Клавиатура с кнопкой "Начать"
            .oneTime() // Клавиатура исчезнет после выбора
            .resize()  // Подгоняет клавиатуру под экран
    );
});

// Обработка нажатия кнопки "Начать"
bot.hears('Начать', (ctx) => {
    ctx.reply(
        'Окей, теперь давай выберем твой курс.\nЧтобы вернуться в главное меню напиши "назад"',
        Markup.keyboard([['3 курс', '4 курс']])
            .resize()
    );
});

// Подключение логики
thirdYear(bot);
fourthYear(bot);

//логика ответов на кнопки 
bot.hears('Главное меню', (ctx) => {
    ctx.reply(
        'Ты вернулся в главное меню\nВыбери нужную функцию.',
        Markup.keyboard([['Начать', 'Что я умею?', 'Поддержка']]) // Клавиатура с кнопкой "Начать"
            .oneTime() // Клавиатура исчезнет после выбора
            .resize()  // Подгоняет клавиатуру под экран
    );
});

bot.hears('Что я умею?', (ctx) => {
    ctx.reply(
        'Я пока хуй знает че я могу',
    );
});

bot.hears('Поддержка', (ctx) => {
    ctx.reply(
        'Агент поддержки: https://t.me/f34324',
    );
});

bot.on('text', (ctx) => {
    ctx.reply(
        'Извини, я тебя не понял.\nПерейди в главное меню и выбери функцию.',
        Markup.keyboard([['Главное меню']])
        .resize()
    )
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
bot.launch()