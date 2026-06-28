require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listFiles(userId = null) {
  try {
    console.log('📋 Mengambil daftar file dari Supabase...');
    
    let query = supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Kalau ada userId, filter berdasarkan user
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error Supabase:', error.message);
      throw error;
    }
    
    console.log('✅ Berhasil mengambil', data.length, 'file');
    
    if (data.length === 0) {
      console.log('📭 Belum ada file yang diupload');
      return [];
    }
    
    console.log('\n📂 Daftar file:');
    data.forEach((file, index) => {
      console.log(`\n${index + 1}. ${file.file_name}`);
      console.log(`   ID: ${file.id}`);
      console.log(`   Ukuran: ${file.file_size} bytes`);
      console.log(`   File ID: ${file.file_id}`);
      console.log(`   Upload: ${file.created_at}`);
    });
    
    return data;
    
  } catch (error) {
    console.error('❌ Error list files:', error.message);
    throw error;
  }
}

// Test: ambil semua file
listFiles()
  .then(() => {
    console.log('\n✅ Selesai!');
  })
  .catch(err => {
    console.error('Gagal:', err);
  });