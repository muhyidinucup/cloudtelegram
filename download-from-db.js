require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api').default;
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Telegram setup
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadFromDb(fileId, savePath) {
  try {
    console.log('🔍 Mencari file dengan ID:', fileId);
    
    // Step 1: Ambil data file dari Supabase
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();
    
    if (error) {
      console.error('❌ File tidak ditemukan:', error.message);
      throw error;
    }
    
    console.log('✅ File ditemukan!');
    console.log('📄 Nama:', data.file_name);
    console.log('📏 Ukuran:', data.file_size, 'bytes');
    console.log('🔗 Telegram File ID:', data.file_id);
    
    // Step 2: Download dari Telegram
    console.log('\n⬇️ Downloading dari Telegram...');
    
    const downloadedPath = await bot.downloadFile(data.file_id, './');
    
    // Rename file ke nama asli
    const finalPath = savePath || `./${data.file_name}`;
    if (downloadedPath !== finalPath) {
      fs.renameSync(downloadedPath, finalPath);
    }
    
    console.log('✅ Download berhasil!');
    console.log('💾 Tersimpan di:', finalPath);
    
    return {
      metadata: data,
      savedTo: finalPath
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Main execution
const fileId = process.argv[2];
const savePath = process.argv[3];

if (!fileId) {
  console.log('❌ Gunakan: node download-from-db.js <file_id> [save_path]');
  console.log('Contoh: node download-from-db.js 1 ./hasil.txt');
  console.log('\n💡 Tip: Jalankan "node list-files.js" dulu untuk lihat daftar file ID');
  process.exit(1);
}

downloadFromDb(fileId, savePath)
  .then(result => {
    console.log('\n🎉 SELESAI! File berhasil didownload.');
    console.log('📊 Metadata:', JSON.stringify(result.metadata, null, 2));
  })
  .catch(err => {
    console.error('❌ Gagal:', err);
  });