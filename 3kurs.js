const { Markup } = require('telegraf');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

module.exports = (bot) => {
    // Список заданий для каждой дисциплины
    const disciplines = {
        'МДК 02.01': {
            tasks: {
                1: { name: 'Шифр Виженера', amount: 5, file: '1.txt' },
                2: { name: 'Камасутра', amount: 5, file: '2.txt' },
                3: { name: 'Криптография', amount: 5, file: '3.txt' },
                4: { name: 'Шифрование', amount: 5, file: '4.txt' },
                5: { name: 'Шифр Цезаря', amount: 5, file: '5.txt' },
                6: { name: 'Шифр Малика', amount: 5, file: '6.txt' },
            },
        },
        'Аттестации': {
            tasks: {
                1: { name: 'Тест 1', amount: 500, file: 'att1.txt' },
                2: { name: 'Тест 2', amount: 500, file: 'att2.txt' },
            },
        },
        'Тесты': {
            tasks: {
                1: { name: 'Тест 1', amount: 200, file: 'test1.txt' },
                2: { name: 'Тест 2', amount: 200, file: 'test2.txt' },
                3: { name: 'Тест 3', amount: 200, file: 'test3.txt' },
                4: { name: 'Тест 4', amount: 200, file: 'test4.txt' },
                5: { name: 'Тест 5', amount: 200, file: 'test5.txt' },
                6: { name: 'Тест 6', amount: 200, file: 'test6.txt' },
                7: { name: 'Тест 7', amount: 200, file: 'test7.txt' },
                7: { name: 'Зачетный тест', amount: 500, file: 'test8.txt' },
            },
        },
        'Лекции': {
            tasks: {
                1: { name: 'ЛК1', amount: 100, file: 'LK1.txt' },
                2: { name: 'ЛК2', amount: 100, file: 'LK2.txt' },
                3: { name: 'ЛК3', amount: 100, file: 'LK3.txt' },
                4: { name: 'ЛК4', amount: 100, file: 'LK4.txt' },
                5: { name: 'ЛК5', amount: 100, file: 'LK5.txt' },
                6: { name: 'ЛК6', amount: 100, file: 'LK6.txt' },
                7: { name: 'ЛК7', amount: 100, file: 'LK7.txt' },
                8: { name: 'ЛК8', amount: 100, file: 'LK8.txt' },
                9: { name: 'ЛК9', amount: 100, file: 'LK9.txt' },
                10: { name: 'ЛК10', amount: 100, file: 'LK10.txt' },
                11: { name: 'ЛК11', amount: 100, file: 'LK11.txt' },
                12: { name: 'ЛК12', amount: 100, file: 'LK12.txt' },
                13: { name: 'ЛК13', amount: 100, file: 'LK13.txt' },
                14: { name: 'ЛК14', amount: 100, file: 'LK14.txt' },
                15: { name: 'ЛК15', amount: 100, file: 'LK15.txt' },
                16: { name: 'ЛК16', amount: 100, file: 'LK16.txt' },
                17: { name: 'ЛК17', amount: 100, file: 'LK17.txt' },
                18: { name: 'ЛК18', amount: 100, file: 'LK18.txt' },
                19: { name: 'ЛК19', amount: 100, file: 'LK19.txt' },
                20: { name: 'ЛК20', amount: 100, file: 'LK20.txt' },
                21: { name: 'ЛК21', amount: 100, file: 'LK21.txt' },
                22: { name: 'ЛК22', amount: 100, file: 'LK22.txt' },
                23: { name: 'ЛК23', amount: 100, file: 'LK23.txt' },
                24: { name: 'ЛК24', amount: 100, file: 'LK24.txt' },
                25: { name: 'ЛК25', amount: 100, file: 'LK25.txt' },
                26: { name: 'ЛК26', amount: 100, file: 'LK26.txt' },
                27: { name: 'ЛК27', amount: 100, file: 'LK27.txt' },
                28: { name: 'ЛК28', amount: 100, file: 'LK28.txt' },
                29: { name: 'ЛК29', amount: 100, file: 'LK29.txt' },
                30: { name: 'ЛК30', amount: 100, file: 'LK30.txt' },
                31: { name: 'Все лекции', amount: 3000, file: 'LK33.txt' },
            },
        },
        'Практические задания': {
            tasks: {
                1: { name: 'ПЗ1', amount: 300, file: 'PZ1.txt' },
                2: { name: 'ПЗ2', amount: 500, file: 'PZ2.txt' },
                3: { name: 'ПЗ3', amount: 500, file: 'PZ3.txt' },
                4: { name: 'ПЗ4', amount: 500, file: 'PZ4.txt' },
                5: { name: 'ПЗ5', amount: 500, file: 'PZ5.txt' },
                6: { name: 'ПЗ6', amount: 500, file: 'PZ6.txt' },
            },
        },
    };

    // Временное хранилище данных о платежах и выбранных дисциплинах
    const userSessions = {};
    const userState = {};

    // Функция для генерации уникального лейбла
    const generateLabel = () => crypto.randomBytes(16).toString('hex');

    // Обработка выбора курса
    bot.hears('3 курс', (ctx) => {
        const userId = ctx.from.id;
        userState[userId] = { stage: '3 курс' }; // Сохранение состояния
        ctx.reply(
            'Добро пожаловать на 3 курс! Выберите дисциплину.',
            Markup.keyboard([['Выбрать дисциплину', 'Главное меню']]).resize()
        );
    });

    // Сброс состояния и переход в главное меню
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

    // Обработка выбора дисциплины
    bot.hears(['Выбрать дисциплину','Назад к дисциплинам'], (ctx) => {
        const userId = ctx.from.id;

        if (userState[userId]?.stage === '3 курс') {
            ctx.reply(
                'Выберите дисциплину:',
                Markup.keyboard([['МДК 02.01', 'ЭАС','Главное меню']]).resize()
            );
        } else {
            ctx.reply('Сначала выберите "3 курс".');
        }
    });

    // Обработка выбора дисциплины
    bot.hears(['МДК 02.01'], (ctx) => {
        const userId = ctx.from.id;
        const discipline = ctx.message.text;

        if (userState[userId]?.stage === '3 курс') {
            userState[userId].discipline = discipline;
            ctx.reply(
                `Вы выбрали дисциплину: ${discipline}. Теперь выберите задание.`,
                Markup.keyboard(
                    Object.keys(disciplines[discipline].tasks)
                        .map((id) => [disciplines[discipline].tasks[id].name])
                        .concat([['Назад к дисциплинам']])
                ).resize()
            );
        } else {
            ctx.reply('Сначала выберите "3 курс".');
        }
    });

    bot.hears(['ЭАС','Назад к задания ЭАС'], (ctx) => {
        const userId = ctx.from.id;
        ctx.reply(
            'Ты выбрал дисциплину ЭАС.\nТеперь выбери задания.',
            Markup.keyboard([['Аттестации', 'Лекции', 'Практические задания','Тесты', 'Назад к дисциплинам']])
                .oneTime()
                .resize()
        );
    });


    bot.hears(['Аттестации', 'Лекции', 'Практические задания', 'Тесты',], (ctx) => {
        const userId = ctx.from.id;
        const discipline = ctx.message.text;

        if (userState[userId]?.stage === '3 курс') {
            userState[userId].discipline = discipline;
            ctx.reply(
                `Вы выбрали задачу: ${discipline}. Теперь выберите номер задания.`,
                Markup.keyboard(
                    Object.keys(disciplines[discipline].tasks)
                        .map((id) => [disciplines[discipline].tasks[id].name])
                        .concat([['Назад к задания ЭАС']])
                ).resize()
            );
        } else {
            ctx.reply('Сначала выберите "3 курс".');
        }
    });

    // bot.hears(['ЛЕКЦИИ ПО ЭАС',], (ctx) => {
    //     const userId = ctx.from.id;
    //     const discipline = ctx.message.text;

    //     if (userState[userId]?.stage === '3 курс') {
    //         userState[userId].discipline = discipline;
    //         ctx.reply(
    //             `Вы выбрали дисциплину: ${discipline}. Теперь выберите лекцию.`,
    //             Markup.keyboard(
    //                 Object.keys(disciplines[discipline].tasks)
    //                     .map((id) => [disciplines[discipline].tasks[id].name])
    //                     .concat([['Главное меню']])
    //             ).resize()
    //         );
    //     } else {
    //         ctx.reply('Сначала выберите "3 курс".');
    //     }
    // });


    // Общий обработчик для выбора задания
    bot.hears(Object.values(disciplines).flatMap(d => Object.values(d.tasks).map(t => t.name)), (ctx) => {
        const userId = ctx.from.id;
        const discipline = userState[userId]?.discipline;
        const tasks = disciplines[discipline]?.tasks;

        if (!tasks) return;

        const selectedTask = Object.entries(tasks).find(
            ([, task]) => task.name === ctx.message.text
        );

        if (selectedTask) {
            const [taskId, task] = selectedTask;
            const label = generateLabel();

            // Сохраняем информацию о платеже с файлом
            userSessions[userId] = {
                discipline,
                payment: { label, amount: task.amount, taskId, file: task.file }
            };

            // Генерация ссылки на оплату
            const paymentUrl = `https://yoomoney.ru/quickpay/confirm?receiver=4100117637877905&quickpay-form=shop&targets=${encodeURIComponent(task.name)}&paymentType=AC&sum=${task.amount}&label=${label}`;

            ctx.reply(
                `Вы выбрали задание: ${task.name}. Сумма к оплате: ${task.amount} руб.`,
                Markup.inlineKeyboard([
                    [Markup.button.url('Оплатить через ЮMoney', paymentUrl)],
                    [Markup.button.callback(`Проверить платеж`, `check_payment_${taskId}`)],
                ]).resize()
            );
        }
    });

    // Общий обработчик проверки платежей
// Общий обработчик проверки платежей
bot.action(/^check_payment_(\d+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const session = userSessions[userId];
    console.log("Session data:", session);  // Логируем сессию для отладки

    if (!session || !session.payment) {
        return ctx.reply('Вы ещё не начали процесс оплаты.');
    }

    const { label, amount, taskId } = session.payment;
    console.log("Payment data:", { label, amount, taskId });  // Логирование данных платежа

    if (!label || amount === undefined || !taskId) {
        return ctx.reply('Ошибка: данные о платеже неполные.');
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const apiUrl = 'https://yoomoney.ru/api/operation-history';
    const apiToken = process.env.YOOMONEY_API_TOKEN;

    // Проверка на существование задачи перед доступом к файлу
    if (!disciplines[session.discipline] || !disciplines[session.discipline].tasks[taskId]) {
        return ctx.reply('Задание не найдено.');
    }

    const task = disciplines[session.discipline].tasks[taskId];
    const filePath = path.join(__dirname, 'files', task.file);  // Путь к файлу
    console.log("File path:", filePath);  // Логирование пути к файлу

    // Учитываем 3% комиссии платформы
    const amountWithFee = amount * 0.97;

    try {
        const response = await axios.post(
            apiUrl,
            { label, from: currentDate, till: currentDate },
            { headers: { Authorization: `Bearer ${'4100117637877905.6FA2C4B0F0277BD782B403B369436DDA2DC971F283EDEADA6A81C7605AED4A53C4F29485BE7BA87FE9F80B16FDED9AD08B9C9320A3837F605F487CDABC02510E6E96E852746B8643A028CF8501FFE160C6FD3DB42709F96F18C2822048F00DE845B40C4589C54A123256611B7A96263FAE59CA18317BA183CFC63CAC1C76BA48'}` } }
        );

        const operations = response.data.operations;
        const payment = operations.find((op) => op.label === label && op.amount >= amountWithFee);

        if (payment) {
            ctx.reply('Оплата успешно подтверждена! Вот ваш файл с заданием:');
            ctx.replyWithDocument({ source: filePath });
            delete userSessions[userId];  // Удаляем сессию после успешной оплаты
        } else {
            ctx.reply('Платеж не найден или сумма не совпадает.');
        }
    } catch (error) {
        console.error('Ошибка при проверке платежа:', error.response?.data || error);
        ctx.reply('Произошла ошибка при проверке платежа. Попробуйте позже.');
    }
});

};
