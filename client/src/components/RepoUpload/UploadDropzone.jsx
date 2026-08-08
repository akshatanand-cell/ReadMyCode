import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileArchive, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { MAX_FILE_SIZE, SUPPORTED_ARCHIVE_TYPES } from '@/utils/constants';
import Card from '@/components/common/Card';

const UploadDropzone = ({ onFileSelect, className }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError(`File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      } else {
        setError('Invalid file type. Please upload a ZIP or archive file.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      onFileSelect?.(selectedFile);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-tar': ['.tar', '.tar.gz'],
      'application/gzip': ['.gz', '.tar.gz'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    setError(null);
    onFileSelect?.(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full', className)}>
      <motion.div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300',
          isDragActive && !isDragReject
            ? 'border-primary bg-primary/5'
            : isDragReject
            ? 'border-error bg-error/5'
            : file
            ? 'border-success bg-success/5'
            : 'border-border hover:border-border-light hover:bg-white/[0.02]'
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-success" />
              </div>
              <div>
                <p className="text-text-primary font-medium">{file.name}</p>
                <p className="text-sm text-text-secondary mt-0.5">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="flex items-center gap-1.5 text-sm text-error hover:text-error/80 transition-colors mt-1"
              >
                <X className="w-4 h-4" />
                Remove file
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
                isDragActive ? 'bg-primary/10' : 'bg-background-secondary'
              )}>
                {isDragActive ? (
                  <Upload className="w-7 h-7 text-primary animate-bounce" />
                ) : (
                  <FileArchive className="w-7 h-7 text-text-muted" />
                )}
              </div>
              <div>
                <p className="text-text-primary font-medium">
                  {isDragActive ? 'Drop your archive here' : 'Drag & drop your archive'}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  or <span className="text-primary hover:underline">click to browse</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {SUPPORTED_ARCHIVE_TYPES.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-background-secondary rounded text-xs text-text-muted font-mono"
                  >
                    {type}
                  </span>
                ))}
                <span className="text-xs text-text-muted">
                  up to {MAX_FILE_SIZE / 1024 / 1024}MB
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mt-3 text-error text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadDropzone;