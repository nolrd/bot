const axios = require('axios');
const qs = require('qs');
const { Telegraf } = require('telegraf');
const https = require('https');
const crypto = require('crypto');
require('dotenv').config();
const moment = require('moment');

// Инициализация агента и бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Логин в систему
class Session {
    constructor() {
        this._cookie = null;
    }

    async login() {
        const data = qs.stringify({
            username: 'DP5PU5JeeB',
            password: 'K00HT0oayJ',
        });

        const agent = new https.Agent({
            rejectUnauthorized: false, // Игнорируем самоподписанные сертификаты
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://45.159.248.196:56895/FuV4NVliDEVg727/login',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: data,
            httpsAgent: agent,
        };

        try {
            const response = await axios.request(config);
            const cookies = response.headers['set-cookie'];
            this._cookie = cookies.at(-1) || cookies[0];
            console.info("Session initialized");
        } catch (error) {
            console.error('Ошибка при логине:', error);
            throw new Error('Не удалось авторизоваться');
        }
    }

    getCookie() {
        return this._cookie;
    }
}

const session = new Session();

// Создание клиента
class ClientManager {
  constructor(cookie) {
      this._cookie = cookie;
  }

  generateRandomEmail(userId) {
      const randomPrefix = Math.floor(100 + Math.random() * 900); // Генерируем 3 случайные цифры
      return `${randomPrefix}${userId}UK`;
  }

  generateRandomId() {
      // Генерация случайного ID как строки (вместо числового)
      const randomId = (Math.random() + 1).toString(36).substring(7); // Генерация случайной строки
      console.log("Сгенерированный ID клиента: ", randomId); // Выводим ID для отладки
      return randomId;
  }

  async addClient(inboundId, options) {
      const agent = new https.Agent({
          rejectUnauthorized: false,
      });

      // Проверка на пустой ID
      if (!options.id) {
          console.error("Ошибка: ID клиента не был сгенерирован или пустой!");
          return null;
      }

      const data = {
          id: 1, // Используем переданное значение id
          settings: JSON.stringify({
              clients: [options],
          }),
      };

      const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://45.159.248.196:56895/FuV4NVliDEVg727/panel/api/inbounds/addClient',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Cookie: this._cookie,
          },
          httpsAgent: agent,
          data: data,
      };

      try {
          const response = await axios.request(config);
          console.info(`Client ${options.email} added.`);
          console.log('Ответ сервера при успешном создании клиента:', response.data);
          return response.data;
      } catch (error) {
          console.error('Ошибка при создании клиента:', error);
          if (error.response) {
              console.log('Ответ сервера:', error.response.data);
          }
          return null;
      }
  }
}

// Основной блок
(async () => {
  try {
      console.log('Авторизация...');
      await session.login();

      const userId = process.argv[2];
      const amount = parseInt(process.argv[3], 10);

      if (!userId || !amount) {
          console.error('Использование: node script.js <userId> <amount>');
          process.exit(1);
      }

      console.log(`Создаём клиента для пользователя ${userId} на сумму ${amount}...`);

      const clientManager = new ClientManager(session.getCookie());
      const email = clientManager.generateRandomEmail(userId);

      // Генерация случайного id
      const randomId = clientManager.generateRandomId();
      console.log(`Сгенерирован ID клиента: ${randomId}`);

      // Отправка запроса на создание клиента
      // Вычисление expiryTime в зависимости от amount
    const clientData = await clientManager.addClient(1, {
      id: randomId, // Генерация случайного id
      flow: "",
      email: email,
      limitIp: 1,
      totalGB: Infinity,
      expiryTime: 0, 
      enable: true,
      tgId: `${userId}`,
      subId: `${userId}`,
      reset: 0,
    });

      // Генерация ключа без проверки клиента
      const key = `vless://${randomId}@45.159.248.196:443?type=tcp&security=reality&pbk=pvtXT4_O32vCMLgNMzYN_TA2k63eul0jkMxeFMZ6_AY&fp=random&sni=yahoo.com&sid=3aee&spx=%2F#${email}`;

      // Отправка уведомления в Telegram
      await bot.telegram.sendMessage(
          userId,
          `🛡️ Вам был выдан ключ: <code>${key}</code>`,
          { parse_mode: 'HTML' }
      );
      console.log(`Ключ успешно создан и сообщение отправлено пользователю ${userId}`);
  } catch (err) {
      console.error('Ошибка:', err.message);
  }
})();
