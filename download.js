require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api').default;
const fs = require('fs');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });

async function downloadFile(fileId, savePath) {
  try {
    console.log('⬇️ Mendownload file ID:', fileId);
    
    // Download file dari Telegram
    const downloadedPath = await bot.downloadFile(fileId, './');
    
    console.log('📥 File terdownload ke:', downloadedPath);
    
    // Rename file ke nama yang diinginkan
    if (downloadedPath !== savePath) {
      fs.renameSync(downloadedPath, savePath);
      console.log('📝 File di-rename ke:', savePath);
    }
    
    console.log('✅ Download berhasil!');
    console.log('💾 Tersimpan di:', savePath);
    
    return savePath;
    
  } catch (error) {
    console.error('❌ Error download:', error.message);
    throw error;
  }
}

const fileId = process.argv[2];
const savePath = process.argv[3] || './hasil-download.txt';

if (!fileId) {
  console.log('❌ Gunakan: node download.js <file_id> [save_path]');
  console.log('Contoh: node download.js BQACAgUAAxkDAAMEakCyUoUufOo0Dgll8vFOFEBDQj0AAgQjAAIYBwABVps_Cz_agSEEPAQ ./hasil-download.txt');
  process.exit(1);
}

downloadFile(fileId, savePath)
  .then(result => {
    console.log('\n✅ File berhasil didownload ke:', result);
  })
  .catch(err => {
    console.error('Download gagal:', err);
  });