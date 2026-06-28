require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api').default;
const fs = require('fs');
const path = require('path');

const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

async function uploadFile(filePath) {
  try {
    console.log('📤 Mengupload file:', filePath);
    
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);
    
    const response = await bot.sendDocument(chatId, fileStream, {}, {
      filename: fileName,
      contentType: 'application/octet-stream'
    });
    
    const fileId = response.document.file_id;
    const fileSize = response.document.file_size;
    
    console.log('✅ Upload berhasil!');
    console.log('📄 File ID:', fileId);
    console.log('📏 Ukuran:', fileSize, 'bytes');
    console.log('🔗 Message ID:', response.message_id);
    
    return {
      fileId: fileId,
      fileName: fileName,
      fileSize: fileSize,
      messageId: response.message_id
    };
    
  } catch (error) {
    console.error('❌ Error upload:', error.message);
    throw error;
  }
}

const testFilePath = process.argv[2];

if (!testFilePath) {
  console.log('❌ Gunakan: node upload.js <path-ke-file>');
  console.log('Contoh: node upload.js ./test.txt');
  process.exit(1);
}

uploadFile(testFilePath)
  .then(result => {
    console.log('\n📋 Hasil lengkap:', JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.error('Upload gagal:', err);
  });