import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './FileUpload.css';

function FileUpload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef();

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setDownloadUrl('');
    setError('');
    setSuccess(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      setDownloadUrl('');
      setError('');
      setSuccess(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClickDropzone = () => {
    inputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!files.length) {
      setError('请先选择文件');
      return;
    }
    setUploading(true);
    setError('');
    setDownloadUrl('');
    setSuccess(false);
    setProgress(0);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await axios.post('/api/upload', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        }
      });
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const reader = new FileReader();
        reader.onload = () => {
          const errorData = JSON.parse(reader.result);
          setError(`处理失败: ${errorData.detail || '未知错误'}`);
        };
        reader.readAsText(response.data);
        return;
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
      setSuccess(true);
    } catch (err) {
      let errorMessage = '上传或转换失败，请重试';
      if (err.response) {
        if (err.response.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              setError(`处理失败: ${errorData.detail || '服务器错误'}`);
            } catch (e) {
              setError(errorMessage);
            }
          };
          reader.readAsText(err.response.data);
          return;
        } else if (err.response.data && err.response.data.detail) {
          errorMessage = `处理失败: ${err.response.data.detail}`;
        }
      } else if (err.request) {
        errorMessage = '无法连接到服务器，请检查后端是否运行';
      } else {
        errorMessage = `请求错误: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <motion.div className="upload-card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.4,2,0.6,1] }}>
      <div
        className={`upload-dropzone${dragActive ? ' dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClickDropzone}
      >
        <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><rect width="48" height="48" rx="24" fill="#e3e8ee"/><path d="M24 33V15M24 15l-7 7m7-7l7 7" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <div style={{marginTop:8}}>{dragActive ? '松开文件以上传' : '点击或拖拽文件到此处'}</div>
        <input ref={inputRef} type="file" name="files" multiple style={{ display: 'none' }} onChange={handleFileChange} />
      </div>
      <AnimatePresence>
        {files.length > 0 && (
          <motion.ul className="file-list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            {files.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      {uploading && (
        <div className="progress-bar-bg">
          <motion.div className="progress-bar" style={{ width: `${progress}%` }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: [0.4,2,0.6,1] }} />
        </div>
      )}
      <motion.button
        className="upload-btn"
        onClick={handleSubmit}
        disabled={uploading}
        whileHover={!uploading ? { scale: 1.06 } : {}}
        whileTap={!uploading ? { scale: 0.98 } : {}}
      >
        {uploading ? '正在转换...' : '开始转换'}
      </motion.button>
      <AnimatePresence>
        {error && (
          <motion.div className="upload-feedback error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            {error}
          </motion.div>
        )}
        {success && downloadUrl && (
          <motion.div className="upload-feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <a href={downloadUrl} download="processed_files.zip">下载转换结果</a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default FileUpload;

