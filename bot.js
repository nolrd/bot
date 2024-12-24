require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { readFileSync, writeFileSync } = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const referalsFile = './referals.json';
const { exec } = require('child_process');
const { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();
const activeListeners = new Set(); // Для отслеживания активных процессов


const purchasesFilePathSwe = path.join(__dirname, './purchasesSwe.json');
const purchasesFilePathGer = path.join(__dirname, './purchasesGer.json');


const outlineApiConfigSwe = {
    apiUrl: "https://150.241.78.162:43648/3PugAuz6mn-trqnygiY1Zw",
    certSha256: "3997D10C910994D2E8605B6C2AFCAB1E3D6EC390BAA5818C93E2CD3E74CBF850",
};
const outlineApiConfigGer = {
    apiUrl: "https://150.241.71.36:48444/KCKqdq0cCk2EhtTdharWDA",
    certSha256: "647AF5EDBE40FF3D621EF5B7D7D2E08551B3E7829AD1F3428C88583ACF775AC1",
};


const savePurchaseGer = (userId, data) => {
    let purchases = {};

    // Проверяем, существует ли файл покупок
    if (fs.existsSync(purchasesFilePathGer)) {
        // Загружаем существующие покупки
        const fileData = fs.readFileSync(purchasesFilePathGer, 'utf-8');

        purchases = JSON.parse(fileData || '{}');
    }

    // Если покупок для данного пользователя нет, инициализируем массив
    if (!purchases[userId]) {
        purchases[userId] = [];
    }

    // Проверяем, что purchases[userId] действительно массив
    if (!Array.isArray(purchases[userId])) {
        purchases[userId] = []; // Инициализируем как массив
    }

    // Добавляем новую покупку в массив
    purchases[userId].push(data);

    // Сохраняем обновленные данные обратно в файл
    const updatedData = JSON.stringify(purchases, null, 2);
    fs.writeFileSync(purchasesFilePathSwe, updatedData, 'utf-8');
};


const savePurchaseSwe = (userId, data) => {
    let purchases = {};

    // Проверяем, существует ли файл покупок
    if (fs.existsSync(purchasesFilePathSwe)) {
        // Загружаем существующие покупки
        const fileData = fs.readFileSync(purchasesFilePathSwe, 'utf-8');

        purchases = JSON.parse(fileData || '{}');
    }

    // Если покупок для данного пользователя нет, инициализируем массив
    if (!purchases[userId]) {
        purchases[userId] = [];
    }

    // Проверяем, что purchases[userId] действительно массив
    if (!Array.isArray(purchases[userId])) {
        purchases[userId] = []; // Инициализируем как массив
    }

    // Добавляем новую покупку в массив
    purchases[userId].push(data);

    // Сохраняем обновленные данные обратно в файл
    const updatedData = JSON.stringify(purchases, null, 2);
    fs.writeFileSync(purchasesFilePathSwe, updatedData, 'utf-8');
};

const generateOutlineKeySwe = async (amount) => {
    const durationMapping = {
        1: 15 * 24 * 60 * 60 * 1000,
        100: 30 * 24 * 60 * 60 * 1000, // 1 месяц
        540: 180 * 24 * 60 * 60 * 1000, // 6 месяцев
        960: 365 * 24 * 60 * 60 * 1000, // 1 год
    };

    const duration = durationMapping[amount];
    if (!duration) throw new Error('Неверная сумма оплаты');

    const expirationDate = new Date(Date.now() + duration).toISOString();
    const uniqueId = `VPN-${Date.now()}`; // Генерация уникального ID

    try {
        // Создаем ключ с ID
        const response = await axios.put(
            `${outlineApiConfigSwe.apiUrl}/access-keys/${uniqueId}`,
            {}, // Тело запроса может быть пустым
            {
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Access-Token': outlineApiConfigSwe.certSha256,
                },
                httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false, // Для самоподписанных сертификатов
                }),
            }
        );

        if (response.status === 201) {
            console.log(`Ключ с ID ${uniqueId} успешно создан.`);
            return { 
                id: uniqueId, 
                key: response.data.accessUrl, 
                expirationDate 
            };
        } else {
            throw new Error(`Ошибка при создании ключа: ${response.status}`);
        }
    } catch (err) {
        console.error('Ошибка при создании ключа Outline:', err.response?.data || err.message);
        throw new Error('Ошибка создания ключа');
    }
};



// Функция для генерации ключа через API Outline
const generateOutlineKeyGer = async (amount) => {
    const durationMapping = {
        100: 30 * 24 * 60 * 60 * 1000, // 1 месяц
        540: 180 * 24 * 60 * 60 * 1000, // 6 месяцев
        960: 365 * 24 * 60 * 60 * 1000, // 1 год
    };

    const duration = durationMapping[amount];
    if (!duration) throw new Error('Неверная сумма оплаты');

    const expirationDate = new Date(Date.now() + duration).toISOString();
    const uniqueId = `VPN-${Date.now()}`; // Генерация уникального ID

    try {
        // Создаем ключ с ID
        const response = await axios.put(
            `${outlineApiConfigGer.apiUrl}/access-keys/${uniqueId}`,
            {}, // Тело запроса может быть пустым
            {
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Access-Token': outlineApiConfigGer.certSha256,
                },
                httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false, // Для самоподписанных сертификатов
                }),
            }
        );

        if (response.status === 201) {
            console.log(`Ключ с ID ${uniqueId} успешно создан.`);
            return { 
                id: uniqueId, 
                key: response.data.accessUrl, 
                expirationDate 
            };
        } else {
            throw new Error(`Ошибка при создании ключа: ${response.status}`);
        }
    } catch (err) {
        console.error('Ошибка при создании ключа Outline:', err.response?.data || err.message);
        throw new Error('Ошибка создания ключа');
    }
};

module.exports = { generateOutlineKeySwe };
module.exports = { generateOutlineKeyGer };
const generateLabel = () => crypto.randomBytes(16).toString('hex');
const bot = new Telegraf(process.env.BOT_TOKEN);
const userSessions = {};

// bot.use((ctx, next) => {
//     const userId = ctx.from.id;

//     if (!userSessions[userId]) {
//         userSessions[userId] = {};  // Инициализируем сессию, если её нет
//     }

//     return next();
// });


banList = [817678417,1218880444,258763428,1311895313]; 
    bot.use((ctx, next) => { 
    const userId = ctx.from.id;

    // Проверка, есть ли пользователь в вайтлисте
    if (!banList.includes(userId)) {
        ctx.reply('⛔ У вас нет доступа к этому боту.\nДождитесь релиза который пройзойдет в 13:00 МСК.\nС любовью команда MED VPN❤️');
        return; // Прерываем выполнение
    }

    // Инициализация пользовательской сессии, если её нет
    if (!userSessions[userId]) {
        userSessions[userId] = {};
    }

    return next();
});

