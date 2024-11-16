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
        'ТЗИ': {
            tasks: {
                1: { name: 'T1', amount: 5, file: '7.txt' },
                2: { name: 'T2', amount: 5, file: '8.txt' },
                3: { name: 'T3', amount: 5, file: '9.txt' },
                4: { name: 'T4', amount: 5, file: '10.txt' },
                5: { name: 'Отчет по УП пример', amount: 5, file: '11.txt' },
                6: { name: 'Защита помещений', amount: 5, file: '12.txt' },
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
    bot.hears('Выбрать дисциплину', (ctx) => {
        const userId = ctx.from.id;

        if (userState[userId]?.stage === '3 курс') {
            ctx.reply(
                'Выберите дисциплину:',
                Markup.keyboard([['МДК 02.01', 'ТЗИ', 'Главное меню']]).resize()
            );
        } else {
            ctx.reply('Сначала выберите "3 курс".');
        }
    });

    // Обработка выбора дисциплины
    bot.hears(['МДК 02.01', 'ТЗИ'], (ctx) => {
        const userId = ctx.from.id;
        const discipline = ctx.message.text;

        if (userState[userId]?.stage === '3 курс') {
            userState[userId].discipline = discipline;
            ctx.reply(
                `Вы выбрали дисциплину: ${discipline}. Теперь выберите задание.`,
                Markup.keyboard(
                    Object.keys(disciplines[discipline].tasks)
                        .map((id) => [disciplines[discipline].tasks[id].name])
                        .concat([['Главное меню']])
                ).resize()
            );
        } else {
            ctx.reply('Сначала выберите "3 курс".');
        }
    });

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
