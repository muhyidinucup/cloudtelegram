import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Menerima request upload...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file yang diupload' },
        { status: 400 }
      );
    }
    
    console.log('📄 Nama file:', file.name);
    console.log('📏 Ukuran:', file.size, 'bytes');
    
    // Kirim file ke Worker server
    const workerFormData = new FormData();
    workerFormData.append('file', file);
    
    const workerResponse = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: workerFormData,
    });
    
    if (!workerResponse.ok) {
      const error = await workerResponse.json();
      throw new Error(error.error || 'Upload gagal');
    }
    
    const result = await workerResponse.json();
    
    console.log('✅ Upload berhasil!');
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload gagal' },
      { status: 500 }
    );
  }
}