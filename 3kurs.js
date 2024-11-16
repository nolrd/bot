const { Markup } = require('telegraf');
const path = require('path'); // Для работы с путями к файлам

module.exports = (bot) => {
    // Обработка выбора 3 курса
    bot.hears('3 курс', (ctx) => {
        ctx.reply(
            'Добро пожаловать на 3 курс! Чтобы получить задание, необходимо оплатить.',
            Markup.keyboard([['Выбери задание']]) // Кнопка для выбора задания
                .resize() // Подгоняет клавиатуру под экран
        );
    });

    // Обработка нажатия кнопки "Выбери задание"
    bot.hears('Выбери задание', (ctx) => {
        ctx.reply(
            'Выберите задание: \n1. Лох',
            Markup.keyboard([['1. Лох']]) // Кнопка для задания "1. Лох"
                .resize() // Подгоняет клавиатуру под экран
        );
    });

    // Обработка нажатия на задание "1. Лох"
    bot.hears('1. Лох', (ctx) => {
        // Проверяем, что пользователь оплатил. Для простоты будем использовать переменную.
        const paymentConfirmed = false; // Здесь должно быть условие, проверяющее успешную оплату

        if (!paymentConfirmed) {
            // Генерация ссылки для оплаты через ЮMoney
            const paymentUrl = 'https://yoomoney.ru/quickpay/confirm?receiver=4100117637877905&quickpay-form=shop&targets=Sponsor%20this%20project&paymentType=AC&sum=15&label=e7db8012-53ee-4a1a-afa6-b448232116e7';

            ctx.reply(
                'Для того чтобы получить задание, необходимо сначала оплатить. Пожалуйста, перейдите по следующей ссылке для оплаты через ЮMoney:',
                Markup.inlineKeyboard([
                    [Markup.button.url('Оплатить через ЮMoney', paymentUrl)] // Кнопка с ссылкой на оплату
                ])
            );
        } else {
            const filePath = path.join(__dirname, 'files', 'malikpidor.txt'); // Путь к файлу в папке "files"

            ctx.reply(
                'Вы успешно оплатили. Вот файл с заданием:',
                {
                    reply_markup: {
                        remove_keyboard: true, // Убираем клавиатуру
                    }
                }
            );

            // Отправляем файл
            ctx.replyWithDocument({ source: filePath });
        }
    });
};