// //////////////////////////////////////////////////////////////////////////////////////////


// Обработка старта бота
const generateReferralKey = async (userId) => {
    const { key, expirationDate, id } = await generateOutlineKeySwe(100); // 30 дней для приглашённого
    savePurchaseSwe(userId, {
        purchaseDate: new Date().toISOString(),
        expirationDate,
        accessKey: key,
        id: id,
        County: 'Sweden',
    });
    return key; // Возвращаем ключ
};

const generateReferralKey1 = async (userId) => {
    const { key, expirationDate, id } = await generateOutlineKeySwe(1); // 30 дней для приглашённого
    savePurchaseSwe(userId, {
        purchaseDate: new Date().toISOString(),
        expirationDate,
        accessKey: key,
        id: id,
        County: 'Sweden',
    });
    return key; // Возвращаем ключ
};

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const referrerId = ctx.startPayload; // Получаем ID пригласившего пользователя (payload)

    // Инициализируем сессию пользователя
    if (!userSessions[userId]) {
        userSessions[userId] = {};
    }

    // Загружаем список пользователей
    let users = [];
    if (fs.existsSync('./users.json')) {
        users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
    }
    // Добавляем кнопку "Админ панель" для администраторов

    // Загружаем или инициализируем список рефералов
    let referals = {};
    if (fs.existsSync(referalsFile)) {
        referals = JSON.parse(fs.readFileSync(referalsFile, 'utf-8'));
    }

    let messageText = '<i>Авторизация</i>...'; // Текст авторизации
    let keyboardOptions = {
        keyboard: [['🏥 Главное меню']],
        resize_keyboard: true,
        one_time_keyboard: false,
    };
    const adminUsers = [817678417,1218880444,258763428,1311895313];

    // Проверяем, является ли пользователь администратором
    if (adminUsers.includes(userId)) {
        // Добавляем кнопку "⚙️ Админ панель" для администраторов
        keyboardOptions.keyboard.unshift(['⚙️ Админ панель']);
    }

    if (users.includes(userId)) {
      } else {
        users.push(userId); // Добавляем пользователя
        fs.writeFileSync('./users.json', JSON.stringify(users, null, 2)); // Сохраняем массив в файл
      }

    if (referrerId && referrerId !== String(userId)) {
        if (!users.includes(Number(referrerId))) {
            console.log(`Реферальный ID ${referrerId} не найден в users.json.`);
        } else if (referals[userId]) {
            console.log(`Пользователь ${userId} уже использовал реферальную ссылку.`);
        } else {
            // Добавляем реферальную связь
            if (!referals[referrerId]) {
                referals[referrerId] = [];
            }
            referals[referrerId].push(userId);
            referals[userId] = referrerId; // Отмечаем, что пользователь использовал реферальную ссылку
            fs.writeFileSync(referalsFile, JSON.stringify(referals, null, 2));
            await processReferral(referrerId, userId, ctx);

            // Текст с реферальной программой
            messageText =
                'Добро пожаловать в MED VPN™\n\n' +
                'Ваш VPN уже готов к работе и будет доступен БЕСПЛАТНО месяц!\n\n' +
                `Нажмите на текст ниже, чтобы скопировать:\n` +
                `Ключ: <code>${await generateReferralKey(userId)}</code>\n\n` +
                '-----------------------------\n' +
                '💰 Наши цены после истечения пробной версии:\n' +
                '├ 1 мес: $5\n' +
                '├ 6 мес: $27 (-10%)\n' +
                '├ 1 год: $48.7 (-20%)\n' +
                '├ 3 года: $109.5 (-40%)';
        }
    }

    // Проверка на использование реферальной программы
    if (users.includes(userId)) {
        // Если пользователь уже существует
        const authMessage = await ctx.reply(messageText, {
            parse_mode: 'HTML',
            reply_markup: keyboardOptions,
        });

        // Сохраняем message_id
        userSessions[userId].lastMessageId = authMessage.message_id;

        // Отправляем сообщение "Наши сервисы..."
        const serviceMessage = await ctx.replyWithPhoto(
            { source: './media/logo.jpg' },
            {
                caption:
                '⛑ <b>M.E.D VPN</b> вылечит все недоступные сервисы на смартфоне и ПК!\n\n' +
                'Прямиком из 🇸🇪 <b>Стокгольма</b> и 🇩🇪 <b>Берлина</b> со скоростью до\n<b>1 ГБ/сек</b> и надёжным шифрованием <b>ShadowSocks</b>\n\n' +
                '🥼Вся актуальная инфа в нашей операционной: @MED_VPN',
                    parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "📱 Купить VPN", callback_data: "buy_vpn" },
                            { text: "📲 Мои VPN", callback_data: "my_vpn" },
                        ],
                        [{ text: "📄 Инструкция", url: "https://telegra.ph/instrukciya-med-vpn-11-28" }],
                        [{ text: "🚑 Помощь", callback_data: "help" }],
                        [{ text: "🥼 Наш канал", url: "https://t.me/MED_VPN" }],
                        [{ text: "🤝 Пригласи друга", callback_data: "invite_friend" }],
                        [{ text: "🔬 Другие сервисы", callback_data: "other_services" }],
                    ],
                },
            }
        );

        // Сохраняем message_id
        userSessions[userId].lastMessageId = serviceMessage.message_id;

        return; // Завершаем выполнение
    }

    // Если пользователь впервые, добавляем его в users.json


    // Отправляем сообщение авторизации
    const authMessage = await ctx.reply(messageText, {
        parse_mode: 'HTML',
        reply_markup: keyboardOptions, // Всегда добавляем кнопку "Главное меню"
    });

    // Сохраняем message_id
    userSessions[userId].lastMessageId = authMessage.message_id;

    // Отправляем сообщение "Наши сервисы..."
    const message = await ctx.replyWithPhoto(
        { 
            source: './media/logo.jpg' },
        {
            caption:
            '⛑ <b>M.E.D VPN</b> вылечит все недоступные сервисы на смартфоне и ПК!\n\n' +
            'Прямиком из 🇸🇪 <b>Стокгольма</b> и 🇩🇪 <b>Берлина</b> со скоростью до\n<b>1 ГБ/сек</b> и надёжным шифрованием <b>ShadowSocks</b>\n\n' +
            '🥼Вся актуальная инфа в нашей операционной: @MED_VPN',
            parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "📱 Купить VPN", callback_data: "buy_vpn" },
                    { text: "📲 Мои VPN", callback_data: "my_vpn" },
                ],
                [{ text: "📄 Инструкция", url: "https://telegra.ph/instrukciya-med-vpn-11-28" }],
                [{ text: "🚑 Помощь", callback_data: "help" }],
                [{ text: "🥼 Наш канал", url: "https://t.me/MED_VPN" }],
                [{ text: "🤝 Пригласи друга", callback_data: "invite_friend" }],
                [{ text: "🔬 Другие сервисы", callback_data: "other_services" }],
                ],
            },
        }
    );

    // Сохраняем message_id
    userSessions[userId].lastMessageId = message.message_id;
});

async function processReferral(referrerId, userId, ctx) {
    const bonusDays = 15;
    const purchasesFilePath = './purchasesSwe.json';

    // Загружаем данные о подписках
    let purchasesSwe = {};

    if (fs.existsSync(purchasesFilePath)) {
        purchasesSwe = JSON.parse(fs.readFileSync(purchasesFilePath, 'utf-8'));
    }

    // Проверяем, есть ли у пригласившего пользователя ключ
    if (!Array.isArray(purchasesSwe[referrerId])) {
        console.log(`Создаем новую запись для пользователя ${referrerId}.`);
        purchasesSwe[referrerId] = []; // Инициализируем пустым массивом
    }
    
    const referrerKey = purchasesSwe[referrerId];
    const lastPurchase = referrerKey[referrerKey.length - 1]; // Берем последнюю запись
    
    if (!lastPurchase) {
        const { id: uniqueId, key: accessKey, expirationDate: generatedExpirationDate } = await generateOutlineKeySwe(1);

        // Рассчитываем новый срок действия с бонусными днями
        const newExpirationDate = new Date(Date.now() + bonusDays * 24 * 60 * 60 * 1000).toISOString();
        
        // Проверяем, существует ли уже массив для данного пользователя
        if (!purchasesSwe[referrerId]) {
            purchasesSwe[referrerId] = []; // Если нет, создаем пустой массив для этого пользователя
        }
        
        // Добавляем новый элемент в массив покупок
        purchasesSwe[referrerId].push({
            purchaseDate: new Date().toISOString(),
            expirationDate: newExpirationDate, // Новый срок действия
            accessKey, // Сохраняем accessKey из generateOutlineKeySwe
            id: uniqueId, // Сохраняем uniqueId из generateOutlineKeySwe
            County: "Sweden",
        });
        await ctx.telegram.sendMessage(
            referrerId,
            `🎉 Вашу реферальную ссылку использовали! Вам добавлена подписка сроком на 15 дней\n` 
        );
    } else {
        console.log(`Обновляем срок действия для пользователя ${referrerId}.`);
        const expiration = lastPurchase.expirationDate;
    
        if (!expiration || isNaN(new Date(expiration).getTime())) {
            console.error(`Некорректная дата expirationDate: ${expiration}`);
            lastPurchase.expirationDate = new Date(Date.now() + bonusDays * 24 * 60 * 60 * 1000).toISOString();
        } else {
            const currentExpirationDate = new Date(expiration);
            currentExpirationDate.setDate(currentExpirationDate.getDate() + bonusDays); // Добавляем 15 дней
            lastPurchase.expirationDate = currentExpirationDate.toISOString();
            await ctx.telegram.sendMessage(
                referrerId,
                `🎉 Вашу реферальную ссылку использовали! Вам добавлено ${bonusDays} дней к вашему VPN.\n` +
                `Ваш новый срок действия: ${new Date(referrerKey[referrerKey.length - 1].expirationDate).toLocaleDateString()}`
            );
        }
    }
    
    // Сохраняем изменения в файл
    fs.writeFileSync('./purchasesSwe.json', JSON.stringify(purchasesSwe, null, 2), 'utf-8');
    
    // Отправляем уведомление пользователю
}

// Обработчик для кнопки "Главное меню"
bot.hears('🏥 Главное меню', async (ctx) => {
    const userId = ctx.from.id;

    // Проверяем, сохранено ли последнее сообщение пользователя в сессии

        // Отправляем новое сообщение с фото и кнопками
        const message = await ctx.replyWithPhoto(
            { source: './media/logo.jpg' }, // Путь к фото
            {
                caption:
                    '⛑ <b>M.E.D VPN</b> вылечит все недоступные сервисы на смартфоне и ПК!\n\n' +
                    'Прямиком из 🇸🇪 <b>Стокгольма</b> и 🇩🇪 <b>Берлина</b> со скоростью до\n<b>1 ГБ/сек</b> и надёжным шифрованием <b>ShadowSocks</b>\n\n' +
                    '🥼Вся актуальная инфа в нашей операционной: @MED_VPN',
                    parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "📱 Купить VPN", callback_data: "buy_vpn" },
                            { text: "📲 Мои VPN", callback_data: "my_vpn" },
                        ],
                        [{ text: "📄 Инструкция", url: "https://telegra.ph/instrukciya-med-vpn-11-28" }],
                        [{ text: "🚑 Помощь", callback_data: "help" }],
                        [{ text: "🥼 Наш канал", url: "https://t.me/MED_VPN" }],
                        [{ text: "🤝 Пригласи друга", callback_data: "invite_friend" }],
                        [{ text: "🔬 Другие сервисы", callback_data: "other_services" }],
                    ]
                }
            }
        );

        // Обновляем сохраненное сообщение в сессии
        userSessions[userId].lastMessageId = message.message_id;
    } 
);


// Обработчик для кнопки "Купить VPN"
bot.action(['buy_vpn','back_to_vpn'], async (ctx) => {
    const userId = ctx.from.id;

    // Проверка наличия messageId в сессии
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Редактируем сообщение, добавляем новые кнопки для выбора страны
        await ctx.telegram.editMessageCaption(
            ctx.chat.id,
            userSessions[userId].lastMessageId,  // Используем сохраненный ID сообщения
            null,                                // Не передаем новое caption
            { 
                type: 'photo', 
                media: { source: './media/logo.jpg' },
                caption: 'Выберите страну для вашего VPN ⬇️',
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [ { text: "🇩🇪 Германия", callback_data: "vpn_germany" } ],
                        [ { text: "🇸🇪 Швеция", callback_data: "vpn_sweden" } ],
                        [ { text: "Назад", callback_data: "back_to_menu" } ]
                    ]
                }
            }
        );
    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});

