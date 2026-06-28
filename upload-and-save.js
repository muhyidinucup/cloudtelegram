require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api').default;
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Telegram setup
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, { polling: false });

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadAndSave(filePath) {
  try {
    console.log('📤 Mengupload file:', filePath);
    
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);
    
    // Step 1: Upload ke Telegram
    const response = await bot.sendDocument(chatId, fileStream, {}, {
      filename: fileName,
      contentType: 'application/octet-stream'
    });
    
    const fileId = response.document.file_id;
    const fileSize = response.document.file_size;
    const messageId = response.message_id;
    
    console.log('✅ Upload ke Telegram berhasil!');
    console.log('📄 File ID:', fileId);
    console.log('📏 Ukuran:', fileSize, 'bytes');
    console.log('🔗 Message ID:', messageId);
    
    // Step 2: Simpan metadata ke Supabase
    console.log('\n💾 Menyimpan metadata ke Supabase...');
    
    const { data, error } = await supabase
      .from('files')
      .insert([
        {
          user_id: chatId,
          file_name: fileName,
          file_size: fileSize,
          file_id: fileId,
          message_id: messageId,
          mime_type: 'text/plain' // Untuk sementara hardcoded
        }
      ])
      .select();
    
    if (error) {
      console.error('❌ Error Supabase:', error.message);
      throw error;
    }
    
    console.log('✅ Metadata berhasil disimpan ke Supabase!');
    console.log('📋 Data ID:', data[0].id);
    
    return {
      telegram: {
        fileId: fileId,
        fileName: fileName,
        fileSize: fileSize,
        messageId: messageId
      },
      database: data[0]
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Main execution
const testFilePath = process.argv[2];

if (!testFilePath) {
  console.log('❌ Gunakan: node upload-and-save.js <path-ke-file>');
  console.log('Contoh: node upload-and-save.js ./test.txt');
  process.exit(1);
}

uploadAndSave(testFilePath)
  .then(result => {
    console.log('\n🎉 SELESAI! File berhasil diupload dan metadata tersimpan.');
    console.log('📊 Ringkasan:', JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.error('❌ Gagal:', err);
  });