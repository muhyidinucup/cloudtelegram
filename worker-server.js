require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api'); // HAPUS .default
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup untuk handle file upload
const upload = multer({ dest: 'uploads/' });

// Telegram setup
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, { polling: false });

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint: Upload file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Menerima file upload...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    }
    
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    
    console.log('📄 Nama file:', fileName);
    console.log('📏 Ukuran:', fileSize, 'bytes');
    
    // Upload ke Telegram
    const fileStream = fs.createReadStream(filePath);
    const response = await bot.sendDocument(chatId, fileStream, {}, {
      filename: fileName,
      contentType: 'application/octet-stream'
    });
    
    const fileId = response.document.file_id;
    const messageId = response.message_id;
    
    console.log('✅ Upload ke Telegram berhasil!');
    
    // Simpan metadata ke Supabase
    const { data, error } = await supabase
      .from('files')
      .insert([
        {
          user_id: chatId,
          file_name: fileName,
          file_size: fileSize,
          file_id: fileId,
          message_id: messageId,
          mime_type: req.file.mimetype || 'application/octet-stream'
        }
      ])
      .select();
    
    if (error) {
      console.error('❌ Error Supabase:', error.message);
      throw error;
    }
    
    // Hapus file temporary
    fs.unlinkSync(filePath);
    
    console.log('✅ Metadata tersimpan ke Supabase!');
    
    res.json({
      success: true,
      message: 'File berhasil diupload',
      data: data[0]
    });
    
  } catch (error) {
    console.error('❌ Error upload:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint: Download file
app.get('/api/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    console.log('⬇️ Menerima request download untuk file ID:', fileId);
    
    // Ambil data file dari Supabase
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();
    
    if (error) {
      console.error('❌ File tidak ditemukan:', error.message);
      return res.status(404).json({ error: 'File tidak ditemukan' });
    }
    
    console.log('📄 Nama file:', data.file_name);
    
    // Download dari Telegram
    const downloadedPath = await bot.downloadFile(data.file_id, './downloads/');
    
    // Stream file ke client
    res.setHeader('Content-Disposition', `attachment; filename="${data.file_name}"`);
    res.setHeader('Content-Type', data.mime_type || 'application/octet-stream');
    
    const fileStream = fs.createReadStream(downloadedPath);
    fileStream.pipe(res);
    
    // Hapus file setelah selesai
    fileStream.on('end', () => {
      fs.unlinkSync(downloadedPath);
      console.log('✅ Download selesai!');
    });
    
  } catch (error) {
    console.error('❌ Error download:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create folders if not exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('downloads')) {
  fs.mkdirSync('downloads');
}

// Start server - PENTING: bind ke 0.0.0.0 untuk Koyeb
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Worker server berjalan di port ${PORT}`);
  console.log('📡 Menunggu request dari Next.js...');
});