// Обработчики для выбора страны
bot.action('back_to_menu', async (ctx) => {
    const userId = ctx.from.id;
    delete userSessions[userId]?.payment;

    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Редактируем сообщение, возвращаемся в основное меню
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId,  // Используем сохраненный ID сообщения
            null,                                // Не передаем новое caption
            { 
                type: 'photo', 
                media: { source: './media/logo.jpg' },
                caption:'⛑ <b>M.E.D VPN</b> вылечит все недоступные сервисы!\n\n' +
                'Прямиком из 🇸🇪 <b>Стокгольма</b> и 🇩🇪 <b>Берлина</b> со скоростью до\n<i>1 ГБ/сек</i> и надёжным шифрованием <b>ShadowSocks</b>\n\n' +
                '🥼Вся актуальная инфа в нашей операционной: @MED_VPN',
                parse_mode: 'HTML',
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "📱 Купить VPN", callback_data: "buy_vpn" },
                            { text: "📲 Мои VPN", callback_data: "my_vpn" },
                        ],
                        [{ text: "📄 Инструкция", url: "https://telegra.ph/instrukciya-med-vpn-11-28" }],
                        [{ text: "🚑 Помощь", callback_data: "help" }],
                        [{ text: "🥼 Наш канал", url: "https://t.me/MED_VPN" }],
                        [{ text: "🤝 Пригласи друга", callback_data: "invite_friend" }],
                        [{ text: "🔬 Другие сервисы", callback_data: "other_services" }],
                    ]
                }
            }
        );
    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});
bot.action('help', async (ctx) => {
    const userId = ctx.from.id;

    // Проверка наличия messageId в сессии
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Редактируем сообщение, добавляем новые кнопки для выбора страны
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId,  // Используем сохраненный ID сообщения
            null,                                // Не передаем новое caption
            { 
                type: 'photo', 
                media: { source: './media/logo.jpg' },
                caption: '👨‍⚕️ <i>Остались вопросы? С радостью на них отвечу!</i>',
                parse_mode: 'HTML',
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [ { text: "📨 Связаться с поддержкой", url: "t.me/MED_SUPP" }],
                        [ { text: "Назад", callback_data: "back_to_menu" }],
                    ]
                }
            }
        );
    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});

bot.action('invite_friend', async (ctx) => { 
    const userId = ctx.from.id;

    // Проверка наличия messageId в сессии
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    // Загружаем список рефералов
    let referals = {};
    if (fs.existsSync(referalsFile)) {
        referals = JSON.parse(fs.readFileSync(referalsFile, 'utf-8'));
    }

    // Проверяем количество рефералов
    const invitedFriends = referals[userId] && Array.isArray(referals[userId]) ? referals[userId].length : 0;

    // Генерируем реферальную ссылку
    const referralLink = `https://t.me/med_vpn_bot?start=${userId}`;


    try {
        // Редактируем сообщение
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId, // Используем сохраненный ID сообщения
            null,                              // Не передаем новое caption
            { 
                type: 'photo', 
                media: { source: './media/logo.jpg' },

                caption: 
                    `👨‍⚕️ <i>Составил для вас план лечения</i>\n\n` +
                    `1) Делитесь с другом пригласительной ссылкой👇\n` +
                    `<code>${referralLink}</code>\n\n` +
                    `2) Он авторизуется в боте\n\n` +
                    `3) Каждый из вас получает бесплатный VPN – пригласивший на <b>15 дней</b>, а друг на целый <b>месяц!</b>\n\n` +
                    `👋 Приведено друзей: ${invitedFriends}`,
                parse_mode: 'HTML',
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🧬 Поделиться ссылкой", url: `https://t.me/share/url?url=${referralLink}`, }],
                        [{ text: "Назад", callback_data: "back_to_menu" }],
                    ]
                }
            }
        );
    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});

bot.hears('⚙️ Админ панель', async (ctx) => {
    const userId = ctx.from.id;
    const adminUsers = [817678417,1218880444,258763428,1311895313];
    // Проверяем, является ли пользователь администратором
    if (!adminUsers.includes(userId)) {
        return ctx.reply("У вас нет доступа к админ панели.");
    }

    // Отправляем сообщение с кнопками
    await ctx.reply("Добро пожаловать в админ панель! ⚙️", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔄 Перезагрузить бота", callback_data: "reload_bot" }],
                [{ text: "🔑 Выдать ключ", callback_data: "issue_key" }],
                [{ text: "📢 Сообщение всем", callback_data: "broadcast_message" }]
            ],
        },
    });
});
const adminUsers = [817678417,1218880444,258763428,1311895313]; 
bot.action('reload_bot', async (ctx) => {
    await ctx.reply("🔄 Бот перезагружается...");

    // Останавливаем старого бота и удаляем его слушателей
    await bot.stop(); // Остановка бота
    process.removeAllListeners(); // Удаляем все слушатели для процесса

    // Очистите кэш текущего модуля
    delete require.cache[require.resolve('./bot.js')];

    // Перезапустите бота
    const newBot = require('./bot.js');

    // Сообщаем об успешной перезагрузке
    await ctx.telegram.sendMessage(ctx.chat.id, "✅ Бот успешно перезагружен!");

    return newBot; // Возвращаем новый экземпляр бота
});

bot.action('broadcast_message', async (ctx) => {
    await ctx.reply("Введите сообщение для рассылки всем пользователям:");

    // Подписываемся на событие 'broadcast_message_input'
    eventEmitter.once('broadcast_message_input', async (message, msgCtx) => {
        const senderId = msgCtx.from.id;

        // Загружаем список пользователей
        const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));

        // Рассылка сообщения
        for (const userId of users) {
            if (userId !== senderId) {
                try {
                    await msgCtx.telegram.sendMessage(userId, message);
                } catch (error) {
                    console.error(`Не удалось отправить сообщение пользователю ${userId}:`, error);
                }
            }
        }

        await msgCtx.reply("Сообщение отправлено всем пользователям, кроме вас.");
    });
});

// Ловим текстовые сообщения
bot.on('text', async (ctx) => {
    const message = ctx.message.text.trim();

    // Генерируем событие 'broadcast_message_input'
    eventEmitter.emit('broadcast_message_input', message, ctx);
});



