import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileUploader, Button, Card } from '@/components/ui';
import { ArrowDownTrayIcon, ArrowPathIcon, LockClosedIcon, LockOpenIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';


const ASPECT_RATIOS = [
    { key: 'free', label: 'Free', value: null },
    { key: '1_1', label: '1:1', value: 1 / 1 },
    { key: '16_9', label: '16:9', value: 16 / 9 },
    { key: '9_16', label: '9:16', value: 9 / 16 },
    { key: '4_3', label: '4:3', value: 4 / 3 },
    { key: '3_2', label: '3:2', value: 3 / 2 },
];

const Resize = () => {
    const { t } = useTranslation();


    const [originalImage, setOriginalImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [originalSpecs, setOriginalSpecs] = useState({ width: 0, height: 0, size: 0 });
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [quality, setQuality] = useState(90);
    const [format, setFormat] = useState('image/jpeg');
    const [aspectLocked, setAspectLocked] = useState(true);
    const [selectedRatio, setSelectedRatio] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [estimatedSize, setEstimatedSize] = useState(null);

    const canvasRef = useRef(null);
    const imgRef = useRef(null);

    useEffect(() => {
        return () => {
            if (originalImage) URL.revokeObjectURL(originalImage);
        };
    }, [originalImage]);


    const handleFileSelect = (file) => {
        if (originalImage) URL.revokeObjectURL(originalImage);
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setOriginalImage(url);

        const img = new Image();
        img.onload = () => {
            imgRef.current = img;
            setOriginalSpecs({
                width: img.width,
                height: img.height,
                size: (file.size / 1024).toFixed(2),
            });
            setWidth(img.width);
            setHeight(img.height);
            setFormat(file.type || 'image/jpeg');
            setSelectedRatio(null);
            setAspectLocked(true);
        };
        img.src = url;
    };


    const drawPreview = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;

        const w = parseInt(width) || 1;
        const h = parseInt(height) || 1;

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    setEstimatedSize((blob.size / 1024).toFixed(2));
                }
            },
            format,
            quality / 100
        );
    }, [width, height, quality, format]);

    useEffect(() => {
        drawPreview();
    }, [drawPreview]);


    const applyRatio = (ratio) => {
        if (!ratio) return; // Free
        const base = parseInt(width) || originalSpecs.width;
        setHeight(Math.round(base / ratio));
    };

    const handleRatioSelect = (ratio) => {
        setSelectedRatio(ratio);
        if (ratio) {
            setAspectLocked(true);
            applyRatio(ratio);
        }
    };

    const handleWidthChange = (val) => {
        const v = val === '' ? '' : parseInt(val);
        setWidth(v);
        if (aspectLocked && v && originalSpecs.width) {
            const ratio = selectedRatio || originalSpecs.width / originalSpecs.height;
            setHeight(Math.round(v / ratio));
        }
    };

    const handleHeightChange = (val) => {
        const v = val === '' ? '' : parseInt(val);
        setHeight(v);
        if (aspectLocked && v && originalSpecs.height) {
            const ratio = selectedRatio || originalSpecs.width / originalSpecs.height;
            setWidth(Math.round(v * ratio));
        }
    };


    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setProcessing(true);

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    const ext = format.split('/')[1] || 'png';
                    a.download = `resized-image.${ext}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
                setProcessing(false);
            },
            format,
            quality / 100
        );
    };

    const handleReset = () => {
        if (originalImage) URL.revokeObjectURL(originalImage);
        setOriginalImage(null);
        setImageFile(null);
        imgRef.current = null;
        setWidth('');
        setHeight('');
    };


    return (
        <div className="resize-page">
            <h1 className="page-title"><ArrowsPointingOutIcon className="h-8 w-8" /> {t('Resize Image')}</h1>

            {!originalImage ? (
                <FileUploader onFileSelect={handleFileSelect} />
            ) : (
                <Card>
                    <div className="resize-layout">

                        <div className="resize-settings">
                            <h3>{t('Settings')}</h3>


                            <div className="crop-toolbar">
                                <label>
                                    {t('Aspect Ratio')}
                                </label>
                                <div className="aspect-chips">
                                    {ASPECT_RATIOS.map(({ key, label, value }) => (
                                        <button
                                            key={key}
                                            className={`aspect-chip ${selectedRatio === value && (value !== null || selectedRatio === null && key === 'free') ? 'active' : ''}`}
                                            onClick={() => handleRatioSelect(value)}
                                        >
                                            {key === 'free' ? t('Free') : label}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            <div className="dimension-row">
                                <div className="dimension-field">
                                    <label>{t('Width (px)')}</label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(e) => handleWidthChange(e.target.value)}
                                        min="1"
                                    />
                                </div>

                                <button
                                    className={`lock-btn ${aspectLocked ? 'locked' : ''}`}
                                    onClick={() => setAspectLocked(!aspectLocked)}
                                    title={aspectLocked ? t('Unlock Aspect Ratio') : t('Lock Aspect Ratio')}
                                >
                                    {aspectLocked ? (
                                        <LockClosedIcon style={{ width: '1.1rem', height: '1.1rem' }} />
                                    ) : (
                                        <LockOpenIcon style={{ width: '1.1rem', height: '1.1rem' }} />
                                    )}
                                </button>

                                <div className="dimension-field">
                                    <label>{t('Height (px)')}</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => handleHeightChange(e.target.value)}
                                        min="1"
                                    />
                                </div>
                            </div>


                            <div className="quality-row">
                                <label>{t('Quality')} ({quality}%)</label>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={quality}
                                    onChange={(e) => setQuality(parseInt(e.target.value))}
                                />
                            </div>


                            <div className="resize-actions">
                                <Button variant="primary" onClick={handleDownload} disabled={processing}>
                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                    {processing ? t('Processing...') : t('Download')}
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    <ArrowPathIcon className="h-5 w-5" /> {t('Upload New')}
                                </Button>
                            </div>


                            <div className="resize-info">
                                {t('Original')}: <strong>{originalSpecs.width}×{originalSpecs.height}</strong> ({originalSpecs.size} KB)
                                <br />
                                {t('Result')}: <strong>{width || '?'}×{height || '?'}</strong>
                                {estimatedSize && <> — ~<strong>{estimatedSize} KB</strong></>}
                            </div>
                        </div>


                        <div className="resize-preview">
                            <canvas ref={canvasRef} className="resize-preview-canvas" />
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Resize;
