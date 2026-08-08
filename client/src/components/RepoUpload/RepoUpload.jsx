import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Loader from '../common/Loader';
import api from '../../services/api';

export default function RepoUpload({ onUploadComplete }) {
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const validateGitHubUrl = (url) => {
    const regex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
    return regex.test(url);
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!validateGitHubUrl(url)) {
      toast.error('Please enter a valid GitHub repository URL');
      return;
    }
    setUploading(true);
    try {
      const res = await api.post('/repos/analyze', { url, type: 'github' });
      toast.success('Repository analysis started!');
      if (onUploadComplete) {
        onUploadComplete(res.data.repo);
      } else {
        navigate(`/repo/${res.data.repo._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze repository');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    await uploadFile(files[0]);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    if (!file.name.endsWith('.zip')) {
      toast.error('Please upload a ZIP file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/repos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      toast.success('ZIP uploaded and analysis started!');
      if (onUploadComplete) {
        onUploadComplete(res.data.repo);
      } else {
        navigate(`/repo/${res.data.repo._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (uploading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader size="lg" />
        <p className="mt-4 text-gray-600 font-medium">
          {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Analyzing repository...'}
        </p>
        <p className="text-sm text-gray-400 mt-1">This may take a minute depending on repo size</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* GitHub URL Input */}
      <form onSubmit={handleUrlSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            />
          </div>
          <Button type="submit" className="shrink-0">
            Analyze
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 ml-1">Paste a public GitHub repository URL</p>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-sm text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-gray-700 font-medium mb-1">
          {isDragging ? 'Drop your ZIP file here' : 'Drag & drop a ZIP file'}
        </p>
        <p className="text-sm text-gray-400">or click to browse • Max 50MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Supported formats hint */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust'].map(lang => (
          <span key={lang} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
            {lang}
          </span>
        ))}
      </div>
    </div>
  );
}