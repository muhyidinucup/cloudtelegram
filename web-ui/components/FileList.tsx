'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FileText, Download, Calendar, HardDrive } from 'lucide-react';

interface FileData {
  id: number;
  user_id: string;
  file_name: string;
  file_size: number;
  file_id: string;
  message_id: number;
  mime_type: string | null;
  created_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function FileList() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    try {
      console.log('📋 Fetching files from Supabase...');
      
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error:', error.message);
        throw error;
      }
      
      console.log('✅ Files loaded:', data);
      setFiles(data || []);
      
    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(file: FileData) {
    try {
      console.log('⬇️ Downloading file ID:', file.id);
      
      const response = await fetch(`/api/download?fileId=${file.id}`);
      
      if (!response.ok) {
        throw new Error('Download gagal');
      }
      
      // Convert response to blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download berhasil!');
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Download gagal: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat file...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada file</h3>
        <p className="mt-2 text-gray-600">Upload file pertama Anda untuk memulai</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          File Saya ({files.length})
        </h2>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {files.map((file) => (
          <li key={file.id} className="px-6 py-4 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <FileText className="h-10 w-10 text-blue-500" />
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file_name}
                  </p>
                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <HardDrive className="h-3 w-3 mr-1" />
                      {formatFileSize(file.file_size)}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(file.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="ml-4 flex-shrink-0 flex space-x-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}