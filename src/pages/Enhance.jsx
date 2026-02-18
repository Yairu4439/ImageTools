import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FileUploader, Button, Card, Spinner, ImageComparisonSlider } from '@/components/ui';
import { ArrowDownTrayIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import EnhanceWorker from '../workers/enhance.worker.js?worker';

const DEFAULT_PARAMS = { sharpness: 0, contrast: 0, brightness: 0, saturation: 0 };

const SLIDERS = [
    { key: 'sharpness', min: 0, max: 200, labelKey: 'Sharpness' },
    { key: 'contrast', min: -100, max: 100, labelKey: 'Contrast' },
    { key: 'brightness', min: -100, max: 100, labelKey: 'Brightness' },
    { key: 'saturation', min: -100, max: 100, labelKey: 'Saturation' },
];

const Enhance = () => {
    const { t } = useTranslation();
    const [originalUrl, setOriginalUrl] = useState(null);
    const [processedUrl, setProcessedUrl] = useState(null);
    const [params, setParams] = useState(DEFAULT_PARAMS);
    const [processing, setProcessing] = useState(false);

    const workerRef = useRef(null);
    const imgRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        return () => {
            if (originalUrl) URL.revokeObjectURL(originalUrl);
            if (processedUrl) URL.revokeObjectURL(processedUrl);
            if (workerRef.current) workerRef.current.terminate();
        };
    }, []);

    const getImageData = useCallback(() => {
        const img = imgRef.current;
        if (!img) return null;
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }, []);

    const processImage = useCallback((newParams) => {
        const imageData = getImageData();
        if (!imageData) return;

        setProcessing(true);

        if (workerRef.current) workerRef.current.terminate();
        const worker = new EnhanceWorker();
        workerRef.current = worker;

        worker.onmessage = (e) => {
            const result = e.data.imageData;
            const canvas = document.createElement('canvas');
            canvas.width = result.width;
            canvas.height = result.height;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(result, 0, 0);

            canvas.toBlob((blob) => {
                if (processedUrl) URL.revokeObjectURL(processedUrl);
                setProcessedUrl(URL.createObjectURL(blob));
                setProcessing(false);
            }, 'image/png');
        };

        worker.onerror = () => {
            setProcessing(false);
        };

        worker.postMessage(
            { imageData, params: newParams },
            [imageData.data.buffer]
        );
    }, [getImageData, processedUrl]);

    const handleParamChange = useCallback((key, value) => {
        const newParams = { ...params, [key]: Number(value) };
        setParams(newParams);

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            processImage(newParams);
        }, 300);
    }, [params, processImage]);

    const handleFileSelect = (file) => {
        if (originalUrl) URL.revokeObjectURL(originalUrl);
        if (processedUrl) URL.revokeObjectURL(processedUrl);

        const url = URL.createObjectURL(file);
        setOriginalUrl(url);
        setProcessedUrl(null);
        setParams(DEFAULT_PARAMS);

        const img = new Image();
        img.onload = () => {
            imgRef.current = img;
        };
        img.src = url;
    };

    const handleDownload = () => {
        if (!processedUrl) return;
        const a = document.createElement('a');
        a.href = processedUrl;
        a.download = 'enhanced-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleReset = () => {
        if (originalUrl) URL.revokeObjectURL(originalUrl);
        if (processedUrl) URL.revokeObjectURL(processedUrl);
        if (workerRef.current) workerRef.current.terminate();
        setOriginalUrl(null);
        setProcessedUrl(null);
        setParams(DEFAULT_PARAMS);
        imgRef.current = null;
    };

    const handleResetParams = () => {
        setParams(DEFAULT_PARAMS);
        processImage(DEFAULT_PARAMS);
    };

    const hasChanges = Object.keys(DEFAULT_PARAMS).some(k => params[k] !== DEFAULT_PARAMS[k]);

    return (
        <div className="page-container">
            <h1 className="page-title"><SparklesIcon className="h-8 w-8" /> {t('Enhance Image')}</h1>

            {!originalUrl ? (
                <FileUploader onFileSelect={handleFileSelect} />
            ) : (
                <div className="enhance-layout">
                    <Card className="enhance-controls">
                        <h3>{t('Adjustments')}</h3>

                        {SLIDERS.map(({ key, min, max, labelKey }) => (
                            <div key={key} className="enhance-slider-row">
                                <div className="enhance-slider-header">
                                    <label>{t(labelKey)}</label>
                                    <span className="enhance-slider-value">{params[key]}</span>
                                </div>
                                <input
                                    type="range"
                                    min={min}
                                    max={max}
                                    value={params[key]}
                                    onChange={(e) => handleParamChange(key, e.target.value)}
                                />
                            </div>
                        ))}

                        {hasChanges && (
                            <button className="enhance-reset-params" onClick={handleResetParams}>
                                {t('Reset Adjustments')}
                            </button>
                        )}

                        <div className="enhance-actions">
                            <Button
                                variant="primary"
                                onClick={handleDownload}
                                disabled={!processedUrl || processing}
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" /> {t('Download')}
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                <ArrowPathIcon className="h-5 w-5" /> {t('Upload New')}
                            </Button>
                        </div>
                    </Card>

                    <Card className="enhance-preview">
                        {processing && (
                            <div className="enhance-processing">
                                <Spinner />
                                <p>{t('Enhancing...')}</p>
                            </div>
                        )}

                        {processedUrl && !processing ? (
                            <ImageComparisonSlider
                                beforeSrc={originalUrl}
                                afterSrc={processedUrl}
                            />
                        ) : !processing ? (
                            <div className="enhance-original-preview">
                                <img src={originalUrl} alt={t('Original')} />
                                <p className="enhance-hint">{t('Adjust the sliders to enhance your image')}</p>
                            </div>
                        ) : null}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Enhance;