bot.action('issue_key', async (ctx) => {
    const userId = ctx.from.id;

    // Проверка, является ли пользователь администратором
    if (!adminUsers.includes(userId)) {
        return ctx.reply("У вас нет доступа к этой функции.");
    }

    // Проверка на активный процесс для пользователя
    if (activeListeners.has(userId)) {
        return ctx.reply("Вы уже начали процесс выдачи ключа. Завершите текущую операцию.");
    }

    activeListeners.add(userId); // Добавляем пользователя в активные
    await ctx.reply("Введите данные в формате:\n<code>UserID Количество_дней</code>", {
        parse_mode: 'HTML',
    });

    // Добавляем обработчик события для текущего пользователя
    eventEmitter.once(`key_issued_${userId}`, async (input) => {
        const [recipientUserId, duration] = input.split(' ');

        // Проверяем корректность ввода
        if (!recipientUserId || isNaN(recipientUserId) || !duration || isNaN(duration)) {
            await ctx.reply("Некорректный формат. Попробуйте снова. Формат: <code>UserID Количество_дней</code>", {
                parse_mode: 'HTML',
            });
            activeListeners.delete(userId);
            return;
        }

        // Выполнение скрипта key.js с переданными параметрами
        exec(`node key.js ${recipientUserId} ${duration}`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка выполнения скрипта: ${error.message}`);
                await ctx.reply("Произошла ошибка при выполнении скрипта.");
            } else if (stderr) {
                console.error(`Ошибка в скрипте: ${stderr}`);
                await ctx.reply("Произошла ошибка в процессе генерации ключа.");
            } else {
                console.log(`Скрипт выполнен успешно: ${stdout}`);
                await ctx.reply(`Ключ успешно выдан пользователю ${recipientUserId} на ${duration} дней.`);
            }

            activeListeners.delete(userId); // Удаляем пользователя из активных
        });
    });
});

bot.on('text', async (msgCtx) => {
    const userId = msgCtx.from.id;

    // Проверяем, активен ли слушатель для данного пользователя
    if (activeListeners.has(userId)) {
        const input = msgCtx.message.text.trim();  // Извлекаем текст сообщения и удаляем лишние пробелы
        if (input) {
            // Эмитируем событие для этого пользователя с введенными данными
            eventEmitter.emit(`key_issued_${userId}`, input);

            // Завершаем процесс, удаляем слушателя из активных
            activeListeners.delete(userId); 
        } else {
            // Если пользователь не ввел текст, отправляем сообщение
            await msgCtx.reply("Ввод пустой. Попробуйте снова.");
        }
    }
});


bot.action('other_services', async (ctx) => {
    const userId = ctx.from.id;

    // Проверка наличия messageId в сессии
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Редактируем сообщение, добавляем новые кнопки для выбора страны
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId,  // Используем сохраненный ID сообщения
            null,                                // Не передаем новое caption
            { 
                type: 'photo', 
                media: { source: './media/logo.jpg' },
                caption: '👨‍⚕ <i>В разработке</i>',
                parse_mode: 'HTML',
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [ { text: "Назад", callback_data: "back_to_menu" }],
                    ]
                }
            }
        );
    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
bot.action('my_vpn', async (ctx) => {
    const userId = ctx.from.id;

    // Пути к файлам покупок
    const purchasesPathGer = './purchasesGer.json';
    const purchasesPathSwe = './purchasesSwe.json';

    let purchasesGer = [];
    let purchasesSwe = [];

    if (fs.existsSync(purchasesPathGer)) {
        purchasesGer = JSON.parse(fs.readFileSync(purchasesPathGer, 'utf-8'));
    }
    if (fs.existsSync(purchasesPathSwe)) {
        purchasesSwe = JSON.parse(fs.readFileSync(purchasesPathSwe, 'utf-8'));
    }

    // Получаем покупки пользователя
    const userPurchasesGer = purchasesGer[userId] || [];
    const userPurchasesSwe = purchasesSwe[userId] || [];

    // Формируем сообщение с данными ключа и страны
    let message = `⛑ <b>Ваши VPN</b>:\n\n`;

    // Обрабатываем покупки Германии
    if (userPurchasesGer.length > 0) {
        userPurchasesGer.forEach((purchase) => {
            const { accessKey, expirationDate } = purchase;
            message += `🇩🇪 <b>Германия</b>\n` +
                       `💉 <b>Ключ</b> <code>${accessKey}</code>\n` +
                       `⏱️ <b>Действует до</b> ${new Date(expirationDate).toLocaleString()}\n\n`;
        });
    }

    // Обрабатываем покупки Швеции
    if (userPurchasesSwe.length > 0) {
        userPurchasesSwe.forEach((purchase) => {
            const { accessKey, expirationDate } = purchase;
            message += `🇸🇪 <b>Швеция</b>\n` +
                       `💉 <b>Ключ</b> <code>${accessKey}</code>\n` +
                       `⏱️ <b>Действует до</b> ${new Date(expirationDate).toLocaleString()}\n\n`;
        });
    }

    // Если нет покупок
    if (userPurchasesGer.length === 0 && userPurchasesSwe.length === 0) {
        message = '😔 У вас пока нет купленных VPN.\nНо вы можете легко это исправить!';
    }

    // Редактируем сообщение
    if (userSessions[userId]?.lastMessageId) {
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId,
            null,
            { 
                type: 'photo', 
                media: { source: './media/logo.jpg' },
                caption: message,
                parse_mode: 'HTML', 
            },
            { reply_markup: { inline_keyboard: [[{ text: 'Назад', callback_data: 'back_to_menu' }]] } }
        );
    }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
bot.action(['vpn_germany',  'back_to_vpn_ger_pay'], async (ctx) => {
    const userId = ctx.from.id;
    // Проверка наличия messageId в сессии
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Редактируем сообщение, добавляем новые кнопки для выбора страны
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId,  // Используем сохраненный ID сообщения
            null,                                // Не передаем новое caption
            { 
                type: 'photo', 
                media: { source: './media/logo.jpg' },
                caption: '🇩🇪 <b>Германия</b>\n\n👨‍⚕️ <i>Ну что, пациент, как будем лечиться?</i>\n\n├ 1 мес: 100р.\n├ 6 мес: 540р.\n└ 1 год: 960р.',
                parse_mode: 'HTML', 
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [ 
                            { text: "💊 1 мес", callback_data: "vpn_germany_1month" },
                            { text: "💊 6 мес", callback_data: "vpn_germany_6month" }
                        ],
                        [ 
                            { text: "💊 1 год", callback_data: "vpn_germany_1year" },
                        ],
                        [ 
                            { text: 'Назад', callback_data: 'back_to_vpn'  },
                        ],
                    ]
                }
            }
        );
    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});

bot.action(['vpn_sweden',  'back_to_vpn_swe_pay'], async (ctx) => {
    const userId = ctx.from.id;
    // Проверка наличия messageId в сессии
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Редактируем сообщение, добавляем новые кнопки для выбора страны
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId,  // Используем сохраненный ID сообщения
            null,                                // Не передаем новое caption
            { 
                type: 'photo', 
                media: { source: './media/logo.jpg' },
                caption: '🇩🇪 <b>Швеция</b>\n\n👨‍⚕️ <i>Ну что, пациент, как будем лечиться?</i>\n\n├ 1 мес: 100р.\n├ 6 мес: 540р.\n└ 1 год: 960р.',
                parse_mode: 'HTML', 
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [ 
                            { text: "💊 1 мес", callback_data: "vpn_sweden_1month" },
                            { text: "💊 6 мес", callback_data: "vpn_sweden_6month" }
                        ],
                        [ 
                            { text: "💊 1 год", callback_data: "vpn_sweden_1year" },
                        ],
                        [ 
                            { text: 'Назад', callback_data: 'back_to_vpn'  },
                        ],
                    ]
                }
            }
        );
    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});

bot.action('vpn_germany_1month', async (ctx) => {
    const userId = ctx.from.id;
    
    const label = generateLabel();
    const amount = 100; // фиксированная сумма 5 рублей
    
    // Проверяем, сохранён ли ID предыдущего сообщения
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Генерация ссылки на оплату
        const paymentUrl = `https://yoomoney.ru/quickpay/confirm?receiver=4100117637877905&quickpay-form=shop&targets=VPN%20Germany%201%20Month&paymentType=AC&sum=${amount}&label=${label}`;
        
        // Изменяем сообщение, добавляя текст и кнопки
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId, // Используем сохранённый ID сообщения
            null,                              // Inline message ID не передаётся
            {
                type: 'photo', // Тип медиа
                media: { source: './media/logo.jpg' }, // Локальный файл
                caption: `🇩🇪 <b>Германия</b>\n\n👨‍⚕️ <i>Проверьте, всё верно?</i>\n\n└ 1 мес: ${amount}р.`,
                parse_mode: 'HTML', 
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🪪 Оплатить картой', url: paymentUrl },
                        ],
                        [
                            { text: '🔎 Проверить платеж', callback_data: `check_payment_ger_${label}` },
                        ],
                        [ 
                            { text: 'Назад', callback_data: 'back_to_vpn_ger_pay'  },
                        ],
                    ],
                },
            }
        );

        // Сохраняем информацию о платеже
        userSessions[userId].payment = { label, amount };

    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});

