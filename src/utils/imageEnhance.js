/**
 * Client-side image enhancement via Canvas 2D pixel manipulation.
 *
 * Pipeline: Brightness → Contrast → Saturation → Unsharp Mask (Sharpen)
 *
 * @param {ImageData} imageData - Source pixels (will not be mutated)
 * @param {Object}    params
 * @param {number}    params.sharpness  - 0–200 (0 = off, 100 = moderate, 200 = strong)
 * @param {number}    params.contrast   - –100 to +100
 * @param {number}    params.brightness - –100 to +100
 * @param {number}    params.saturation - –100 to +100
 * @returns {ImageData} New ImageData with enhancements applied
 */
export function enhanceImage(imageData, { sharpness = 0, contrast = 0, brightness = 0, saturation = 0 }) {
    const { width, height } = imageData;
    const src = new Uint8ClampedArray(imageData.data);
    const dst = new Uint8ClampedArray(src);

    applyBrightness(dst, brightness);
    applyContrast(dst, contrast);
    applySaturation(dst, saturation);

    if (sharpness > 0) {
        applyUnsharpMask(dst, width, height, sharpness);
    }

    return new ImageData(dst, width, height);
}

function applyBrightness(data, amount) {
    if (amount === 0) return;
    const offset = (amount / 100) * 255;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] + offset;
        data[i + 1] = data[i + 1] + offset;
        data[i + 2] = data[i + 2] + offset;
    }
}

function applyContrast(data, amount) {
    if (amount === 0) return;
    const factor = (259 * (amount + 255)) / (255 * (259 - amount));
    for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }
}

function applySaturation(data, amount) {
    if (amount === 0) return;
    const adjust = amount / 100;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        data[i] = gray + (r - gray) * (1 + adjust);
        data[i + 1] = gray + (g - gray) * (1 + adjust);
        data[i + 2] = gray + (b - gray) * (1 + adjust);
    }
}

/**
 * Unsharp Mask: sharpen = original + amount × (original – blurred)
 * Uses a 3×3 box blur as the base kernel for speed.
 */
function applyUnsharpMask(data, width, height, sharpness) {
    const amount = sharpness / 100;
    const len = data.length;
    const blurred = new Uint8ClampedArray(len);

    // 3×3 box blur
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let rSum = 0, gSum = 0, bSum = 0, count = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const nx = x + kx;
                    const ny = y + ky;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const idx = (ny * width + nx) * 4;
                        rSum += data[idx];
                        gSum += data[idx + 1];
                        bSum += data[idx + 2];
                        count++;
                    }
                }
            }
            const idx = (y * width + x) * 4;
            blurred[idx] = rSum / count;
            blurred[idx + 1] = gSum / count;
            blurred[idx + 2] = bSum / count;
            blurred[idx + 3] = data[idx + 3];
        }
    }

    // Unsharp mask: pixel + amount × (pixel – blurred)
    for (let i = 0; i < len; i += 4) {
        data[i] = data[i] + amount * (data[i] - blurred[i]);
        data[i + 1] = data[i + 1] + amount * (data[i + 1] - blurred[i + 1]);
        data[i + 2] = data[i + 2] + amount * (data[i + 2] - blurred[i + 2]);
    }
}
