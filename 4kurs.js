// const { Markup } = require('telegraf');
// module.exports = (bot) => {
//     bot.hears('4 курс', (ctx) => {
//         ctx.reply(
//             'Добро пожаловать на 4 курс!',
//             Markup.keyboard([['Выбери задание']]) // Кнопка для выбора задания
//                 .resize() // Подгоняет клавиатуру под экран
//         );
//     });
//         // Обработка нажатия кнопки "Выбери задание"
//         bot.hears('Выбери задание', (ctx) => {
//             ctx.reply(
//                 'Выберите задание: \n1. Лох',
//                 Markup.keyboard([['1. Лох']]) // Кнопка для задания "1. Лох"
//                     .resize() // Подгоняет клавиатуру под экран
//             );
//         });
    
//         // Обработка нажатия на задание "1. Лох"
//         bot.hears('1. Лох', (ctx) => {
//             const filePath = path.join(__dirname, 'files', 'malikpidor.txt'); // Путь к файлу в папке "files"
    
//             ctx.reply(
//                 'Вы выбрали задание "Лох". Вот файл с заданием:',
//                 {
//                     reply_markup: {
//                         remove_keyboard: true, // Убираем клавиатуру
//                     }
//                 }
//             );
    
//             // Отправляем файл
//             ctx.replyWithDocument({ source: filePath });
//         });
// };