bot.action('vpn_germany_6month', async (ctx) => {
    const userId = ctx.from.id;
    
    const label = generateLabel();
    const amount = 540; // фиксированная сумма 5 рублей
    
    // Проверяем, сохранён ли ID предыдущего сообщения
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Генерация ссылки на оплату
        const paymentUrl = `https://yoomoney.ru/quickpay/confirm?receiver=4100117637877905&quickpay-form=shop&targets=VPN%20Germany%201%20Month&paymentType=AC&sum=${amount}&label=${label}`;
        
        // Изменяем сообщение, добавляя текст и кнопки
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId, // Используем сохранённый ID сообщения
            null,                              // Inline message ID не передаётся
            {
                type: 'photo', // Тип медиа
                media: { source: './media/logo.jpg' }, // Локальный файл
                caption: `🇩🇪 <b>Германия</b>\n\n👨‍⚕️ <i>Проверьте, всё верно?</i>\n\n└ 6 мес: ${amount}р.`,
                parse_mode: 'HTML', 
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🪪 Оплатить картой', url: paymentUrl },
                        ],
                        [
                            { text: '🔎 Проверить платеж', callback_data: `check_payment_ger_${label}` },
                        ],
                        [ 
                            { text: 'Назад', callback_data: 'back_to_vpn_ger_pay'  },
                        ],
                    ],
                },
            }
        );

        // Сохраняем информацию о платеже
        userSessions[userId].payment = { label, amount };

    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});

bot.action('vpn_germany_1year', async (ctx) => {
    const userId = ctx.from.id;
    
    const label = generateLabel();
    const amount = 960; // фиксированная сумма 5 рублей
    
    // Проверяем, сохранён ли ID предыдущего сообщения
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Генерация ссылки на оплату
        const paymentUrl = `https://yoomoney.ru/quickpay/confirm?receiver=4100117637877905&quickpay-form=shop&targets=VPN%20Germany%201%20Month&paymentType=AC&sum=${amount}&label=${label}`;
        
        // Изменяем сообщение, добавляя текст и кнопки
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId, // Используем сохранённый ID сообщения
            null,                              // Inline message ID не передаётся
            {
                type: 'photo', // Тип медиа
                media: { source: './media/logo.jpg' }, // Локальный файл
                caption: `🇩🇪 <b>Германия</b>\n\n👨‍⚕️ <i>Проверьте, всё верно?</i>\n\n└ 1 год: ${amount}р.`,
                parse_mode: 'HTML', 
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🪪 Оплатить картой', url: paymentUrl },
                        ],
                        [
                            { text: '🔎 Проверить платеж', callback_data: `check_payment_ger_${label}` },
                        ],
                        [ 
                            { text: 'Назад', callback_data: 'back_to_vpn_ger_pay'  },
                        ],
                    ],
                },
            }
        );

        // Сохраняем информацию о платеже
        userSessions[userId].payment = { label, amount };

    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});

bot.action('vpn_sweden_1month', async (ctx) => {
    const userId = ctx.from.id;
    
    const label = generateLabel();
    const amount = 100; // фиксированная сумма 5 рублей
    
    // Проверяем, сохранён ли ID предыдущего сообщения
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Генерация ссылки на оплату
        const paymentUrl = `https://yoomoney.ru/quickpay/confirm?receiver=4100117637877905&quickpay-form=shop&targets=VPN%20Germany%201%20Month&paymentType=AC&sum=${amount}&label=${label}`;
        
        // Изменяем сообщение, добавляя текст и кнопки
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId, // Используем сохранённый ID сообщения
            null,                              // Inline message ID не передаётся
            {
                type: 'photo', // Тип медиа
                media: { source: './media/logo.jpg' }, // Локальный файл
                caption: `🇸🇪 <b>Швеция</b>\n\n👨‍⚕️ <i>Проверьте, всё верно?</i>\n\n└ 1 мес: ${amount}р.`,
                parse_mode: 'HTML', 
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🪪 Оплатить картой', url: paymentUrl },
                        ],
                        [
                            { text: '🔎 Проверить платеж', callback_data: `check_payment_swe_${label}` },
                        ],
                        [ 
                            { text: 'Назад', callback_data: 'back_to_vpn_swe_pay'  },
                        ],
                    ],
                },
            }
        );

        // Сохраняем информацию о платеже
        userSessions[userId].payment = { label, amount };

    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});

bot.action('vpn_sweden_6month', async (ctx) => {
    const userId = ctx.from.id;
    
    const label = generateLabel();
    const amount = 540; // фиксированная сумма 5 рублей
    
    // Проверяем, сохранён ли ID предыдущего сообщения
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Генерация ссылки на оплату
        const paymentUrl = `https://yoomoney.ru/quickpay/confirm?receiver=4100117637877905&quickpay-form=shop&targets=VPN%20Germany%201%20Month&paymentType=AC&sum=${amount}&label=${label}`;
        
        // Изменяем сообщение, добавляя текст и кнопки
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId, // Используем сохранённый ID сообщения
            null,                              // Inline message ID не передаётся
            {
                type: 'photo', // Тип медиа
                media: { source: './media/logo.jpg' }, // Локальный файл
                caption: `🇸🇪 <b>Швеция</b>\n\n👨‍⚕️ <i>Проверьте, всё верно?</i>\n\n└ 6 мес: ${amount}р.`,
                parse_mode: 'HTML', 
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🪪 Оплатить картой', url: paymentUrl },
                        ],
                        [
                            { text: '🔎 Проверить платеж', callback_data: `check_payment_swe_${label}` },
                        ],
                        [ 
                            { text: 'Назад', callback_data: 'back_to_vpn_swe_pay'  },
                        ],
                    ],
                },
            }
        );

        // Сохраняем информацию о платеже
        userSessions[userId].payment = { label, amount };

    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});

