import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Before / After Image Comparison Slider
 *
 * @param {{ beforeSrc: string, afterSrc: string }} props
 */
const ImageComparisonSlider = ({ beforeSrc, afterSrc }) => {
    const { t } = useTranslation();
    const containerRef = useRef(null);
    const [position, setPosition] = useState(50);
    const isDragging = useRef(false);

    const getPosition = useCallback((clientX) => {
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = (x / rect.width) * 100;
        return Math.max(0, Math.min(100, pct));
    }, []);

    const handlePointerDown = useCallback((e) => {
        isDragging.current = true;
        setPosition(getPosition(e.clientX));
        containerRef.current.setPointerCapture(e.pointerId);
    }, [getPosition]);

    const handlePointerMove = useCallback((e) => {
        if (!isDragging.current) return;
        setPosition(getPosition(e.clientX));
    }, [getPosition]);

    const handlePointerUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    return (
        <div
            ref={containerRef}
            className="comparison-slider"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >

            <img
                src={beforeSrc}
                alt={t('Before')}
                className="comparison-slider__before"
                draggable={false}
            />


            <div
                className="comparison-slider__after-wrap"
                style={{ clipPath: `inset(0 0 0 ${position}%)` }}
            >
                {/* Checkerboard pattern visible through transparent areas */}
                <div className="comparison-slider__checkerboard" />
                <img
                    src={afterSrc}
                    alt={t('After')}
                    className="comparison-slider__after"
                    draggable={false}
                />
            </div>


            <div
                className="comparison-slider__divider"
                style={{ left: `${position}%` }}
            >
                <div className="comparison-slider__handle">
                    <span className="comparison-slider__handle-arrow comparison-slider__handle-arrow--left" />
                    <span className="comparison-slider__handle-arrow comparison-slider__handle-arrow--right" />
                </div>
            </div>


            <span className="comparison-slider__label comparison-slider__label--before">
                {t('Before')}
            </span>
            <span className="comparison-slider__label comparison-slider__label--after">
                {t('After')}
            </span>
        </div>
    );
};

export default ImageComparisonSlider;
