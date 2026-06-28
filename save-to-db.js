require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔌 Connecting to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function saveFileMetadata(fileData) {
  try {
    console.log('💾 Menyimpan metadata ke Supabase...');
    
    const { data, error } = await supabase
      .from('files')
      .insert([
        {
          user_id: process.env.CHAT_ID,
          file_name: fileData.fileName,
          file_size: fileData.fileSize,
          file_id: fileData.fileId,
          message_id: fileData.messageId,
          mime_type: 'text/plain'
        }
      ])
      .select();
    
    if (error) {
      console.error('❌ Error Supabase:', error.message);
      throw error;
    }
    
    console.log('✅ Metadata berhasil disimpan!');
    console.log('📋 Data:', JSON.stringify(data, null, 2));
    
    return data;
    
  } catch (error) {
    console.error('❌ Error save metadata:', error.message);
    throw error;
  }
}

// Test dengan data dummy
const testData = {
  fileName: 'test.txt',
  fileSize: 54,
  fileId: 'BQACAgUAAxkDAAMEakCyUoUufOo0Dgll8vFOFEBDQj0AAgQjAAIYBwABVps_Cz_agSEEPAQ',
  messageId: 4
};

saveFileMetadata(testData)
  .then(() => {
    console.log('\n✅ Test selesai!');
  })
  .catch(err => {
    console.error('Test gagal:', err);
  });