bot.action('vpn_sweden_1year', async (ctx) => {
    const userId = ctx.from.id;
    
    const label = generateLabel();
    const amount = 960; // фиксированная сумма 5 рублей
    
    // Проверяем, сохранён ли ID предыдущего сообщения
    if (!userSessions[userId]?.lastMessageId) {
        return ctx.reply('Напиши /start снова');
    }

    try {
        // Генерация ссылки на оплату
        const paymentUrl = `https://yoomoney.ru/quickpay/confirm?receiver=4100117637877905&quickpay-form=shop&targets=VPN%20Germany%201%20Month&paymentType=AC&sum=${amount}&label=${label}`;
        
        // Изменяем сообщение, добавляя текст и кнопки
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            userSessions[userId].lastMessageId, // Используем сохранённый ID сообщения
            null,                              // Inline message ID не передаётся
            {
                type: 'photo', // Тип медиа
                media: { source: './media/logo.jpg' }, // Локальный файл
                caption: `🇸🇪 <b>Швеция</b>\n\n👨‍⚕️ <i>Проверьте, всё верно?</i>\n\n└ 1 год: ${amount}р.`,
                parse_mode: 'HTML', 
            },
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🪪 Оплатить картой', url: paymentUrl },
                        ],
                        [
                            { text: '🔎 Проверить платеж', callback_data: `check_payment_swe_${label}` },
                        ],
                        [ 
                            { text: 'Назад', callback_data: 'back_to_vpn_swe_pay'  },
                        ],
                    ],
                },
            }
        );

        // Сохраняем информацию о платеже
        userSessions[userId].payment = { label, amount };

    } catch (error) {
        console.error('Ошибка при редактировании сообщения:', error);
    }
});

bot.action(/^check_payment_swe_(.+)$/, async (ctx) => {
    console.log('Получено callback_data:', ctx.callbackQuery.data);
    const userId = ctx.from.id;
    const session = userSessions[userId];

    if (!session || !session.payment) {
        return ctx.reply('Вы ещё не начали процесс оплаты.');
    }

    const { label, amount } = session.payment;

    // Проверяем платеж через YooMoney API
    const currentDate = new Date().toISOString().split('T')[0];
    const apiUrl = 'https://yoomoney.ru/api/operation-history';
    const apiToken = process.env.YOOMONEY_API_TOKEN;

    try {
        const response = await axios.post(
            apiUrl,
            { label, from: currentDate, till: currentDate },
            { headers: { Authorization: `Bearer ${apiToken}` } }
        );

        const operations = response.data.operations;
        const payment = operations.find((op) => op.label === label);

        if (payment) {
            // Генерируем ключ
            const { key, expirationDate,id } = await generateOutlineKeySwe(amount);

            // Сохраняем покупку
            savePurchaseSwe(userId, {
                purchaseDate: currentDate,
                expirationDate,
                accessKey: key,
                id: id,
                County: 'Sweden',
            });

            await ctx.telegram.editMessageMedia(
                ctx.chat.id,
                userSessions[userId].lastMessageId, // Используем сохраненный ID сообщения
                null, // Не передаем новое caption
                { 
                    type: 'photo', 
                    media: { source: './media/logo.jpg' },
                    caption: `🧪 Оплата успешно подтверждена!\n\n💉 Ключ <code>${key}</code>\n\n⏱️ Действует до ${new Date(expirationDate).toLocaleString()}`,
                    parse_mode: 'HTML',
                },
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🏥 Главное меню', callback_data: 'back_to_menu' }] // Кнопка назад
                        ]
                    }
                }
            );
            delete userSessions[userId]?.payment;
        } else {
            ctx.reply('Платеж не найден или сумма не совпадает.');
        }
    } catch (error) {
        console.error('Ошибка при проверке платежа:', error.response?.data || error);
        ctx.reply('Произошла ошибка при проверке платежа. Попробуйте позже.');
    }
});

bot.action(/^check_payment_ger_(.+)$/, async (ctx) => {
    console.log('Получено callback_data:', ctx.callbackQuery.data);
    const userId = ctx.from.id;
    const session = userSessions[userId];

    if (!session || !session.payment) {
        return ctx.reply('Вы ещё не начали процесс оплаты.');
    }

    const { label, amount } = session.payment;

    // Проверяем платеж через YooMoney API
    const currentDate = new Date().toISOString().split('T')[0];
    const apiUrl = 'https://yoomoney.ru/api/operation-history';
    const apiToken = process.env.YOOMONEY_API_TOKEN;

    try {
        const response = await axios.post(
            apiUrl,
            { label, from: currentDate, till: currentDate },
            { headers: { Authorization: `Bearer ${apiToken}` } }
        );

        const operations = response.data.operations;
        const payment = operations.find((op) => op.label === label);

        if (payment) {
            // Генерируем ключ
            const { key, expirationDate,id } = await generateOutlineKeyGer(amount);

            // Сохраняем покупку
            savePurchaseGer(userId, {
                purchaseDate: currentDate,
                expirationDate,
                accessKey: key,
                id: id,
                County: 'Germany',
            });

            await ctx.telegram.editMessageMedia(
                ctx.chat.id,
                userSessions[userId].lastMessageId, // Используем сохраненный ID сообщения
                null, // Не передаем новое caption
                { 
                    type: 'photo', 
                    media: { source: './media/logo.jpg' },
                    caption: `✅ Оплата успешно подтверждена!\n\n🔑 Ваш ключ: <code>${key}</code>\n\n📅 Действует до: ${new Date(expirationDate).toLocaleString()}`,
                    parse_mode: 'HTML',
                },
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }] // Кнопка назад
                        ]
                    }
                }
            );
            delete userSessions[userId]?.payment;
        } else {
            ctx.reply('Платеж не найден или сумма не совпадает.');
        }
    } catch (error) {
        console.error('Ошибка при проверке платежа:', error.response?.data || error);
        ctx.reply('Произошла ошибка при проверке платежа. Попробуйте позже.');
    }
});


const outlineApiUrlSwe = 'https://150.241.78.162:43648/3PugAuz6mn-trqnygiY1Zw';
const outlineApiUrlGer = 'https://150.241.71.36:48444/KCKqdq0cCk2EhtTdharWDA';

