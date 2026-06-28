'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function UploadButton() {
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    try {
      setUploading(true);
      console.log('📤 Uploading:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload gagal');
      }
      
      const result = await response.json();
      
      console.log('✅ Upload berhasil!', result);
      alert(`File "${file.name}" berhasil diupload!`);
      
      // Refresh halaman untuk tampilkan file baru
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Upload gagal: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <Upload className="h-4 w-4 mr-2" />
      {uploading ? 'Uploading...' : 'Upload File'}
      <input
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        disabled={uploading}
      />
    </label>
  );
}