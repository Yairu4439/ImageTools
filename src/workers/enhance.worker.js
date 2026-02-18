import { enhanceImage } from '../utils/imageEnhance.js';

self.onmessage = function (e) {
    const { imageData, params } = e.data;
    const result = enhanceImage(imageData, params);
    self.postMessage({ imageData: result }, [result.data.buffer]);
};
