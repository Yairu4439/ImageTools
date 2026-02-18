import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from '@/utils/canvasPreview';
import { FileUploader, Button, Card } from '@/components/ui';
import { ArrowDownTrayIcon, ArrowPathIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const CROP_RATIOS = [
    { key: 'free', label: null, aspect: undefined },
    { key: '1_1', label: '1:1', aspect: 1 },
    { key: '16_9', label: '16:9', aspect: 16 / 9 },
    { key: '9_16', label: '9:16', aspect: 9 / 16 },
    { key: '4_3', label: '4:3', aspect: 4 / 3 },
    { key: '3_2', label: '3:2', aspect: 3 / 2 },
    { key: '2_3', label: '2:3', aspect: 2 / 3 },
    { key: '21_9', label: '21:9', aspect: 21 / 9 },
];

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            { unit: '%', width: 90 },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

const Crop = () => {
    const { t } = useTranslation();
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef(null);
    const imgRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [aspect, setAspect] = useState(undefined);
    const [activeKey, setActiveKey] = useState('free');
    const [cropDimensions, setCropDimensions] = useState(null);

    // Debounce preview to avoid excessive canvas redraws
    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                canvasPreview(
                    imgRef.current,
                    previewCanvasRef.current,
                    completedCrop,
                );

                const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
                const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
                setCropDimensions({
                    width: Math.round(completedCrop.width * scaleX),
                    height: Math.round(completedCrop.height * scaleY),
                });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [completedCrop]);

    function onSelectFile(file) {
        if (file) {
            setCrop(undefined);
            setCompletedCrop(undefined);
            setCropDimensions(null);
            setActiveKey('free');
            setAspect(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || ''),
            );
            reader.readAsDataURL(file);
        }
    }

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        const initialAspect = aspect || width / height;
        setCrop(centerAspectCrop(width, height, initialAspect));
    }

    function handleRatioSelect(key, newAspect) {
        setActiveKey(key);
        setAspect(newAspect);
        if (imgRef.current && newAspect) {
            const { width, height } = imgRef.current;
            setCrop(centerAspectCrop(width, height, newAspect));
        }
    }

    function handleDownload() {
        if (!previewCanvasRef.current) return;

        previewCanvasRef.current.toBlob((blob) => {
            if (!blob) return;
            const previewUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.download = 'cropped-image.png';
            anchor.href = previewUrl;
            anchor.click();
            URL.revokeObjectURL(previewUrl);
        });
    }

    function handleReset() {
        setImgSrc('');
        setCrop(undefined);
        setCompletedCrop(undefined);
        setCropDimensions(null);
    }

    return (
        <div className="page-container">
            <h1 className="page-title"><ScissorsIcon className="h-8 w-8" /> {t('Crop Image')}</h1>

            {!imgSrc ? (
                <FileUploader onFileSelect={onSelectFile} />
            ) : (
                <div className="crop-layout">
                    <Card style={{ overflow: 'visible' }}>

                        <div className="crop-toolbar">
                            <label>{t('Aspect Ratio')}</label>
                            <div className="aspect-chips">
                                {CROP_RATIOS.map(({ key, label, aspect: ratioValue }) => (
                                    <button
                                        key={key}
                                        className={`aspect-chip ${activeKey === key ? 'active' : ''}`}
                                        onClick={() => handleRatioSelect(key, ratioValue)}
                                    >
                                        {key === 'free' ? t('Free') : label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                            style={{ maxHeight: '600px' }}
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={imgSrc}
                                onLoad={onImageLoad}
                                style={{ maxHeight: '600px', width: 'auto' }}
                            />
                        </ReactCrop>


                        <div className="crop-footer">
                            <Button variant="outline" onClick={handleReset}>
                                <ArrowPathIcon className="h-5 w-5" /> {t('Upload New')}
                            </Button>
                            {cropDimensions && (
                                <span className="crop-dimensions">
                                    {t('Result')}: <strong>{cropDimensions.width}×{cropDimensions.height} px</strong>
                                </span>
                            )}
                        </div>
                    </Card>

                    <Card className="crop-preview">
                        <h3>{t('Preview')}</h3>
                        {!!completedCrop && (
                            <>
                                <div className="crop-preview-canvas-wrap">
                                    <canvas
                                        ref={previewCanvasRef}
                                        style={{
                                            objectFit: 'contain',
                                            width: completedCrop.width,
                                            height: completedCrop.height,
                                            maxWidth: '100%',
                                            maxHeight: '300px'
                                        }}
                                    />
                                </div>
                                <div style={{ marginTop: '1.5rem' }}>
                                    <Button variant="primary" onClick={handleDownload}>
                                        <ArrowDownTrayIcon className="h-5 w-5" /> {t('Download Crop')}
                                    </Button>
                                </div>
                            </>
                        )}
                        {!completedCrop && <p className="crop-dimensions">{t('Select an area to crop')}</p>}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Crop;
