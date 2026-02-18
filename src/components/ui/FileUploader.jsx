import React, { useRef, useState } from 'react';
import Button from './Button';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['JPG', 'PNG', 'WEBP', 'GIF', 'BMP', 'SVG'];
const MAX_SIZE_MB = 20;

const FileUploader = ({ onFileSelect, accept = "image/*", label }) => {
    const fileInputRef = useRef(null);
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    const validateFile = (file) => {
        if (!file) return false;

        if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
            setError(t('Invalid file type. Please upload an image.'));
            return false;
        }

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(t('File too large. Maximum size is {{max}} MB.', { max: MAX_SIZE_MB }));
            return false;
        }

        setError('');
        return true;
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && validateFile(file)) {
            onFileSelect(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            onFileSelect(file);
        }
    };

    return (
        <div
            className={`file-uploader ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept}
                style={{ display: 'none' }}
            />
            <div className="file-uploader__inner">
                <CloudArrowUpIcon className="h-12 w-12 text-secondary" />
                <p className="file-uploader__hint">{t('Drag & Drop your image here or')}</p>
                <Button onClick={handleButtonClick} variant="primary">
                    {label || t('Upload Image')}
                </Button>

                <p className="file-uploader__formats">
                    {t('Supported formats')}: {ALLOWED_EXTENSIONS.join(' · ')} — {t('Max')} {MAX_SIZE_MB}MB
                </p>

                {error && (
                    <p className="file-uploader__error">
                        ⚠ {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default FileUploader;
