import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const fileId = request.nextUrl.searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID tidak ditemukan' },
        { status: 400 }
      );
    }
    
    console.log('⬇️ Menerima request download untuk file ID:', fileId);
    
    // Request ke Worker server
    const workerResponse = await fetch(`http://localhost:3001/api/download/${fileId}`);
    
    if (!workerResponse.ok) {
      const error = await workerResponse.json();
      throw new Error(error.error || 'Download gagal');
    }
    
    // Get file metadata dari headers
    const contentDisposition = workerResponse.headers.get('content-disposition');
    const contentType = workerResponse.headers.get('content-type');
    
    // Extract filename dari content-disposition
    let fileName = 'downloaded-file';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) {
        fileName = match[1];
      }
    }
    
    console.log('📄 Streaming file:', fileName);
    
    // Stream file ke client
    const blob = await workerResponse.blob();
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Download gagal' },
      { status: 500 }
    );
  }
}