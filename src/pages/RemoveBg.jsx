import React, { useState, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { FileUploader, Spinner, Button, ImageComparisonSlider } from '@/components/ui';
import { ArrowDownTrayIcon, ArrowPathIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const RemoveBg = () => {
    const { t } = useTranslation();
    const [originalImage, setOriginalImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Revoke object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (originalImage) URL.revokeObjectURL(originalImage);
            if (processedImage) URL.revokeObjectURL(processedImage);
        };
    }, [originalImage, processedImage]);

    const handleFileSelect = async (file) => {

        if (originalImage) URL.revokeObjectURL(originalImage);
        if (processedImage) URL.revokeObjectURL(processedImage);

        setOriginalImage(URL.createObjectURL(file));
        setProcessedImage(null);
        setError(null);
        setLoading(true);

        try {
            const blob = await removeBackground(file);
            const url = URL.createObjectURL(blob);
            setProcessedImage(url);
        } catch (err) {
            console.error("Error removing background:", err);
            setError(t("Failed to remove background. Please try another image."));
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (processedImage) {
            const a = document.createElement('a');
            a.href = processedImage;
            a.download = 'removed-bg.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const handleReset = () => {
        if (originalImage) URL.revokeObjectURL(originalImage);
        if (processedImage) URL.revokeObjectURL(processedImage);
        setOriginalImage(null);
        setProcessedImage(null);
        setError(null);
    };

    return (
        <div className="page-container">
            <h1 className="page-title"><PhotoIcon className="h-8 w-8" /> {t('Remove Background')}</h1>

            {!originalImage && !loading && (
                <FileUploader onFileSelect={handleFileSelect} />
            )}

            {loading && (
                <div className="loading-state">
                    <Spinner />
                    <p>{t('Processing image... This might take a moment.')}</p>
                </div>
            )}

            {error && (
                <div className="error-state">
                    {error}
                    <Button onClick={handleReset} variant="outline" style={{ marginTop: '0.5rem', display: 'block' }}>{t('Try Again')}</Button>
                </div>
            )}

            {originalImage && processedImage && !loading && !error && (
                <div>
                    <ImageComparisonSlider
                        beforeSrc={originalImage}
                        afterSrc={processedImage}
                    />

                    <div className="result-actions">
                        <Button variant="primary" onClick={handleDownload}>
                            <ArrowDownTrayIcon className="h-5 w-5" /> {t('Download')}
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                            <ArrowPathIcon className="h-5 w-5" /> {t('Upload New')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemoveBg;
