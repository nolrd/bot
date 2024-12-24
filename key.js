require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { Telegraf } = require('telegraf');

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Конфигурация Outline API
const outlineApiConfigSwe = {
    apiUrl: "https://150.241.78.162:43648/3PugAuz6mn-trqnygiY1Zw",
    certSha256: "3997D10C910994D2E8605B6C2AFCAB1E3D6EC390BAA5818C93E2CD3E74CBF850",
};

// Путь к файлу с покупками
const purchasesFilePathSwe = './purchasesSwe.json';

// Генерация ключа Outline
const generateOutlineKeySwe = async (amount) => {
    const durationMapping = {
        15: 15 * 24 * 60 * 60 * 1000, // 15 дней
        30: 30 * 24 * 60 * 60 * 1000, // 1 месяц
        180: 180 * 24 * 60 * 60 * 1000, // 6 месяцев
        360: 365 * 24 * 60 * 60 * 1000, // 1 год
    };

    const duration = durationMapping[amount];
    if (!duration) throw new Error('Неверная сумма оплаты');

    const expirationDate = new Date(Date.now() + duration).toISOString();
    const uniqueId = `VPN-${Date.now()}`; // Уникальный ID

    try {
        const response = await axios.put(
            `${outlineApiConfigSwe.apiUrl}/access-keys/${uniqueId}`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': outlineApiConfigSwe.certSha256,
                },
                httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false,
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





(async () => {
    const userId = process.argv[2]; 
    const amount = parseInt(process.argv[3], 10); 

    if (!userId || !amount) {
        console.error('Использование: node script.js <userId> <amount>');
        process.exit(1);
    }

    try {
        console.log(`Создаём ключ для пользователя ${userId} на сумму ${amount}...`);
        const { key, expirationDate, id } = await generateOutlineKeySwe(amount);  
        savePurchaseSwe(userId, {
            purchaseDate: new Date().toISOString(),
            expirationDate,
            accessKey: key,
            id: id,  
            County: 'Sweden',
        });
        console.log(`Ключ успешно создан: ${key}`);

        
        const formattedExpirationDate = new Date(expirationDate).toLocaleDateString('ru-RU');

        
        await bot.telegram.sendMessage(userId, 
            `🛡️ Вам был выдан ключ: <code>${key}</code>\n\n⏳ Cрок действия до: <code>${formattedExpirationDate}</code>`, 
            { parse_mode: 'HTML' }
        );
        console.log(`Сообщение отправлено пользователю ${userId}`);
    } catch (err) {
        console.error('Ошибка:', err.message);
    }
})();