const loadPurchasesSwe = () => {
    try {
        const purchasesFilePath = './purchasesSwe.json';
        const purchases = JSON.parse(fs.readFileSync(purchasesFilePath, 'utf-8'));
        return purchases || {};
    } catch (error) {
        console.error('Ошибка при загрузке покупок:', error.message);
        return {};
    }
};

// Функция для сохранения покупок в файл
const savePurchasesSwe = (purchases) => {
    try {
        const purchasesFilePath = './purchasesSwe.json';
        fs.writeFileSync(purchasesFilePath, JSON.stringify(purchases, null, 2), 'utf-8');
        console.log('Покупки успешно сохранены.');
    } catch (error) {
        console.error('Ошибка при сохранении покупок:', error.message);
    }
};

const deleteOutlineKeyByIdSwe = async (id) => {
    try {
        const response = await axios.delete(
            `${outlineApiUrlSwe}/access-keys/${id}`, 
            {
                headers: { 'Content-Type': 'application/json' },
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
            }
        );

        if (response.status === 204) {
            console.log(`Ключ с ID ${id} успешно удалён.`);
            return true;
        } else {
            throw new Error(`Ошибка при удалении ключа: ${response.status}`);
        }
    } catch (error) {
        console.error(`Ошибка удаления ключа с ID ${id}:`, error.response?.data || error.message);
        return false;
    }
};

// Функция проверки истечения срока действия ключей
// Функция проверки истечения срока действия ключей
const checkAndDeleteExpiredKeysSwe = async (bot) => {
    console.log('Начинаем проверку сроков действия ключей...');
    const purchases = loadPurchasesSwe(); // Загружаем все покупки
    const now = new Date();

    for (const [userId, userPurchases] of Object.entries(purchases)) {
        // Проходим по всем покупкам пользователя
        for (let i = 0; i < userPurchases.length; i++) {
            const purchase = userPurchases[i];
            const expirationDate = new Date(purchase.expirationDate);

            if (expirationDate <= now) {
                console.log(`Срок действия ключа для пользователя ${userId} истёк. Удаляем ключ...`);

                // Удаляем ключ через Outline API по ID
                const keyDeleted = await deleteOutlineKeyByIdSwe(purchase.id); // Используем ID для удаления ключа

                if (keyDeleted) {
                    // Уведомляем пользователя об истечении срока действия
                    try {
                        await bot.telegram.sendMessage(
                            userId,
                            `🔑 Срок действия вашего VPN-ключа истёк.\nСтрана: Швеция 🇸🇪\nЕсли хотите продлить доступ, пожалуйста, оформите новый платеж.`
                        );
                    } catch (error) {
                        console.error(`Ошибка при отправке уведомления пользователю ${userId}:`, error.message);
                    }

                    // Удаляем просроченную покупку из массива
                    userPurchases.splice(i, 1);
                    i--; // Корректируем индекс, чтобы не пропустить элемент после удаления
                }
            }
        }

        // Если у пользователя больше нет покупок, удаляем его запись
        if (userPurchases.length === 0) {
            delete purchases[userId];
        }
    }

    // Сохраняем изменения в файл
    savePurchasesSwe(purchases);
};




// Функция для загрузки покупок из файла
const loadPurchasesGer = () => {
    try {
        const purchasesFilePath = './purchasesGer.json';
        const purchases = JSON.parse(fs.readFileSync(purchasesFilePath, 'utf-8'));
        return purchases || {};
    } catch (error) {
        console.error('Ошибка при загрузке покупок:', error.message);
        return {};
    }
};

// Функция для сохранения покупок в файл
const savePurchasesGer = (purchases) => {
    try {
        const purchasesFilePath = './purchasesGer.json';
        fs.writeFileSync(purchasesFilePath, JSON.stringify(purchases, null, 2), 'utf-8');
        console.log('Покупки успешно сохранены.');
    } catch (error) {
        console.error('Ошибка при сохранении покупок:', error.message);
    }
};

const deleteOutlineKeyByIdGer = async (id) => {
    try {
        const response = await axios.delete(
            `${outlineApiUrlGer}/access-keys/${id}`, 
            {
                headers: { 'Content-Type': 'application/json' },
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
            }
        );

        if (response.status === 204) {
            console.log(`Ключ с ID ${id} успешно удалён.`);
            return true;
        } else {
            throw new Error(`Ошибка при удалении ключа: ${response.status}`);
        }
    } catch (error) {
        console.error(`Ошибка удаления ключа с ID ${id}:`, error.response?.data || error.message);
        return false;
    }
};

// Функция проверки истечения срока действия ключей
// Функция проверки истечения срока действия ключей
const checkAndDeleteExpiredKeysGer = async (bot) => {
    console.log('Начинаем проверку сроков действия ключей...');
    const purchases = loadPurchasesGer(); // Загружаем все покупки
    const now = new Date();

    for (const [userId, userPurchases] of Object.entries(purchases)) {
        // Проходим по всем покупкам пользователя
        for (let i = 0; i < userPurchases.length; i++) {
            const purchase = userPurchases[i];
            const expirationDate = new Date(purchase.expirationDate);

            if (expirationDate <= now) {
                console.log(`Срок действия ключа для пользователя ${userId} истёк. Удаляем ключ...`);

                // Удаляем ключ через Outline API по имени
                const keyDeleted = await deleteOutlineKeyByIdGer(purchase.id); // Используем ID для удаления ключа

                if (keyDeleted) {
                    // Уведомляем пользователя об истечении срока действия
                    try {
                        await bot.telegram.sendMessage(
                            userId,
                            `🔑 Срок действия вашего VPN-ключа истёк.\nСтрана: Германия 🇩🇪\nЕсли хотите продлить доступ, пожалуйста, оформите новый платеж.`
                        );
                    } catch (error) {
                        console.error(`Ошибка при отправке уведомления пользователю ${userId}:`, error.message);
                    }

                    // Удаляем просроченную покупку из массива
                    userPurchases.splice(i, 1);
                    i--; // Корректируем индекс, чтобы не пропустить элемент после удаления
                }
            }
        }

        // Если у пользователя больше нет покупок, удаляем его запись
        if (userPurchases.length === 0) {
            delete purchases[userId];
        }
    }

    // Сохраняем изменения в файл
    savePurchasesGer(purchases);
};

// Периодическая проверка (каждые 24 часа)
setInterval(() => {
    checkAndDeleteExpiredKeysGer(bot);

}, 24 * 60 * 60 * 1000); // 24 часа в миллисекундах

setInterval(() => {
    checkAndDeleteExpiredKeysSwe(bot);
}, 24 * 60 * 60 * 1000);

// Запуск бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
bot.launch();
